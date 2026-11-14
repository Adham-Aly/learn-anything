---
name: learn-anything
description: Creates a tailored, intuitive learning guide as a polished PDF for any topic, such as a technology, a concept, a field of study, a skill or a paper. Starts by interviewing the user in depth to pin down exactly what they want to learn (scope, depth, background, style), researches current sources on the web, then writes the guide in HTML and renders it to PDF. Use when the user wants to learn or understand something and wants a guide, tutorial, primer, explainer, crash course or study document made for them, for example "teach me X", "I want to learn X", "make me a guide to X".
license: MIT
compatibility: Needs web access for research, and Node.js 18+ with a Chromium-based browser (Chrome, Chromium, Edge or Brave) to render the PDF.
---

# Learn anything

## What this makes

One PDF that teaches one person one thing. Not a general-purpose tutorial: a guide written for this reader, starting from what they already know, covering the part of the subject they asked for at the depth they asked for, in the form that suits what they want to do with it.

Three things make it worth having, and each is a phase of the work:

- **It is the guide they had in mind.** That comes from the interview, which is why the interview is the longest and most important phase.
- **It is true today.** That comes from research on the web, not from memory.
- **It is easy to follow and no longer than it needs to be.** That comes from how it is written.

The subject can be anything, and the form follows the subject and the goal. Someone who wants to write a basic backend with a web framework gets a build-along: a worked project, textbook style. Someone who wants to understand load balancing and see some of what happens under the hood gets a conceptual breakdown with short code listings in it. Someone starting quantum mechanics gets something else again. Working out which, and exactly what goes in it, is the job of the interview.

## The workflow

```
1. INTERVIEW   question the user until nothing about the guide is a guess
2. BRIEF       write down what was agreed, with an outline; the user signs off
3. RESEARCH    current, primary sources for everything the outline needs
4. WRITE       the guide, as one HTML file
5. RENDER      HTML to PDF, then check it page by page and against the brief
6. DELIVER     the PDF, and a short note
```

Paths in this file are relative to this skill's directory.

## 1. Interview

Everything after the interview is execution. A guide built on a misread request is wasted however well it is written, so this phase gets the most care.

It rests on one belief: the user knows what they want, but their request does not contain all of it. However good the request is:

- Some of what they want, they did not think to say.
- Some of it they said in words that mean one thing to them and another to you: "the basics", "under the hood", "practical", "a good overview".
- Some of it they could not say, because they are a learner. They do not yet know the subject well enough to name the parts of it they want.

The interview exists to get all of that out of their head and into yours before anything is researched or written, so that the finished PDF is the one they were picturing.

**Start at once.** The interview is the first thing that happens when this skill is invoked: before any research, before proposing an outline, before saying anything about the topic. If the user has not said what they want to learn, that is the first question.

**Use your ask user question tool for every question.** It lets the user answer by choosing among concrete options and still type their own answer when none fits. If you have no such tool, ask in the conversation, a few numbered questions at a time, and wait for the answers.

**Be thorough.** This is a grilling, not a courtesy check. Work in rounds: ask a few questions, read the answers, and let them decide what to ask next. A broad subject such as "quantum mechanics" can take five or six rounds. A narrow, well-specified request still deserves two or three, because the point is to find what the request left out. If you are done after one round, you have almost certainly accepted an answer you should have followed up. Do not ration questions out of politeness; the user chose a skill that asks a lot.

### What to find out

By the end you need a firm answer for every item below. Do not re-ask what the request already answers beyond doubt. Do pin down anything it only half answers.

