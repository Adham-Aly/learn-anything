#!/usr/bin/env node
// Render a guide's HTML to PDF with a headless Chromium-based browser, and
// report anything that would look wrong on the page.
//
//   node render-pdf.mjs guide.html [guide.pdf] [--browser <path>] [--timeout <seconds>] [--no-sandbox]
//
// No dependencies: finds Chrome, Chromium, Edge or Brave on this machine and
// drives it over the DevTools protocol.
//
// Exit codes: 0 the PDF is clean; 1 the PDF was written but has problems
// (listed on stderr); 2 the PDF could not be made.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const USAGE = 'usage: node render-pdf.mjs guide.html [guide.pdf] [--browser <path>] [--timeout <seconds>] [--no-sandbox]';

// CSS page-margin boxes, which the stylesheet uses for page numbers, need Chrome 131+.
const MIN_BROWSER_MAJOR = 131;

// Width of the text block when the page does not declare --page-content-width (A4 with 30mm side margins).
const DEFAULT_CONTENT_WIDTH_PX = 567;

class Fatal extends Error {}

function parseArgs(argv) {
  const options = { timeout: 90, sandbox: true };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') options.help = true;
    else if (arg === '--browser') options.browser = argv[++i];
    else if (arg === '--timeout') options.timeout = Number(argv[++i]);
    else if (arg === '--no-sandbox') options.sandbox = false;
    else if (arg.startsWith('--')) throw new Fatal(`unknown option ${arg}\n${USAGE}`);
    else positional.push(arg);
  }
  if (options.help) return options;
  if (positional.length < 1 || positional.length > 2) throw new Fatal(USAGE);
  if (!(options.timeout > 0)) throw new Fatal('--timeout takes a number of seconds');
  options.input = path.resolve(positional[0]);
  options.output = path.resolve(positional[1] ?? options.input.replace(/\.html?$/i, '') + '.pdf');
  if (!isFile(options.input)) throw new Fatal(`no such file: ${options.input}`);
  return options;
}

function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

function findBrowser(explicit) {
  const chosen = explicit || process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (chosen) {
    if (!isFile(chosen)) throw new Fatal(`no browser executable at ${chosen}`);
    return chosen;
  }

  const home = os.homedir();
  const candidates = [];
  if (process.platform === 'darwin') {
    for (const root of ['/Applications', path.join(home, 'Applications')]) {
      candidates.push(
        `${root}/Google Chrome.app/Contents/MacOS/Google Chrome`,
        `${root}/Chromium.app/Contents/MacOS/Chromium`,
        `${root}/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`,
        `${root}/Brave Browser.app/Contents/MacOS/Brave Browser`,
      );
    }
  } else if (process.platform === 'win32') {
    const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA];
    for (const root of roots.filter(Boolean)) {
      candidates.push(
        path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        path.join(root, 'Chromium', 'Application', 'chrome.exe'),
        path.join(root, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      );
    }
  } else {
    const names = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'brave-browser'];
    for (const dir of (process.env.PATH || '').split(path.delimiter).filter(Boolean)) {
      for (const name of names) candidates.push(path.join(dir, name));
    }
  }

  const found = candidates.find(isFile) ?? findDownloadedBrowser(home);
  if (found) return found;
  throw new Fatal(
    [
      'No Chromium-based browser found (looked for Chrome, Chromium, Edge and Brave).',
      'Either install one, or download a standalone Chrome with',
      '  npx --yes @puppeteer/browsers install chrome@stable',
      'and pass the executable path it prints as --browser <path> (or set CHROME_PATH).',
    ].join('\n'),
  );
}

// Browsers downloaded by Playwright or Puppeteer live in per-user caches.
function findDownloadedBrowser(home) {
  const caches = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.env.PUPPETEER_CACHE_DIR,
    path.join(home, '.cache', 'puppeteer'),
    path.join(home, '.cache', 'ms-playwright'),
    path.join(home, 'Library', 'Caches', 'ms-playwright'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright'),
  ].filter(Boolean);
  const executables = new Set(['chrome', 'chrome.exe', 'Chromium', 'Google Chrome for Testing']);
  const skipped = new Set(['Frameworks', 'Resources', 'Helpers', 'locales', 'lib', 'node_modules']);

  const matches = [];
  const walk = (dir, depth) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (depth < 8 && !skipped.has(entry.name)) walk(full, depth + 1);
      } else if (executables.has(entry.name)) {
        matches.push(full);
      }
    }
  };
  for (const cache of caches) walk(cache, 0);
  return matches.sort().at(-1);
}

