# GenAI 16-Hour Sprint

An interactive, self-paced study system for the NPTEL course **Fundamentals of Generative AI and Large Language Models: Theory and Practice** (IISc Bangalore, Prof. Sriram Ganapathy with Prof. Baishali Garai and Prof. Ashwini Kodipalli). It is built from the [official lecture playlist](https://www.youtube.com/playlist?list=PLgMDNELGJ1Ca_DduFvH6qfI1eapL48xOr) in teaching order.

**To use it:** open `index.html` in any modern browser. Nothing to install. It works offline; fonts load from Google Fonts when online and fall back to system fonts otherwise.

## What's inside

| | |
|---|---|
| **12 weeks → 48 topics** | Every lecture (1–74) is mapped to a topic. Each topic opens with a puzzle to answer before the lesson, teaches the idea in short cards, and ends with exam takeaways, common traps and links to the source lectures. |
| **31 interactive models** | Activation explorer, optimizer race, step-by-step convolution, CNN layer calculator, autoencoder bottleneck, KL playground, forward vs reverse KL, reparameterisation sampler, VAE loss calculator, latent interpolation, β-VAE traversal, GAN loss dials, a trainable 1-D GAN, forward diffusion with schedules, classifier-free guidance, U-Net tour, word-vector analogies, LSTM cell, self-attention, positional encoding, BPE merges, a temperature/top-k/top-p sampler, a prompting game, LoRA calculator, mini-RAG, EM/F1/ROUGE-L calculator, safety policy gate, scaling laws, and more. |
| **Topic quizzes** (pass 80%) | Instant feedback. A wrong answer explains why and links straight to the lesson card to re-read and the lecture video to watch. |
| **12 section tests** (pass 70%) | NPTEL-style, with a topic-by-topic breakdown and a repair plan. |
| **3 final mock exams** | 54–55 questions each from a separate bank of 164, 75-minute timer, NPTEL-style question palette with mark-for-review, and a projected certificate band. |
| **649 questions** | MCQ, MSQ (multiple select) and numerical-answer types, matching NPTEL's formats. |
| **Study clock** | Counts active time only (pauses after 4 idle minutes or when the tab is hidden). Tracks time per topic, week and day against the 16-hour plan, and lets you log time spent watching lecture videos. |
| **Plan** | 810 min of topics + 12 × 10 min section tests + 30 min revision = exactly 16 h, packed into eight 2-hour sessions. The mocks are extra. |
| **Also** | Formula sheet, mistake book (every missed question until you get it right), exam pattern and strategy, progress backup and restore, light and dark themes, phone layout. |

Progress is stored in the browser's `localStorage`. Use **Progress backup** to move it to another device.

## Development

```
src/
  lectures.js          lecture → YouTube id / title / duration
  content/w01–w12.js   lessons, quizzes and section tests per week
  content/finals.js    mock-exam question bank
  content/formulas.js  formula sheet
  widgets1.js, widgets2.js   interactive models
  app.js               engine: plan, clock, routing, quizzes, exams
  styles.css
build.py               bundles src/ into index.html (and dist/ for publishing)
tools/validate.js      checks every question, card reference and the 16-hour total
```

```
node tools/validate.js && python3 build.py
```

Lesson content was written from the lecture titles and descriptions, the course introduction, full transcripts of the most exam-heavy lectures (5, 16, 24, 33, 45, 62, 70, 74), and the official lecture slides, Week 11–12 notebooks and Week 12 notes. The slides' worked numbers (momentum as an EWMA, VAE forward pass, KL costs, GAN losses, AdaIN, diffusion posterior, classifier-free guidance in the (1 + s) form, the self-attention example, LoRA's 7% saving, temperature and sampling tables) are reproduced, and where the slides differ from common textbook forms, the lessons follow the course's notation.