- **Purpose.** Why they want to learn this and what they will do with it: a project, an exam, a job, a decision, curiosity. What prompted it now. Ask this first, because it shapes every later question.
- **Outcome.** What they should be able to do or explain after the last page. Push until it is concrete enough to test: "write a small REST API without looking things up", "follow a paper that uses the Schrödinger equation".
- **Starting point.** What they already know that this builds on. Ask about specific prerequisites ("which of these are you comfortable with?"), not for a self-rating; "beginner" and "intermediate" tell you nothing. Ask what they have already read, watched or tried, and where it lost them.
- **Territory.** Which parts of the subject are in and which are out. The user usually cannot list the parts, so lay them out: name the main regions of the subject, describe each in a plain line, and have them choose.
- **Depth.** For each part that is in: the intuition only, working knowledge, or the full mechanism with its maths, internals or proofs. Where to stop.
- **Kind of guide.** Do they want to learn by making something, or by understanding how it works? How much doing against how much explaining? This decides the guide's shape (see `references/guide-shapes.md`).
- **Ingredients.** Code (which language, a runnable project or short illustrative listings, written for the guide or taken from real systems), maths (how much, which notation), diagrams, exercises with answers, real-world cases, history.
- **Particulars.** Whatever is specific to this subject and changes the content: versions and tooling, their operating system, their field (so examples come from their world), conventions, a syllabus, codebase or paper the guide must line up with.
- **Size.** How long, how much time they will give it, one sitting or several.
- **Voice.** Conversational or formal, how much hand-holding, how dense.
- **Must-haves and must-nots.** The one question they most want answered, or the thing that has never clicked. What to leave out. What they dislike in other material on the subject.

Once you know roughly what kind of learning this is, usually after the first round, read `references/guide-shapes.md`. It describes the shapes a guide can take and lists, for each shape, what else the interview has to pin down.

### How to ask

- **One decision per question, with options that teach.** A learner cannot choose between things they cannot picture. Describe each option in plain words, by what it would put in the guide, not by a term they may not know yet. Use multiple selection for "which of these". When you have a reason to prefer an option, put it first and say why.
- **Ask about the person, then infer the document.** "What will you do with this afterwards?" tells you more than "how deep should it go?", and they can actually answer it.
- **Test your reading of their words.** For every loaded phrase in the request, offer two or three concrete readings and ask which is meant. For "some under the hood code" in a request about load balancing, the readings might be: short implementations of the algorithms written for the guide, excerpts from the source of real load balancers, or configuration for a real one. Each is a different guide.
- **Show instead of describing.** Preferences about depth, tone and how mathematical to be are easier to recognise than to state. Write the same small idea two or three ways, a few lines each, and ask which is closest.
- **Follow up on vague answers.** "Just the essentials" is not an answer yet. Say what the essentials could include and ask where the line falls.
- **Raise what they did not think of.** Prerequisites the subject quietly assumes, neighbouring topics that people who learn this usually need too, the classic things that get left out and missed later. Offer them and let the user decline.
- **Bring contradictions to them.** "Everything about X" and "about ten pages" cannot both hold. Say so and have them choose.
- **When they say "you decide", decide.** Say what you chose and why in a line, record it in the brief, and move on.
- **Look things up between rounds if you need to.** Sharp questions about scope need a map of the subject. For a subject you know poorly, or one that changes fast, do a quick search after the first round, not before it; the first round, about purpose and outcome, needs no preparation.

If your tool limits how many questions or options fit in one call, use several calls in a round, and split a long list of options across questions instead of dropping some.

### When to stop

Stop when you could write the brief in the next section without guessing at anything that would visibly change the guide. Go down the list above: for each item you should be able to state the answer and point to where the user gave it. Cosmetic choices (paper size, colour, file name) are not worth a question; pick a default and list it in the brief.

If the user asks to cut the interview short, ask only what is still essential, state your assumptions for the rest in the brief, and carry on.

## 2. Brief

The brief is the interview written down: the specification the guide will be checked against. Draft it in this form:

```markdown
# Brief: <working title>

Reader:        what they already know that matters here, and what is new to them
Purpose:       why they are learning this and what they will do with it
Outcome:       what they can do or explain after the last page
Shape:         the shape from references/guide-shapes.md, and the balance of doing and explaining
In scope:      each part of the subject that is in, with its depth
Out of scope:  what is deliberately left out, including what the user turned down
Ingredients:   code (language and kind), maths, diagrams, exercises, cases
Particulars:   versions, tools, conventions, material it must line up with
Must answer:   the specific questions or sticking points they named
Size, voice:   approximate pages and sittings; tone
Assumed:       every default you chose without asking

## Outline
1. <Chapter title>: what the reader gets from it (~N pages)
2. ...
```

Show the whole brief to the user, then ask with your ask user question tool whether it matches what they had in mind. Treat anything short of a clear yes as more interview: ask about what is off, revise, and show it again.

When they approve it, create the guide's folder and save the brief there as `brief.md`. Unless the user names a place, the folder is `learn-anything/<topic-slug>/` under the current working directory. Everything for this guide goes in that folder. Do not overwrite files you did not create.