// DevTools protocol over the browser's --remote-debugging-pipe: JSON messages
// separated by NUL bytes, written to fd 3 and read from fd 4.
class Connection {
  #writer;
  #pending = new Map();
  #handlers = [];
  #lastId = 0;

  constructor(child) {
    this.#writer = child.stdio[3];
    this.#writer.on('error', () => {});
    let chunks = [];
    child.stdio[4].on('data', (chunk) => {
      let start = 0;
      for (let end = chunk.indexOf(0, start); end !== -1; end = chunk.indexOf(0, start)) {
        chunks.push(chunk.subarray(start, end));
        this.#dispatch(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        chunks = [];
        start = end + 1;
      }
      if (start < chunk.length) chunks.push(chunk.subarray(start));
    });
    child.once('exit', () => {
      for (const { reject, method } of this.#pending.values()) reject(new Error(`browser exited during ${method}`));
      this.#pending.clear();
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.#lastId;
    const message = sessionId ? { id, method, params, sessionId } : { id, method, params };
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject, method });
      this.#writer.write(JSON.stringify(message) + '\0');
    });
  }

  on(handler) {
    this.#handlers.push(handler);
  }

  #dispatch(message) {
    if (message.id === undefined) {
      for (const handler of this.#handlers) handler(message);
      return;
    }
    const waiting = this.#pending.get(message.id);
    if (!waiting) return;
    this.#pending.delete(message.id);
    if (message.error) waiting.reject(new Error(`${waiting.method}: ${message.error.message}`));
    else waiting.resolve(message.result);
  }
}

// Runs in the page. Resolves once everything that changes the layout has settled.
async function settle() {
  if (window.guideReady) await window.guideReady;
  for (const image of document.images) image.loading = 'eager';
  const loading = [...document.images].filter((image) => !image.complete);
  await Promise.all(
    loading.map(
      (image) =>
        new Promise((done) => {
          image.addEventListener('load', done, { once: true });
          image.addEventListener('error', done, { once: true });
        }),
    ),
  );
  await document.fonts.ready;
  await new Promise((done) => setTimeout(done, 50));
}

