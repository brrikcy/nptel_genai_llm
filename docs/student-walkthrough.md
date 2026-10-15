# A Class 10 student's 16-hour run through the GenAI Sprint

**Question:** can a Class 10 student who has never studied machine learning use this app for 16 hours and walk into the NPTEL *Fundamentals of Generative AI and LLMs* exam ready to pass?

**How it was tested:**

1. **Reading as the student.** I went through the course in plan order, as a 15-year-old with Class 10 maths (fractions, powers, basic probability, coordinate graphs) and no calculus, statistics or coding. For each topic I asked: do I know every word and symbol before it is used? Can I follow each step of the worked example? Do I know what the exam will ask?
2. **Measuring the text** (`node tools/student-audit.js`):
   - Flesch–Kincaid reading grade of every card.
   - Abbreviations used before they are explained.
   - A study-time estimate for every topic at two learner paces, compared with the planned minutes.
3. **A simulated learner in a real browser** (`node tools/student-walkthrough.js`). It clears its progress and then:
   - opens all 53 topics in order;
   - moves every slider and presses every button on every interactive model;
   - opens a word-bank popup on each page;
   - answers every topic quiz, all 13 section tests and the three mocks, getting each question right 85% of the time;
   - checks every mark the app gives against the answer key;
   - finally reloads every topic on a 390 px phone screen and checks for sideways scrolling.

Every check was run again after the fixes below.

---

## The plan the student follows

There are 8 sessions of about 2 hours each: 800 min of topics, 13 section tests of 10 min each, and 30 min of revision, which makes exactly 16 h.

| Session | Covers | What it felt like |
|---|---|---|
| 1 | Week 0 maths toolkit → activation and loss functions | Week 0 is the safety net. Conditional probability on a grid of 100 emails, logs as “how many times do I multiply”, Σ as “add them all up”, slopes and gradient descent as walking downhill. After it, “cross-entropy $= -\log(\text{probability of the right answer})$” reads as plain arithmetic. |
| 2 | Optimizers, convolutions, CNNs, autoencoders | The pixel-grid convolution and the output-size formula $\left\lfloor \frac{n + 2p - f}{s} \right\rfloor + 1$ come with worked numbers, which is exactly what the numerical questions use. Autoencoders (“squeeze and rebuild”) are easy. |
| 3 | Regularised AEs → entropy, KL → the VAE | The hardest stretch for a beginner. Entropy and KL rely on Week 0 logs, and the KL bars model makes the asymmetry visible. The ELBO card is heavy with symbols such as $q_\phi(z \mid x)$; the new “What the exam asks” box tells the student to learn the two parts and the KL formula, not the derivation. |
| 4 | β-VAE, cVAE, interpolation → GANs | Comfortable. The forger-vs-detective analogy and the GAN-rounds model make the min–max game concrete; $L_D = -\ln D(x) - \ln(1 - D(G(z)))$ is just two logs. |
| 5 | cGAN, Pix2Pix, CycleGAN, StyleGAN → diffusion forward process | StyleGAN's AdaIN is easy with the slider (“wipe the old style, paint a new one”). The diffusion noise model shows a picture dissolving step by step. |
| 6 | DDPM reverse process, U-Net, guidance, Stable Diffusion → RNNs, attention | The second hard stretch: $\tilde{\mu}_t$ and $\tilde{\beta}_t$ with bars and tildes. The new “What the exam asks” box tells the student which numbers to plug in. Attention is clear with the query/key/value analogy and the worked softmax. |
| 7 | Transformer decoder, BERT, GPT, prompting → ICL, LoRA, RAG | Easy to read. The fill-the-blank and next-word models make BERT vs GPT obvious. The LoRA saving is one fraction. |
| 8 | Week 12 (decoding, multimodal, benchmarks, metrics, ethics) → revision | Easy to read. The sampling bar ($U = 0.57$ lands in “cat”), the CLIP matcher and the fairness dots are the most memorable models. Formula sheet and mistake book for the last 30 minutes. |

---

## What the measurements say (after the fixes)

| Check | Result |
|---|---|
| Reading grade (Flesch–Kincaid) | Median **5.7**, topics range 3.1–8.7, **no topic above grade 10**. The hardest single cards (≈ grade 10–11) are reference tables of benchmark names. |
| Every topic has a picture or a model | **Yes**: 58 diagrams and 57 interactive models across 53 topics |
| Maths shown as real notation | **3,800+** formulas typeset. Validator: **0** plain-text formulas, **0** KaTeX errors. The browser found **0** stray `$` and **0** raw LaTeX on any page, including inside models after interaction. |
| Unexplained abbreviations | Were **40+** (SVM, MLP, GELU, BLEU, TPR, …). Now **0** real ones. The audit still flags 43 items, but all are proper names (CVPR, AIIMS), capitals used for emphasis (“NOT”, “REAL”) or symbols that sit inside a formula with its meaning next to it. |
| Word-bank popups | 53 of 53 pages: working |
| Interactive models | 60 models on topic pages, 414 slider moves and clicks: **no script errors** |
| Quiz marking | 368 topic-quiz answers: the app's marks match the answer key **every time** |
| Section tests and mocks | All 13 tests and 3 mocks run end to end, score and record. The simulated 85% learner got 44/55, 46/55 and 47/54 on the mocks, which is the 80–87% band. |
| Phone (390 px) | Was: 2 pages scrolled sideways. Now: **none** of the 53 topics or 5 main views. |

