# learn-anything

An agent skill that turns "I want to learn X" into a PDF guide written for one reader: you.

It works for any subject, and the guide takes the form the subject and your goal call for. Ask to build a first backend with a web framework and you get a worked project, textbook style. Ask to understand load balancing with a look under the hood and you get a conceptual breakdown with short code listings. Ask about quantum mechanics and it first finds out which part of that very large subject you mean.

## Install

```bash
npx skills add Adham-Aly/learn-anything
```

This uses the [skills](https://github.com/vercel-labs/skills) CLI, which installs into whichever coding agents you choose.

## Use

Invoke the skill and say what you want to learn:

```
/learn-anything how an Express.js app is put together, so I can write a basic backend
```

```
/learn-anything load balancing, with some of the code under the hood
```

```
/learn-anything quantum mechanics
```

In an agent without slash commands, ask it to use the learn-anything skill and give it the same request.

## What happens

1. **Interview.** The agent questions you, in rounds, about why you are learning this, what you already know, which parts of the subject you want, how deep, and what kind of guide would suit you. This is the longest step on purpose: the aim is a guide that matches what you had in mind, including the parts you did not think to say.
2. **Brief.** It writes down what was agreed, with an outline, and you sign off.
3. **Research.** It checks current documentation, papers and other primary sources, and runs any code the guide will ask you to run.
4. **Writing.** It writes the guide as a single HTML file, aiming for intuitive and lean.
5. **Rendering.** It prints the HTML to PDF with a headless browser, and checks the result page by page and against the brief.

You get the PDF, the HTML it was made from, and the brief, in `learn-anything/<topic>/` under the folder you ran the agent in.

## Requirements

- An agent with web access, for the research.
- Node.js 18 or newer.
- Chrome, Chromium, Edge or Brave, used headless to print the PDF. Chromium 131 or newer.
- A network connection when rendering: fonts, and the libraries for maths, code highlighting and diagrams, load from a CDN.

## What is in the repo

```
skills/learn-anything/
├── SKILL.md                  the workflow, with the interview in full
├── references/
│   ├── guide-shapes.md       the forms a guide can take, and what each needs
│   └── writing.md            how to explain things so they are intuitive and lean
├── assets/
│   ├── template.html         markup for every building block of a guide
│   ├── guide.css             the print stylesheet
│   └── guide.js              maths, code highlighting and diagrams, loaded as needed
└── scripts/
    └── render-pdf.mjs        HTML to PDF, with checks; no dependencies
```

## License

[MIT](LICENSE)
