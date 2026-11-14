// learn-anything: page behaviour for guides.
//
// Loads only what the page uses: KaTeX when it contains maths, highlight.js
// when it has code in a named language, Mermaid when it has Mermaid diagrams.
// window.guideReady resolves once everything is drawn; render-pdf.mjs waits for it.
(() => {
  const KATEX = 'https://cdn.jsdelivr.net/npm/katex@0.19.1/dist';
  const HIGHLIGHT = 'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.12.0';
  const MERMAID = 'https://cdn.jsdelivr.net/npm/mermaid@12.3.0/dist/mermaid.min.js';

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const element = document.createElement('script');
      element.src = src;
      element.onload = resolve;
      element.onerror = () => reject(new Error(`could not load ${src}`));
      document.head.append(element);
    });

  const loadStylesheet = (href) =>
    new Promise((resolve, reject) => {
      const element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = href;
      element.onload = resolve;
      element.onerror = () => reject(new Error(`could not load ${href}`));
      document.head.append(element);
    });

  const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function prepare() {
    // The page footer shows the document title.
    document.documentElement.style.setProperty('--running-title', JSON.stringify(document.title));

    // One arrowhead for every diagram: marker-end="url(#arrow)". It takes the colour of its line.
    document.body.insertAdjacentHTML(
      'afterbegin',
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1.2 10 5 0 8.8z" fill="context-stroke"/>
        </marker>
      </defs></svg>`,
    );
  }

  async function typesetMaths() {
    if (!/\\\(|\\\[|\$\$/.test(document.body.textContent)) return;
    await Promise.all([loadStylesheet(`${KATEX}/katex.min.css`), loadScript(`${KATEX}/katex.min.js`)]);
    await loadScript(`${KATEX}/contrib/auto-render.min.js`);
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option', 'svg'],
      throwOnError: false,
    });
  }

  // The code as written, without the blank first line and shared indentation
  // that come from laying it out inside the HTML, plus the lines wrapped in <mark>.
  function readCode(code) {
    const marked = new Set();
    let line = 0;
    // A <mark> shades every line from its first to its last non-blank one.
    const walk = (node, range) => {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          child.data.split('\n').forEach((part, index) => {
            if (index > 0) line++;
            if (range && part.trim()) {
              range.first ??= line;
              range.last = line;
            }
          });
        } else if (child.nodeName === 'MARK' && !range) {
          const own = {};
          walk(child, own);
          for (let index = own.first; index <= own.last; index++) marked.add(index);
        } else {
          walk(child, range);
        }
      }
    };
    walk(code, null);

    let lines = code.textContent.replace(/\s+$/, '').split('\n');
    let dropped = 0;
    while (lines.length > 1 && !lines[0].trim()) {
      lines.shift();
      dropped++;
    }
    const indent = Math.min(...lines.filter((text) => text.trim()).map((text) => text.match(/^[ \t]*/)[0].length));
    if (indent > 0 && Number.isFinite(indent)) lines = lines.map((text) => text.slice(indent));
    return { text: lines.join('\n'), marked: new Set([...marked].map((index) => index - dropped)) };
  }

  // Splits highlighted HTML into one element per line, closing and reopening
  // any highlight spans that run across a line break.
  function wrapLines(html, marked) {
    const open = [];
    const lines = [''];
    for (const token of html.split(/(<span[^>]*>|<\/span>|\n)/)) {
      if (token === '\n') {
        lines[lines.length - 1] += '</span>'.repeat(open.length);
        lines.push(open.join(''));
      } else {
        if (token.startsWith('<span')) open.push(token);
        else if (token === '</span>') open.pop();
        lines[lines.length - 1] += token;
      }
    }
    return lines.map((line, index) => `<span class="line${marked.has(index) ? ' marked' : ''}">${line}\n</span>`).join('');
  }

  // Commands (lines starting "$ ") stand out from the output they produce.
  function formatTerminal(text) {
    let continued = false;
    return text
      .split('\n')
      .map((line) => {
        const command = /^\$ (.*)$/.exec(line);
        if (command) {
          continued = line.endsWith('\\');
          return `<span class="prompt">$</span> <span class="command">${escapeHtml(command[1])}</span>`;
        }
        if (continued) {
          continued = line.endsWith('\\');
          return `<span class="command">${escapeHtml(line)}</span>`;
        }
        return `<span class="output">${escapeHtml(line)}</span>`;
      })
      .join('\n');
  }

  async function formatCode() {
    const blocks = [...document.querySelectorAll('pre > code')].map((code) => ({
      code,
      language: /\blanguage-([\w+#-]+)/.exec(code.className)?.[1].toLowerCase(),
      terminal: code.parentElement.classList.contains('terminal'),
      ...readCode(code),
    }));

    const languages = new Set(blocks.filter((block) => !block.terminal && block.language).map((block) => block.language));
    if (languages.size) {
      await loadScript(`${HIGHLIGHT}/highlight.min.js`);
      // The main bundle covers the common languages; the rest load one file each.
      const extra = [...languages].filter((language) => !window.hljs.getLanguage(language));
      await Promise.all(
        extra.map((language) =>
          loadScript(`${HIGHLIGHT}/languages/${language}.min.js`).catch(() => console.error(`no highlighting for "language-${language}": not a highlight.js language name`)),
        ),
      );
    }

    for (const { code, language, terminal, text, marked } of blocks) {
      let html;
      if (terminal) html = formatTerminal(text);
      else if (language && window.hljs.getLanguage(language)) html = window.hljs.highlight(text, { language, ignoreIllegals: true }).value;
      else html = escapeHtml(text);
      code.innerHTML = marked.size ? wrapLines(html, marked) : html;
    }
  }

  async function drawDiagrams() {
    const blocks = [...document.querySelectorAll('.mermaid')];
    if (!blocks.length) return;
    await loadScript(MERMAID);

    const style = getComputedStyle(document.documentElement);
    const token = (name) => style.getPropertyValue(name).trim();
    const fontFamily = token('--sans');
    // Mermaid sizes boxes by measuring text, so the font has to be there first.
    await document.fonts.load(`12px ${fontFamily}`).catch(() => {});
    // Flat boxes and document-sized type, so diagrams sit with the rest of the page.
    const plain = { look: 'classic', theme: 'base' };
    window.mermaid.initialize({
      ...plain,
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      fontFamily,
      fontSize: 12,
      flowchart: { ...plain, nodeSpacing: 36, rankSpacing: 40, padding: 10, minNodeWidth: 0 },
      state: { ...plain, minNodeWidth: 0 },
      class: plain,
      er: plain,
      sequence: {
        ...plain,
        width: 120,
        height: 36,
        actorMargin: 40,
        messageMargin: 28,
        boxMargin: 6,
        mirrorActors: false,
        actorFontSize: 12,
        actorFontFamily: fontFamily,
        messageFontSize: 12,
        messageFontFamily: fontFamily,
        noteFontSize: 12,
        noteFontFamily: fontFamily,
      },
      themeVariables: {
        fontFamily,
        fontSize: '12px',
        background: '#ffffff',
        primaryColor: token('--wash'),
        primaryTextColor: token('--ink'),
        primaryBorderColor: token('--ink-2'),
        secondaryColor: token('--wash-2'),
        tertiaryColor: '#ffffff',
        lineColor: token('--ink-2'),
        textColor: token('--ink'),
        noteBkgColor: token('--warn-wash'),
        noteBorderColor: token('--line'),
      },
    });

    for (const [index, block] of blocks.entries()) {
      try {
        const { svg } = await window.mermaid.render(`mermaid-${index + 1}`, block.textContent.trim());
        block.innerHTML = svg;
      } catch (error) {
        block.dataset.error = String(error.message ?? error).split('\n')[0];
      }
    }
  }

  async function run() {
    prepare();
    const jobs = { maths: typesetMaths(), code: formatCode(), diagrams: drawDiagrams() };
    for (const [what, job] of Object.entries(jobs)) {
      await job.catch((error) => console.error(`${what} not rendered: ${error.message}`));
    }
  }

  window.guideReady = new Promise((resolve) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => run().then(resolve));
    else run().then(resolve);
  });
})();