### Time: does it fit in 16 hours?

The planned topic time is 800 minutes. I estimated the honest time per topic as reading time + time per formula, diagram and model + time per quiz question:

| Learner | Reading speed | Per quiz question (MCQ / MSQ / numerical) | Topic time | Whole plan |
|---|---|---|---|---|
| Brisk | 160 words/min | 30 s / 45 s / 75 s | **712 min** (89% of plan) | ≈ 14.5 h |
| Careful first-timer | 130 words/min | 45 s / 60 s / 90 s | **926 min** (116% of plan) | ≈ 18.1 h |

**Verdict on time:**
- 16 h fits a learner who reads at an average pace.
- A careful beginner who works every example and every model should expect **about 18 hours**. The study clock and the pace check on the home page will show this early.
- The quizzes (368 questions) take roughly 40% of the topic time. They are the active practice that makes the content stick, so I kept them.

Before the fix, the per-topic minutes did not match the work involved. Activation and loss functions (w1t2) needed about 26 min but was given 16; prompting (w10t4) needed about 10 but was given 17. All 53 topics' minutes are now set in proportion to the estimated work. The total stays 800, so no topic is more than 25% over its slot.

---

## Problems found and fixed during the walkthrough

| What the student hit | Fix |
|---|---|
| Abbreviations such as SVM, MLP, GELU, ELU, MAE, RGB, VGG, T5, ELMo, SFT, PPO, DPO, FAISS, BART, SQL, BLEU, ROUGE, TPR, FPR, MBPP, MMMU, NQ, used without explanation | 28 entries added to the word bank. Each is underlined on first use and opens a plain definition. Two in-text expansions added: PER/ORG tags, “SD” = Stable Diffusion. |
| Topic minutes out of step with the work (some topics 85% over, others half-empty) | Minutes re-allocated from the effort estimate; the total is unchanged |
| “Do I need to memorise this derivation?” on the ELBO, the diffusion posterior, the GAN discriminator loss and the CycleGAN losses | A green **“What the exam asks”** box on each of these cards, naming exactly what to calculate and what to recognise |
| Hardest prose card (encoder outputs, grade 11) | Rewritten in short sentences with a two-item list |
| Small inline fractions hard to read | Top-level inline fractions are now drawn full size (stacked), e.g. $\frac{3}{7}$ |
| Formula sheet and mock bank still in plain text (`p(y|x) = p(x|y)p(y)/p(x)`) | All typeset. The formula sheet gained a Week 0 section and a one-line “in plain words” note under key formulas; the answer keys were checked to be unchanged. |
| Phone: two pages scrolled sideways | A long covariance sum split into display lines. KaTeX's hidden screen-reader copy was escaping the table's scroll box; it is now anchored to its formula, which fixes this everywhere. |
| Week 12 figures and models (earlier in this pass) | Overlapping labels in the token pipeline and sampling bar fixed; CLIP-matcher label column widened |

---

## What remains hard (honest limits)

- **Weeks 3 and 7 stay the steepest.** The course itself is built on probability distributions, logs, KL divergence and Gaussian algebra. Week 0, the plain-words boxes, worked numbers and models make every step followable, but a Class 10 student will need to slow down there and use the word bank. Expect those two weeks to take the full planned time or more.
- **Integrals and gradients appear by name.** $\int$ is explained as “add up over every possible $z$” and $\nabla L$ as “the list of slopes, one per weight”. That is enough for the exam, which asks for the idea and for plugging in numbers, not for calculus.
- **The time estimate is a model, not a stopwatch.** Reading speed and quiz speed vary a lot between students. The app's own study clock is the real measure; the pace check on the home page compares done-work with time used.
- **Lecture videos are not included in the 16 hours.** The app links to every source lecture and lets the student log video time, but the 16 hours assume the lessons replace the videos.
- **Readability formulas undercount technical difficulty.** A grade-6 sentence can still contain a hard idea. That is why the human read-through above matters as much as the numbers.

## Verdict

**Mostly yes.** A motivated Class 10 student can follow every topic:
- the maths is introduced in Week 0 before it is needed;
- every formula is shown in proper notation with worked numbers;
- every topic has a diagram or a model to play with;
- every term is one tap away.

The app's mechanics work end to end: quizzes, section tests, mocks, mistake book and phone layout. The main caveat is time: a careful beginner should plan for about 18 hours, not 16, and give Weeks 3 and 7 extra attention.

To reproduce:

```
node tools/validate.js && python3 build.py
node tools/student-audit.js --pace=careful   # and --pace=brisk, --cards
node tools/student-walkthrough.js            # needs Playwright
```