// Runs in the page. Measures the width of the text block declared by the stylesheet.
function contentWidth(fallback) {
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;height:0;width:var(--page-content-width, ${fallback}px)`;
  document.body.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return Math.round(width) || fallback;
}

// Runs in the page, laid out at the width of the printed text block. Problems
// are definite defects; warnings are heuristics worth a look.
function inspect() {
  const problems = [];
  const warnings = [];
  const clip = (text, max = 70) => {
    const flat = String(text).replace(/\s+/g, ' ').trim();
    return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
  };
  const describe = (element) => {
    const tag = element.tagName.toLowerCase();
    const label = element.id ? `${tag}#${element.id}` : [tag, ...element.classList].join('.');
    const text = clip(element.textContent, 50);
    return text ? `<${label}> "${text}"` : `<${label}>`;
  };

  // Maths that KaTeX rejected, or never saw.
  for (const element of document.querySelectorAll('.katex-error')) {
    problems.push(`formula failed to parse: ${clip(element.textContent)}`);
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement.closest('.katex, pre, code, script, style, svg, textarea')) continue;
    const text = node.textContent;
    if (/\\\(|\\\[|\$\$/.test(text)) {
      problems.push(`maths left as raw text (unbalanced delimiters or braces?): ${clip(text)}`);
    } else if (/\$[^$\n]*[\\^_][^$\n]*\$/.test(text)) {
      problems.push(`maths written as $…$ is not typeset, write \\(…\\) instead: ${clip(text)}`);
    }
  }

  // Mermaid diagrams that did not draw.
  for (const element of document.querySelectorAll('.mermaid')) {
    if (!element.querySelector('svg')) problems.push(`diagram was not drawn: ${clip(element.dataset.error || element.textContent)}`);
  }

  // Links and ids.
  const seen = new Set();
  for (const element of document.querySelectorAll('[id]')) {
    if (element.closest('svg, .katex')) continue;
    if (seen.has(element.id)) problems.push(`id used more than once: #${element.id}`);
    seen.add(element.id);
  }
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (id && !document.getElementById(id)) problems.push(`link points at a missing id: #${id} ("${clip(link.textContent, 40)}")`);
  }

  // Images.
  for (const image of document.images) {
    if (!image.naturalWidth) problems.push(`image did not load: ${image.getAttribute('src')}`);
  }

  // Anything wider than the text block is cut off or spills into the margin.
  const pageWidth = document.documentElement.clientWidth;
  const reported = [];
  for (const element of document.body.querySelectorAll('*')) {
    if (element.parentElement.closest('svg, .katex')) continue;
    if (reported.some((ancestor) => ancestor.contains(element))) continue;
    const style = getComputedStyle(element);
    if (style.display === 'none') continue;
    const box = element.getBoundingClientRect();
    if (!box.width || !box.height) continue;
    if (style.overflowX !== 'visible' && element.scrollWidth > element.clientWidth + 1) {
      problems.push(`content is cut off inside ${describe(element)}`);
      reported.push(element);
    } else if (box.right > pageWidth + 1 || box.left < -1) {
      problems.push(`wider than the page: ${describe(element)}`);
      reported.push(element);
    }
  }

  const figureOf = (svg) => {
    const caption = svg.closest('figure')?.querySelector('figcaption');
    return caption ? `the figure "${clip(caption.textContent, 40)}"` : 'a diagram';
  };

  // A drawing wider than the text block is scaled down, and its lettering with it.
  for (const svg of document.querySelectorAll('figure svg')) {
    const drawn = svg.viewBox.baseVal?.width;
    const shown = svg.getBoundingClientRect().width;
    if (drawn && shown && shown / drawn < 0.8) {
      warnings.push(`${figureOf(svg)} is shrunk to ${Math.round((100 * shown) / drawn)}% to fit the page, so its text is small; make the drawing narrower`);
    }
  }

  // Hand-drawn SVG: labels that run off the drawing, out of their box, or into each other.
  for (const svg of document.querySelectorAll('svg')) {
    if (svg.closest('.mermaid, .katex')) continue;
    const frame = svg.getBoundingClientRect();
    if (!frame.width) continue;
    const where = figureOf(svg);
    const boxes = [...svg.querySelectorAll('rect')].map((rect) => rect.getBoundingClientRect()).filter((box) => box.width && box.height);
    const labels = [...svg.querySelectorAll('text')]
      .map((text) => ({ text: clip(text.textContent, 30), box: text.getBoundingClientRect() }))
      .filter((label) => label.text && label.box.width);

    labels.forEach((label, index) => {
      const { box } = label;
      if (box.left < frame.left - 1 || box.right > frame.right + 1 || box.top < frame.top - 1 || box.bottom > frame.bottom + 1) {
        warnings.push(`label "${label.text}" runs off the edge of ${where}`);
      }
      const x = (box.left + box.right) / 2;
      const y = (box.top + box.bottom) / 2;
      const holder = boxes
        .filter((rect) => x > rect.left && x < rect.right && y > rect.top && y < rect.bottom)
        .sort((a, b) => a.width * a.height - b.width * b.height)[0];
      if (holder && (box.left < holder.left - 1 || box.right > holder.right + 1)) {
        warnings.push(`label "${label.text}" is wider than its box in ${where}`);
      }
      for (const other of labels.slice(index + 1)) {
        const overlapX = Math.min(box.right, other.box.right) - Math.max(box.left, other.box.left);
        const overlapY = Math.min(box.bottom, other.box.bottom) - Math.max(box.top, other.box.top);
        if (overlapX > 2 && overlapY > 0.25 * Math.min(box.height, other.box.height)) {
          warnings.push(`labels "${label.text}" and "${other.text}" overlap in ${where}`);
        }
      }
    });
  }

  return {
    problems,
    warnings,
    words: (document.body.innerText.match(/\S+/g) || []).length,
    codeBlocks: document.querySelectorAll('pre:not(.mermaid)').length,
    figures: document.querySelectorAll('figure:not(.code)').length,
  };
}

