# GenAI 16-Hour Sprint

An interactive, self-paced study system for the NPTEL course **Fundamentals of Generative AI and Large Language Models: Theory and Practice** (IISc Bangalore, Prof. Sriram Ganapathy with Prof. Baishali Garai and Prof. Ashwini Kodipalli). It is built from the [official lecture playlist](https://www.youtube.com/playlist?list=PLgMDNELGJ1Ca_DduFvH6qfI1eapL48xOr) in teaching order.

**To use it:** open `index.html` in any modern browser. Nothing to install. It works offline; fonts load from Google Fonts when online and fall back to system fonts otherwise.

## What's inside

| | |
|---|---|
| **Week 0 + 12 weeks → 53 topics** | Written for a Class 10 reader. Week 0 is a maths toolkit (probability, logs and Σ, vectors, slopes and the chain rule, the bell curve) that teaches everything the course assumes. Every lecture (1–74) is mapped to a topic. Each topic opens with a puzzle, teaches the idea in short cards with “in plain words” summaries, analogies and worked examples, and ends with exam takeaways, common traps and links to the source lectures. |
| **57 interactive models and 58 diagrams** | Probability grid, log/exponent explorer, vector and slope playgrounds, a neuron you can tune, a pixel-grid convolution, denoising and sparsity demos, activation explorer, optimizer race, step-by-step convolution, CNN layer calculator, autoencoder bottleneck, KL playground, forward vs reverse KL, reparameterisation sampler, VAE loss calculator, latent interpolation, β-VAE traversal, GAN loss dials, a trainable 1-D GAN, forward diffusion with schedules, classifier-free guidance, U-Net tour, word-vector analogies, LSTM cell, self-attention, positional encoding, BPE merges, a temperature/top-k/top-p sampler, a prompting game, LoRA calculator, mini-RAG, EM/F1/ROUGE-L calculator, safety policy gate, scaling laws, a CLIP zero-shot matcher, a fairness checker, and more. |
| **Real maths notation** | Every formula is typeset with KaTeX (bundled, works offline): stacked fractions, subscripts, Greek letters and sums, never plain-text formulas. |
| **Word bank** | 341 terms and abbreviations. The first time a term appears on a page it is underlined; tap it for a plain-language definition. The full list is in the Word bank view. |
| **Topic quizzes** (pass 80%) | Instant feedback. A wrong answer explains why and links straight to the lesson card to re-read and the lecture video to watch. |
| **13 section tests** (pass 70%) | NPTEL-style, with a topic-by-topic breakdown and a repair plan. |
| **3 final mock exams** | 54–55 questions each from a separate bank of 164, 75-minute timer, NPTEL-style question palette with mark-for-review, and a projected certificate band. |
| **691 questions** | MCQ, MSQ (multiple select) and numerical-answer types, matching NPTEL's formats. |
| **Study clock** | Counts active time only (pauses after 4 idle minutes or when the tab is hidden). Tracks time per topic, week and day against the 16-hour plan, and lets you log time spent watching lecture videos. |
| **Plan** | 800 min of topics + 13 × 10 min section tests + 30 min revision = exactly 16 h, packed into eight 2-hour sessions. Each topic's minutes are set from a reading-and-practice estimate (`tools/student-audit.js`). The mocks are extra. |
| **Also** | Formula sheet, mistake book (every missed question until you get it right), exam pattern and strategy, progress backup and restore, light and dark themes, phone layout. |

Progress is stored in the browser's `localStorage`. Use **Progress backup** to move it to another device.

## Development

```
src/
  lectures.js          lecture → YouTube id / title / duration
  content/w00.js       Week 0: the maths toolkit
  content/w01–w12.js   lessons, quizzes and section tests per week
  content/glossary.js  general terms and abbreviations for the word bank (weeks add their own)
  content/finals.js    mock-exam question bank
  content/formulas.js  formula sheet
  widgets1–3.js        interactive models
  figures.js           diagrams (inline SVG)
  math.js              KaTeX typesetting of $…$ and $$…$$ in any rendered text
  app.js               engine: plan, clock, routing, quizzes, exams
  styles.css
build.py               bundles src/ into index.html (and dist/ for publishing)
vendor/katex/         KaTeX 0.16.11 (script, styles and fonts are inlined by build.py)
tools/validate.js      checks every question, card reference, every formula (KaTeX parse, no plain-text maths) and the 16-hour total
tools/student-audit.js       readability grade, time-per-topic estimate and unexplained abbreviations
tools/student-walkthrough.js a simulated learner works through the whole built app in a browser (needs Playwright)
```

Content strings that contain LaTeX use `R` (`String.raw`) template literals so backslashes survive, e.g. ``R`$\frac{a}{b}$` ``.

The learner walkthrough and its findings are written up in [docs/student-walkthrough.md](docs/student-walkthrough.md).

```
node tools/validate.js && python3 build.py
```

Lesson content was written from the lecture titles and descriptions, the course introduction, full transcripts of the most exam-heavy lectures (5, 16, 24, 33, 45, 62, 70, 74), and the official lecture slides, Week 11–12 notebooks and Week 12 notes. The slides' worked numbers (momentum as an EWMA, VAE forward pass, KL costs, GAN losses, AdaIN, diffusion posterior, classifier-free guidance in the (1 + s) form, the self-attention example, LoRA's 7% saving, temperature and sampling tables) are reproduced, and where the slides differ from common textbook forms, the lessons follow the course's notation.
