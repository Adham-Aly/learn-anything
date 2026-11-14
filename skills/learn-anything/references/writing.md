# Writing the guide

The guide has one reader: the person in the brief. Not a general audience. Every choice below is made for someone with their background, their goal and their patience. Picture them reading with nobody to ask; whatever they would have asked has to be on the page already.

Two qualities matter most, and they pull against each other. **Intuitive** means the reader understands why, not just what, and could work out what happens in a case the guide never showed. **Lean** means nothing is on the page that this reader does not need. Explaining more makes a guide easier to follow up to a point, and then harder, because the point gets buried. The skill is in spending words only where this reader would otherwise get lost.

## Order of ideas

- **Start from a need.** Open a chapter with the problem it solves or the question it answers, set in a concrete situation. A definition comes after the reader wants one.
- **Concrete before general.** Show one instance, then state the rule it is an instance of. A reader who has seen three requests handed to three servers in turn does not need "round robin" defined; they need it named.
- **One new idea at a time.** If a paragraph introduces two, split it.
- **Dependency order.** Each idea may use only what came before. When you reach for a term you have not introduced, introduce it there in a clause, or reorder. The outline in the brief fixes the chapters; the order inside them is yours to get right.
- **Why, what, how, when it breaks.** That order works for almost any idea: why it is needed, what it is, how it works, where it stops working.

## Making it intuitive

- **Mechanism over label.** Knowing the name of something is not understanding it. Explain what actually happens, step by step, until the reader could predict the behaviour in a new case. A useful test: could they answer "what would happen if...?"
- **Build on what they know.** The brief says what the reader already understands. Tie new ideas to that, and draw analogies from their world. Then say where the analogy stops being true; an analogy left unqualified becomes a misconception.
- **Work examples in full.** A worked example shows the thinking, not only the steps: why this move, why now. Use real, specific values, not `foo` and `x`.
- **Show the wrong way too.** A hypothesis matters when you see what breaks without it. A design choice makes sense next to the alternative that fails. A non-example sharpens a definition.
- **Let them predict.** Before revealing a result, ask what they expect. A wrong guess followed by the answer teaches more than the answer alone.
- **Name the real misconceptions.** The ones people actually hold, found in research, at the point in the text where they arise.
- **Draw what has a shape.** Structure, flow, sequence in time, geometry, a comparison of quantities. See Figures below.

## Keeping it lean

Each paragraph has to do work toward the outcome in the brief. Things that never do:

- Announcing what is about to be covered, or recapping what was just said.
- History and background the reader did not ask for.
- Every option, flag and variant. Teach the part that gets used and point to the reference for the rest.
- Praise for the subject, or reassurance that it is easy.
- Hedges on things that are known, and qualifications that protect the writer more than they inform the reader.
- Restating in prose what a listing or figure already shows plainly.

Say each thing once, where it is needed. Keep callouts rare, at most one of a kind per section, or they stop standing out.

The scope is fixed by the brief, so if the guide is running long, tighten the explanations that explain the obvious before touching anything the brief promised. If it still will not fit the agreed size, let it run longer and say so on delivery; a guide that explains five things properly is worth more than one that mentions fifteen.

## Voice

Write the way a knowledgeable friend explains at a whiteboard: second person, active verbs, plain words, at the level and tone the brief calls for. Be confident where things are known. Where something is uncertain, disputed or simplified, say so once, in the place it applies ("this leaves out X; that matters when Y").

Define each term in passing at first use, then keep using that same word for that same thing. Changing the word makes a careful reader wonder whether the thing changed.

The guide stands alone. It never mentions the interview, the brief, what the reader "asked for", or its author.

## Code

- **It runs, and you ran it.** With the versions named on the cover. Output shown in the guide is real output.
- **Current idiom.** Written the way the current documentation writes it, which may not be the way you remember.
- **Small.** The least code that shows the point. In a concept explainer, clarity beats production-readiness; say that the listing is simplified.
- **Complete where it has to be.** If the reader is meant to run it, everything needed is there, including imports and the command. Never elide something the reader needs with an ellipsis.
- **One growing project** in a build-along, with the new or changed lines marked at each step, so the reader always knows what this step added.
- **Explain after the listing**, and explain what to notice, not each line in turn. Comments inside code are for what the prose cannot say.
- **Short lines.** 76 characters or fewer print without wrapping.

## Maths

Words and a picture first; then the formula as the precise way of saying it. Name every symbol where it first appears. Show each step that a reader at this level could not do in their head. After a result, work a numerical example, with units. State what a formula assumes before the reader relies on it.

## Figures

Use a figure when the idea has a shape and words would have to describe that shape. Use none as decoration.

- One idea per figure. Label parts directly on the drawing. The caption says what to notice. The text refers to the figure by number.
- Hand-drawn SVG for anything specific to this guide; Mermaid when the diagram is a flowchart, a sequence or a state machine and automatic layout is good enough. `assets/template.html` shows both.
- Keep hand-drawn diagrams simple: a handful of boxes on a grid, with space around them. Check that each label fits its box before moving on: at 12 units, text is roughly 6.5 units wide per character.
- For a plot of a real function or real data, compute the points with a few lines of code and paste the resulting path. A curve drawn by eye that is subtly wrong teaches the wrong thing.

## Accuracy

- Facts come from the sources you opened during research. Date the ones that will change ("as of November 2026").
- Cite the source for specific claims: numbers, quotations, research findings, anything surprising. Common knowledge in the field needs no marker.
- Never invent a citation, a URL, a version number or a quotation. If you cannot verify something, check it, or leave it out.
- The source list at the back holds what you actually used, so the reader can go further and can see what the guide was checked against.

## Front and back matter

- **Cover.** Title, a one-sentence promise, who it is written for, the outcome, what it covers (with versions, for software), and the date of research.
- **Contents.** One line per chapter saying what the reader gets from it. That line replaces any "in this guide we will" introduction.
- **Back matter**, only what earns its place: answers to the questions asked along the way, where to go next, a glossary if the guide introduced enough vocabulary to need one, and the sources.
