# Guide shapes

A guide's shape is its overall plan: what the chapters are, and what carries the reader from one to the next. The shape follows from the purpose and the outcome the user gave in the interview, not from the topic. "Load balancing" can be a build-along (set one up), a concept explainer (how it works), a decision guide (which one to use) or exam prep (system-design interviews).

Read this once you know roughly what kind of learning the user is after. Use it twice: during the interview, for the questions each shape needs answered, and when drafting the outline for the brief.

Each shape below gives:

- **Fits** when to use it.
- **Pin down** what the interview must settle for this shape, on top of the general list in `SKILL.md`.
- **Plan** the usual run of chapters. A starting point for the outline, to adapt.
- **Goes wrong** the ways this shape typically fails. Check the outline against these.

## Build-along

**Fits.** The outcome is being able to make something with a tool: a framework, a library, a language, a piece of software or hardware. The reader learns by building one thing from nothing to working.

**Pin down.**
- What gets built. Offer two or three candidate projects sized to the guide, ideally from the user's own world, and let them pick or name their own.
- The exact stack and versions, and their setup: operating system, editor, package manager, what is already installed.
- Flavour choices that change every listing (TypeScript or JavaScript, which test runner, which database).
- How much each step explains. Every command and why, or only the key moves?
- What "finished" means, and what is out. Ask about the usual scope creepers one by one: tests, authentication, a database, deployment, error handling.
- Whether they want exercises that extend the project.

**Plan.**
1. What we are building: the finished thing shown first, what it does, a diagram of its parts.
2. Setup: exact versions, the commands, and a first run that proves the setup works.
3. Milestones, one chapter each. Every milestone adds one capability and ends with something the reader runs and sees. Inside a milestone: the goal, the code (new lines marked), running it, then what just happened, which is where the concept is explained, now that they have seen it work.
4. The whole picture: how the pieces fit together, with the concepts collected in one place.
5. Where to go next: the things left out, in a sensible order to learn them.

**Goes wrong.** Pages of concepts before anything runs. Code that was never run. A step that depends on something not yet shown. A listing that changes between steps without saying what changed. The final code dumped whole.

## Concept explainer

**Fits.** The outcome is understanding how or why something works: a mechanism, a system, an idea. The reader wants a mental model good enough to reason with.

**Pin down.**
- What they will use the understanding for: hold their own in a conversation, make design decisions, pass an interview, build one themselves.
- Which questions matter to them: what it is, why it exists, how it works inside, the trade-offs and failure modes, how real systems do it.
- How far under the hood to go, and where to stop.
- Whether code appears, and which kind: short implementations written for the guide, excerpts from real systems, or configuration.
- Which real systems or cases to anchor on.
- Appetite for maths.

**Plan.**
1. The problem: a concrete situation where the thing is needed, and what goes wrong without it.
2. The simplest version that works.
3. Why the simple version is not enough. Each refinement is introduced by the problem that forces it. This chain is the spine of the guide.
4. The trade-offs: what each choice costs, and how people choose.
5. In the real world: how named systems do it, with specifics.
6. The model to keep: the whole thing on one page, usually one diagram.

Under-the-hood code in this shape is short and written to show the mechanism: the smallest listing that makes the idea concrete, followed by what to notice in it.

**Goes wrong.** A taxonomy with no thread: a list of types, each with a definition. Opening with a definition. An analogy that is never cashed out into the real mechanism. Production-shaped code that buries the idea.

## Theory primer

**Fits.** Formal subjects: mathematics, physics, statistics, theoretical computer science, economics. The content is definitions, results and derivations, and the reader needs to be able to use them.

**Pin down.**
- The mathematics they already have, by name: calculus, linear algebra, probability, complex numbers, whatever this subject leans on.
- Rigour: intuition and results only, derivations shown, or full proofs.
- Notation and conventions, where the field has rival ones.
- Which results they must come away with.
- Whether they want problems, how many, and how fully worked the solutions should be.
- What it has to line up with: a course, a textbook, an exam.
- How much history, experiment or application to include.

**Plan.**
1. The question or phenomenon the theory answers.
2. The picture: the idea in words and a diagram, before any formalism.
3. The formalism, introduced as the precise way to say the picture. Each definition motivated, each symbol named.
4. The results. Each with a plain-language reading, a derivation at the agreed rigour, and a worked example with numbers.
5. Problems, graded from direct to demanding, with solutions.
6. The results on one page, and where the theory goes next.

**Goes wrong.** Formalism before motivation. Skipped steps ("it can be shown that"). A symbol used before it is defined. All intuition and no ability to calculate anything. Examples that only substitute numbers into a formula.

## Field map

**Fits.** The outcome is being oriented in a field: a research area, an industry, an ecosystem of tools, the state of the art in something.

**Pin down.**
- Why they need the map: to enter the field, choose a tool, talk to specialists, find a research topic.
- Which regions get depth and which get a paragraph.
- How current it must be, and whether they want the history of how the field got here.
- How technical.
- Whether they want judgement (what is solid, what is hype, what you would pick) or a neutral account.
- Which papers, tools or names they already know.

**Plan.**
1. The map: one diagram of the field's regions and how they relate.
2. The questions the field is trying to answer. These organise everything after.
3. Region by region: the idea, the main approaches, the landmark work, where it stands now, with dates.
4. The frontier: what is unsolved or disputed.
5. A reading path: what to read next, in order, and what each item gives.