// Runs in the page. The ids that the contents list links to.
function contentsTargets() {
  return [...document.querySelectorAll('.toc a[href^="#"]')].map((link) => decodeURIComponent(link.getAttribute('href').slice(1)));
}

// Runs in the page. Writes each entry's page number into the contents list.
function fillContents(pages) {
  for (const link of document.querySelectorAll('.toc a[href^="#"]')) {
    const cell = document.createElement('span');
    cell.className = 'page';
    cell.textContent = pages[decodeURIComponent(link.getAttribute('href').slice(1))];
    link.after(cell);
  }
}

// Chromium writes a named destination into the PDF for every link target.
// Reading them back from a first print gives the page each id landed on.
// Returns null if the PDF is not laid out the way this expects.
function destinationPages(pdf) {
  const objects = new Map();
  for (const [, id, body] of pdf.toString('latin1').matchAll(/(\d+) 0 obj\b([\s\S]*?)\bendobj/g)) objects.set(id, body);
  const catalog = [...objects.values()].find((body) => /\/Type\s*\/Catalog\b/.test(body)) ?? '';
  const root = /\/Pages (\d+) 0 R/.exec(catalog)?.[1];
  const destinations = objects.get(/\/Dests (\d+) 0 R/.exec(catalog)?.[1]);
  if (!root || !destinations) return null;

  const order = [];
  const visit = (id) => {
    const kids = /\/Kids\s*\[([^\]]*)\]/.exec(objects.get(id) ?? '');
    if (!kids) order.push(id);
    else for (const [, kid] of kids[1].matchAll(/(\d+) 0 R/g)) visit(kid);
  };
  visit(root);

  const pages = {};
  for (const [, name, page] of destinations.matchAll(/\/(\S+) \[(\d+) 0 R/g)) {
    const bytes = name.replace(/#([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    pages[Buffer.from(bytes, 'latin1').toString('utf8')] = order.indexOf(page) + 1;
  }
  return pages;
}

async function render(options, browserPath, problems) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'learn-anything-'));
  const flags = [
    '--headless=new',
    '--remote-debugging-pipe',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--mute-audio',
  ];
  // Chromium refuses to start its sandbox as root, which is the usual situation in a container.
  if (!options.sandbox || process.getuid?.() === 0) flags.push('--no-sandbox');

  const child = spawn(browserPath, flags, { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr = (stderr + chunk).slice(-2000);
  });
  const exited = new Promise((resolve) => child.once('exit', resolve));
  const spawnFailed = new Promise((_, reject) => child.once('error', reject));

  try {
    const cdp = new Connection(child);
    const work = (async () => {
      const { product } = await cdp.send('Browser.getVersion');
      const major = Number(/\/(\d+)/.exec(product)?.[1]);
      if (major < MIN_BROWSER_MAJOR) {
        problems.push(`${product} is too old to print page numbers; use a browser based on Chromium ${MIN_BROWSER_MAJOR} or newer`);
      }

      const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
      const page = (method, params) => cdp.send(method, params, sessionId);

      const requests = new Map();
      let loaded;
      const loadEvent = new Promise((resolve) => (loaded = resolve));
      cdp.on(({ method, params, sessionId: from }) => {
        if (from !== sessionId) return;
        if (method === 'Page.loadEventFired') loaded();
        else if (method === 'Network.requestWillBeSent') requests.set(params.requestId, params.request.url);
        else if (method === 'Network.loadingFailed' && !params.canceled) {
          problems.push(`failed to load ${requests.get(params.requestId) ?? 'a resource'} (${params.errorText})`);
        } else if (method === 'Network.responseReceived' && params.response.status >= 400) {
          problems.push(`failed to load ${params.response.url} (HTTP ${params.response.status})`);
        } else if (method === 'Runtime.exceptionThrown') {
          const { exception, text } = params.exceptionDetails;
          problems.push(`script error: ${(exception?.description ?? text).split('\n')[0]}`);
        } else if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
          problems.push(params.args.map((arg) => arg.value ?? arg.description ?? '').join(' '));
        }
      });

      const evaluate = async (fn, ...args) => {
        const expression = `(${fn})(${args.map((arg) => JSON.stringify(arg)).join(', ')})`;
        const { result, exceptionDetails } = await page('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
        return result.value;
      };
      const layOutAt = (width) => page('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });

      await Promise.all([page('Page.enable'), page('Runtime.enable'), page('Network.enable')]);
      // Lay the page out the way print will, so scripts that measure text and the checks below see the real widths.
      await page('Emulation.setEmulatedMedia', { media: 'print' });
      await layOutAt(DEFAULT_CONTENT_WIDTH_PX);

      const navigation = await page('Page.navigate', { url: pathToFileURL(options.input).href });
      if (navigation.errorText) throw new Fatal(`could not open ${options.input}: ${navigation.errorText}`);
      await loadEvent;

      const settled = await Promise.race([
        evaluate(settle).then(() => true),
        new Promise((resolve) => setTimeout(resolve, options.timeout * 1000, false)),
      ]);
      if (!settled) problems.push(`the page was still loading after ${options.timeout}s; printed it as it stood`);

      const width = await evaluate(contentWidth, DEFAULT_CONTENT_WIDTH_PX);
      if (width !== DEFAULT_CONTENT_WIDTH_PX) await layOutAt(width);
      const report = await evaluate(inspect);

      const print = async () => {
        const { data } = await page('Page.printToPDF', {
          printBackground: true,
          preferCSSPageSize: true,
          generateTaggedPDF: true,
          generateDocumentOutline: true,
        });
        return Buffer.from(data, 'base64');
      };

      // The contents list gets its page numbers from a first print. The numbers
      // go into space the stylesheet already reserves, so they move nothing.
      let pdf = await print();
      const targets = await evaluate(contentsTargets);
      if (targets.length) {
        const pages = destinationPages(pdf);
        if (pages && targets.every((id) => pages[id] > 0)) {
          await evaluate(fillContents, pages);
          pdf = await print();
        } else {
          report.warnings.push('could not work out page numbers for the contents list; it was printed without them');
        }
      }

      fs.mkdirSync(path.dirname(options.output), { recursive: true });
      fs.writeFileSync(options.output, pdf);
      return { ...report, product };
    })();
    return await Promise.race([work, spawnFailed]);
  } catch (error) {
    if (error instanceof Fatal) throw error;
    const detail = stderr.trim() ? `\n--- browser output ---\n${stderr.trim()}` : '';
    const hint = /sandbox/i.test(stderr) ? '\nThe browser could not start its sandbox; inside a container, re-run with --no-sandbox.' : '';
    throw new Fatal(`${browserPath} failed: ${error.message}${hint}${detail}`);
  } finally {
    child.kill();
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 5000))]);
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