## 3. Research

The guide has to be right as of today. What you remember has a cutoff date, and software, research fields and prices all move. Treat your memory as a list of things to check.

- **Go to primary sources.** Official documentation for the current version, release notes and changelogs, standards and RFCs, the original papers, source code, textbooks and university course notes. For a fast-moving field, recent survey papers. Treat blog posts, forum answers and videos as leads: check their date, then confirm what they say against a primary source.
- **Establish what is current.** Check today's date. For software, find the latest stable version and what changed recently, and write for that version. For a research field, find the newest work the guide's claims depend on.
- **Verify every perishable fact.** API names, commands, flags, defaults, version numbers, prices, benchmark figures, who holds a record, what is deprecated. Each one in the guide should trace to a source you opened in this session.
- **Research the teaching as well as the facts.** Find where learners of this subject usually go wrong: the common misconceptions, the classic mistakes, the questions that keep being asked. They become the guide's warnings and its choice of examples.
- **Keep a source log as you go.** URL, title, date or version, and what you took from it. It becomes the guide's source list.
- **Run the code.** Anything the reader is told to run, run yourself first, in a scratch directory, with the versions the guide names, and use the real output. If you cannot run it, say so when you deliver.

If you can delegate, research for separate chapters can run in parallel. The writing should stay with one author, so the guide has one voice.

Stop and go back to the user if research overturns the brief: what they asked about has been superseded or deprecated, does not work the way their request assumes, or there is a clearly better route to their outcome. Tell them what you found and ask how to proceed. Otherwise, do not interrupt them again.

If you have no web access, tell the user before writing anything. If they want the guide anyway, write it from what you know and state on the cover, in place of the research date, that it was not checked against current sources.

## 4. Write

Read these two files first:

- `references/writing.md`: how to explain things so they are intuitive and lean. This is the standard the guide is held to.
- `assets/template.html`: the markup for every building block (cover, contents, chapters, callouts, code, figures, tables, maths, sources) and the rules the stylesheet relies on.

Then copy `assets/guide.css` and `assets/guide.js` into the guide's folder and write the guide beside them as `<topic-slug>.html`. Use the template's building blocks and leave the two copied files unedited. Do not carry over the template's text or outline; the outline is the one in the brief.

Write for the reader in the brief. Each chapter is there because it moves them toward the outcome. Nothing goes in merely because you found it during research.

A long guide is too much to write in one go. Write the frame first (cover, contents, chapter headings), then fill in one chapter at a time.

## 5. Render and check

```bash
node scripts/render-pdf.mjs path/to/<topic-slug>.html
```

This writes `<topic-slug>.pdf` beside the HTML and reports the page count and word count. It then lists problems, which are definite defects (something failed to load, a formula did not parse, a link points nowhere, something is wider than the page) and things to check by eye (labels that seem to overlap or overflow in a diagram). Fix every problem and re-render until the run is clean, and look at each thing it asks you to check.

The script needs a Chromium-based browser and finds an installed one by itself. If there is none, it says how to get one; ask the user before installing anything.

A clean render is not a finished guide. Check four more things:

- **Look at it.** If you can view PDFs or images, look at every page (a tool such as `pdftoppm -r 70 -png` turns pages into images). Look for a heading stranded at the bottom of a page, a figure or table split awkwardly, a large empty gap, code that wraps badly, a diagram that is hard to read, a cover or contents page that looks wrong.
- **Read it as the reader, twice.** First as someone new to the subject: wherever a term appears before it is explained, a step jumps, or a "simply" is not simple, fix it. Then as someone who followed everything: cut whatever explains the obvious or says something a second time.
- **Check it against the brief.** Open `brief.md` and go through it line by line. Everything in scope is there at the agreed depth. Nothing out of scope crept in. Every "must answer" is answered. The size is close to what was agreed.
- **Check the facts.** Each version, command, number and quotation matches the source log. The code is the code you ran.

Fix what you find and render again.

## 6. Deliver

Tell the user, in a few lines: where the PDF is, how many pages it has, anything that differs from the brief and why, and anything you could not verify. The HTML stays beside the PDF, so changes are cheap; say so, and make any they ask for by editing the HTML and rendering again.