**Goes wrong.** A list of names. No organising questions. Stale information, or "current" claims with no date. Neutral to the point of being useless when the user asked for a view.

## Practice guide

**Fits.** The outcome is a skill the person performs: writing, negotiating, drawing, a sport, an instrument, cooking, speaking a language, playing chess.

**Pin down.**
- Their current level, shown by what they can do now, not by a label.
- What "good" would look like for them.
- Time available per day or week, and over how long.
- Constraints: equipment, space, a partner or teacher.
- How much of the theory behind the skill they want.
- How they will get feedback on whether they are doing it right.

**Plan.**
1. What good looks like: the target performance, described concretely.
2. The few principles that matter most.
3. Technique, element by element: how to do it, what it looks or feels like when right, the usual error and its fix.
4. Drills: specific, with a duration and a way to tell success.
5. A practice plan across their timeframe.
6. Self-assessment: how to judge progress and what to do when stuck.

**Goes wrong.** All theory. Advice with no drills. No way for the reader to tell right from wrong. Too many principles to hold in mind.

## Companion

**Fits.** The outcome is understanding one particular thing: a paper, a book chapter, a standard, a legal document, a codebase, a dataset.

**Pin down.**
- The exact item: get the file, link or version.
- Why they are reading it and what they need from it: the gist, the ability to reproduce or use it, a critique.
- Which of the background it assumes they are missing.
- Follow its order, or reorganise around the ideas.

**Plan.**
1. What it is and why it matters: its claim in three sentences.
2. What you need first: a primer on the prerequisites it assumes and the reader lacks.
3. The walk-through, part by part: what this part says in plain words, its key figure, equation or function decoded, and why it is there.
4. What to make of it: strengths, limits, what has been said or built since.
5. What to read next.

Explain in your own words and quote sparingly; the guide accompanies the original, it does not replace it.

**Goes wrong.** Paraphrase that adds nothing. Skipping the hard parts. No prerequisites. Drifting away from the item into the general subject.

## Decision guide

**Fits.** The outcome is a choice: X or Y, which tool, which approach, which path.

**Pin down.**
- Their situation and constraints, in detail. This is the whole point of the guide.
- The options on the table, and whether to add ones they have not considered.
- What they are optimising for, and what they would trade away.
- A recommendation, or only the comparison?
- How reversible the decision is.

**Plan.**
1. The decision, and the criteria it turns on, weighted for their situation.
2. Each option on its own terms: what it is, what it is good at, what it costs.
3. Head to head on the criteria, usually a table.
4. The recommendation for their situation, and what would change it.
5. How to check before committing: a small experiment or a question to ask.

**Goes wrong.** Feature tables with no judgement. Ignoring the constraints they gave. False balance. Out-of-date prices, limits or features.

## Narrative

**Fits.** History, philosophy, politics, biography, the story of how an idea or an institution came to be.

**Pin down.**
- The question behind their interest.
- The bounds: period, place, people.
- Story or analysis, and in what proportion.
- One synthesis, or the competing interpretations set side by side?
- Whether they want primary sources quoted.
- What they already know of the period or the tradition.
- Whether to draw the line to the present.

**Plan.**
1. The question.
2. The setting: what the reader needs before the story starts.
3. The story, in order, driven by causes: why each thing followed from the last.
4. The interpretations: where historians or thinkers disagree, and why.
5. What it left behind.
6. Sources and further reading.

**Goes wrong.** A chronicle of dates. One interpretation presented as settled fact. Judging the past by the present without saying so. No thread.

## Exam or interview prep

**Fits.** A known test: a course exam, a certification, a technical interview.

**Pin down.**
- The exact exam, syllabus or role. Get the materials if they exist: syllabus, past papers, the job description.
- The date, and the time available before it.
- Where they stand now, and what they find hardest.
- The question formats.
- The balance of refresher and practice.

**Plan.**
1. What is tested and how.
2. The topics in order of payoff. For each: the idea in brief, the patterns its questions follow, one worked question.
3. A practice set with full solutions.
4. A last-day sheet: the formulas, facts and patterns on one or two pages.
5. A schedule, if time is short.

**Goes wrong.** Re-teaching the whole subject. No practice. Answers without reasoning. Ignoring what this particular exam weights.

## Blending

Most guides are one main shape with pieces of another. The main shape sets the chapter plan; the borrowed pieces appear inside chapters.

- A first backend in a web framework: a build-along, with a short concept-explainer passage at the end of each milestone.
- Load balancing with some code under the hood: a concept explainer, with a small listing wherever a mechanism is easier to read as code than as prose.
- Quantum mechanics for a programmer heading toward quantum computing: a theory primer, opened by a field-map chapter that says which parts of the subject matter for that goal and which are skipped.
- A new programming language in a month: a build-along, closed by a practice-guide plan for the weeks after.

When the interview leaves two shapes equally plausible, that is a question for the user, not a call to make silently: describe what each would look like and ask.

## Size

A page of mixed text, code and figures holds about 400 words. As a rough scale to offer in the interview:

| Size | Pages | Suits |
|---|---|---|
| Primer | 8 to 12 | One idea or one small build, read in a sitting |
| Guide | 20 to 30 | A topic at working depth, over a few sittings |
| Deep guide | 40 to 70 | A subject area, or a substantial project |

Scope and size have to agree. If the agreed scope will not fit the agreed size, raise it while writing the brief and let the user choose which gives way.
