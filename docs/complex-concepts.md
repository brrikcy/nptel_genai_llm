# The hardest concepts, and the help each one has

## How the hard concepts were found

Every lesson card was scored by how dense it is with maths:

- the number of equations;
- symbols such as $\mathbb{E}$, $\nabla$, $\sum$, $\log$ and $\bar{\alpha}$;
- fractions;
- the number of steps in each worked example.

The cards were then ranked by that score. The topics listed below are where a Class 10 learner is most likely to get stuck. In each of them, the difficulty is a formula that has to be *felt*, not just read.

## The hardest concepts, ranked

| # | Concept (topic) | Why it is hard | Interactive help now on that card |
|---|---|---|---|
| 1 | **The GAN objective**: discriminator and generator losses, and the non-saturating trick (w5t2) | A min-max of two expectations of logs, and two networks pulling opposite ways | *GAN loss dials* |
| 2 | **The diffusion training target**, $\tilde{\mu}$ and $\tilde{\beta}_t$ (w7t4) | Long fractions of $\bar{\alpha}$ and $\beta$ with no visible meaning | **New: *Tug of war between x₀ and xₜ***. Slide $\bar{\alpha}_{t-1}$, $\beta_t$ and $x_t$, and watch the bell curve for $x_{t-1}$ move. A bar shows how much weight $x_0$ and $x_t$ each get, so the fraction becomes "who wins the tug of war". Also *Reverse diffusion in one dimension*. |
| 3 | **The ELBO** (w3t2) | $\log p(x)$ cannot be computed, and the idea of a lower bound is abstract | **New: *The ELBO is a floor under log p(x)***. Bars for log p(x), ELBO, the gap, the rebuild term and the KL term. A better decoder lifts log p(x), and a better encoder shrinks the gap; the floor never goes above the ceiling. |
| 4 | **Loss functions**, cross-entropy vs squared error (w1t2) | Why use $-\log$ and not $(y-\hat{y})^2$? | **New: *Loss explorer***. Pick the true answer, then drag the prediction. Cross-entropy shoots to infinity when the model is confidently wrong, while squared error stays at or below 1. Also activation explorer and softmax bars. |
| 5 | **Backpropagation and the chain rule** (w0t4) | A "product of slopes" is hard to picture | **New: *Follow the gradient backwards***. A computation graph: the forward pass is shown in black, and the backward pass multiplies the slopes in red. "Take a step" runs one update of gradient descent and the loss falls. |
| 6 | **The gradient through the VAE encoder** (w3t3) | Why sampling blocks the gradient, and how the trick fixes it | The same chain-rule model, in its "VAE with the trick" and "VAE without the trick" modes. Without the trick, the gradient stops at the random draw ("a random draw has no slope"). Also *The reparameterisation trick* sampler. |
| 7 | **Adaptive optimizers**: momentum, RMSProp and Adam (w1t3) | Moving averages of gradients and of squared gradients | *Optimizer race* |
| 8 | **Training a GAN step by step** (w5t1) | Two alternating updates | *Watch a GAN train, round by round* |
| 9 | **Sampling temperature, top-k and top-p** (w12t1) | Dividing the logits by T before the softmax | *Next-token sampler* |
| 10 | **KL divergence** (w3t1) | An expectation of a log-ratio, and it is not symmetric | *Surprise, entropy, cross-entropy*, *KL divergence with bar charts*, *KL playground*, *Mode covering vs mode seeking* |
| 11 | **The full VAE loss, by hand** (w3t4) | Many steps in a row | *VAE loss calculator* |
| 12 | **The forward diffusion shortcut** $x_t = \sqrt{\bar{\alpha}_t}\,x_0 + \sqrt{1-\bar{\alpha}_t}\,\varepsilon$ (w7t3) | Square roots of products of schedules | *The shortcut, one pixel at a time* and *Forward diffusion: ruin an image on schedule* |
| 13 | **Convolution output size** $\lfloor (n + 2p - k)/s \rfloor + 1$ (w1t4) | A floor function and four variables | *A picture is a grid of numbers* and *Convolution, step by step* |
| 14 | **Conditional GAN losses** (w6t1) | The same min-max, now conditioned on $y$; this topic had **no** interactive model | **New: *Ask for a digit: plain GAN vs conditional GAN***. The plain generator ignores the requested digit. The conditional one obeys it, and the noise $z$ only changes the style. A "cheat test" shows that only $D(x, y)$ catches a perfect 7 labelled "3". |
| 15 | **Low-rank updates (LoRA)** (w11t2) | Why can $B \cdot A$ with a small $r$ replace a full $\Delta W$? | **New: *Why a low rank is enough***. Two 8 × 8 heatmaps: the change that is needed, and its rank-r copy. Raise r and watch the error fall to almost 0 by r = 3. The saving is then worked out for a real 768 × 768 layer. Also *LoRA parameter calculator*. |

## What the new explainers have in common

- **One dial per symbol.** Each slider is one letter from the formula, labelled in words, for example $\bar{\alpha}_{t-1}$ "(1 = early, clean; 0 = late, noisy)".
- **The formula stays live.** The readout under each picture is the exam formula, with your current numbers filled in.
- **A sentence that explains the change.** Each one says why the picture moved, in plain words.
- **Built into the path.** In a lesson, a card with a model cannot be continued until you have tried the model. So every learner on the path uses all six new explainers.

## Checks

- `tools/validate.js`: content OK, 63 models.
- `tools/path-walkthrough.js`: all 122 levels completed and no errors.
- `tools/student-walkthrough.js`: 53 topics, every model exercised, no issues.
- Every new model was checked at desktop (1280 px) and phone (375 px) width:
  - sliders and buttons work;
  - no maths errors;
  - no NaN values;
  - no sideways overflow.