function countPages(pdf) {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
}

function plural(count, noun) {
  return `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return 0;
  }
  const browserPath = findBrowser(options.browser);

  const loadProblems = [];
  const report = await render(options, browserPath, loadProblems);
  const problems = [...new Set([...loadProblems, ...report.problems])];
  const warnings = [...new Set(report.warnings)];

  const pdf = fs.readFileSync(options.output);
  const size = pdf.length < 1e6 ? `${Math.ceil(pdf.length / 1e3)} KB` : `${(pdf.length / 1e6).toFixed(1)} MB`;
  console.log(`wrote ${options.output}`);
  console.log(
    [plural(countPages(pdf), 'page'), size, `about ${plural(report.words, 'word')}`, plural(report.codeBlocks, 'code block'), plural(report.figures, 'figure')].join(' · '),
  );
  console.log(`printed with ${report.product}`);

  if (warnings.length) {
    console.error(`\n${plural(warnings.length, 'thing')} to check by eye:`);
    for (const warning of warnings) console.error(`  - ${warning}`);
  }
  if (problems.length) {
    console.error(`\n${plural(problems.length, 'problem')} to fix before delivering:`);
    for (const problem of problems) console.error(`  - ${problem}`);
    return 1;
  }
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error instanceof Fatal ? error.message : error);
    process.exit(2);
  },
);
