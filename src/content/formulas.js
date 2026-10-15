/* Formula sheet. Each item: [name, formula (LaTeX inside $…$), optional plain-words note]. */
COURSE.formulas.push(
  { w: "Week 0", h: "Maths toolkit", items: [
    ["Conditional probability", R`$$P(A \mid B) = \frac{P(A, B)}{P(B)}$$`, "Of the cases where B happened, what share also had A?"],
    ["Bayes' rule", R`$$P(y \mid x) = \frac{P(x \mid y)\, P(y)}{P(x)}$$`, "Turn “how likely is the evidence given the class” into “how likely is the class given the evidence”."],
    ["Logs and exponents", R`$\log(ab) = \log a + \log b$ · $\log a^n = n \log a$ · $e^{\ln x} = x$ · $\ln 1 = 0$`],
    ["Sum sign", R`$\sum_{i=1}^{n} x_i = x_1 + x_2 + \dots + x_n$`, R`$\sum$ just means “add them all up”.`],
    ["Dot product", R`$u \cdot v = \sum_i u_i v_i$; $\;\lVert u \rVert = \sqrt{u \cdot u}$`],
    ["Chain rule", R`$$\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$$`, "Multiply the rates along the chain; this is all backpropagation does."],
    ["Mean and variance", R`$\mu = \frac{1}{n} \sum_i x_i$; $\;\sigma^2 = \frac{1}{n} \sum_i (x_i - \mu)^2$`, "Variance is the average squared distance from the mean."],
    ["Normal (bell curve)", R`$$\mathcal{N}(x; \mu, \sigma^2) = \frac{1}{\sqrt{2\pi}\, \sigma}\, e^{-\frac{(x - \mu)^2}{2\sigma^2}}$$`]
  ]},
  { w: "Week 1", h: "Losses and activations", items: [
    ["Mean squared error", R`$$\text{MSE} = \frac{1}{n} \sum (y - \hat{y})^2$$`],
    ["Binary cross-entropy", R`$$\text{BCE} = -\frac{1}{n} \sum \big[ y \log \hat{y} + (1 - y) \log(1 - \hat{y}) \big]$$`],
    ["Categorical cross-entropy", R`$$\text{CE} = -\sum_k y_k \log \hat{y}_k$$`, R`With a one-hot target this is just $-\log(\text{probability of the true class})$.`],
    ["Softmax", R`$$\hat{y}_k = \frac{e^{z_k}}{\sum_j e^{z_j}}$$`, "Turns any scores into probabilities that add up to 1."],
    ["Sigmoid and its derivative", R`$\sigma(z) = \frac{1}{1 + e^{-z}}$; $\;\sigma' = \sigma(1 - \sigma) \le 0.25$`],
    ["Output pairing", R`continuous → linear + MSE · binary → sigmoid + BCE · $K$ classes → softmax + CE`],
    ["Handy logs", R`$\ln 0.1 = -2.303$ · $\ln 0.5 = -0.693$ · $\ln 0.8 = -0.223$ · $\ln 0.9 = -0.105$`],
    ["Leaky ReLU / ELU", R`Leaky ReLU $= \max(0.01z, z)$ · ELU $= z$ if $z > 0$, $\alpha(e^z - 1)$ if $z \le 0$`],
    ["GELU / SiLU", R`GELU $= z \cdot \Phi(z)$ (Transformers) · SiLU (Swish) $= z \cdot \sigma(z)$ (diffusion U-Nets)`],
    ["Generative output heads", "Gaussian (real numbers) · Bernoulli (binary) · Categorical (classes / tokens)"]
  ]},
  { w: "Week 1", h: "Optimizers", items: [
    ["Gradient descent", R`$$\theta \leftarrow \theta - \eta \nabla L$$`, R`Take a small step downhill; $\eta$ is the step size (learning rate).`],
    ["Momentum (course form, EWMA)", R`$v_t = \beta v_{t-1} + (1 - \beta) g_t$; $\;w \leftarrow w - \eta v_t$ ($\beta \approx 0.9$; lecture: $0.9 \times 1.645 + 0.1 \times (-4) = 1.0805$)`],
    ["Momentum (classic form)", R`$v = \beta v + \eta \nabla L$; $\;\theta \leftarrow \theta - v$`],
    ["AdaGrad", R`$G \mathrel{+}= g^2$; $\;\theta \leftarrow \theta - \frac{\eta\, g}{\sqrt{G} + \epsilon}$`, "The step size keeps shrinking towards 0."],
    ["RMSProp", R`$s = \rho s + (1 - \rho) g^2$; $\;\theta \leftarrow \theta - \frac{\eta\, g}{\sqrt{s} + \epsilon}$`],
    ["Adam", R`$m = \beta_1 m + (1 - \beta_1) g$; $\;v = \beta_2 v + (1 - \beta_2) g^2$; $\;\hat{m} = \frac{m}{1 - \beta_1^t}$; $\;\hat{v} = \frac{v}{1 - \beta_2^t}$; $\;\theta \leftarrow \theta - \frac{\eta\, \hat{m}}{\sqrt{\hat{v}} + \epsilon}$`],
    ["Updates per epoch", R`$\left\lceil \frac{N}{\text{batch size}} \right\rceil$`]
  ]},
  { w: "Week 1", h: "CNN arithmetic", items: [
    ["Output size", R`$$\left\lfloor \frac{n + 2p - f}{s} \right\rfloor + 1$$`, "n input size, p padding, f filter size, s stride."],
    ["'same' padding (stride 1)", R`$p = \frac{f - 1}{2}$`],
    ["Conv parameters", R`$(f \cdot f \cdot C_{\text{in}} + 1) \cdot K$`, "The +1 is the bias of each of the K filters."],
    ["Dense parameters", R`$(\text{inputs} + 1) \cdot \text{outputs}$`],
    [R`Pooling $2 \times 2$, stride 2`, "Halves height and width, keeps channels, 0 parameters (max, average or min)."],
    ["Transposed conv output", R`$(n - 1) \cdot s - 2p + f$`]
  ]},
  { w: "Week 2", h: "Autoencoders", items: [
    ["Neuron", R`$$a = f\Big(\sum_i w_i x_i + b\Big)$$`],
    ["Sparse AE penalty", R`$\beta \sum_j \text{KL}(\rho \,\Vert\, \hat{\rho}_j)$, $\;\text{KL} = \rho \log \frac{\rho}{\hat{\rho}} + (1 - \rho) \log \frac{1 - \rho}{1 - \hat{\rho}}$`, "Pushes each hidden unit's average activation towards a small target ρ."],
    ["Contractive AE penalty", R`$\lambda \left\lVert \frac{\partial h}{\partial x} \right\rVert_F^2$`],
    ["Denoising AE", R`input $\tilde{x} = x + \text{noise}$; loss $L(x, \hat{x})$ against the CLEAN $x$`],
    ["Under / overcomplete", "latent smaller than input · latent at least as big as input (can just copy)"]
  ]},
  { w: "Week 3", h: "Information theory", items: [
    ["Self-information", R`$I(x) = -\log p(x)$`, "Rare events carry more surprise."],
    ["Entropy", R`$H(P) = -\sum p \log p$ (fair coin $= 1$ bit)`],
    ["Cross-entropy", R`$H(P, Q) = -\sum p \log q = H(P) + \text{KL}(P \,\Vert\, Q)$`],
    ["KL divergence", R`$\text{KL}(P \,\Vert\, Q) = \sum p \log \frac{p}{q} \ge 0$, not symmetric`],
    ["KL of two Gaussians", R`$$\ln \frac{\sigma_2}{\sigma_1} + \frac{\sigma_1^2 + (\mu_1 - \mu_2)^2}{2\sigma_2^2} - \frac{1}{2}$$`],
    ["Direction", R`$\text{KL}(P \,\Vert\, Q)$: mode covering · $\text{KL}(Q \,\Vert\, P)$: mode seeking`]
  ]},
  { w: "Week 3–4", h: "VAE", items: [
    ["ELBO", R`$$\log p(x) \ge \mathbb{E}_q[\log p(x \mid z)] - \text{KL}(q(z \mid x) \,\Vert\, p(z))$$`, "Reconstruction reward minus a penalty for straying from the prior."],
    ["Gap", R`$\log p(x) - \text{ELBO} = \text{KL}(q(z \mid x) \,\Vert\, p(z \mid x))$`],
    ["VAE loss", R`$$\text{Recon (MSE/BCE)} + \frac{1}{2} \sum (\mu^2 + \sigma^2 - \log \sigma^2 - 1)$$`],
    ["Keras form of KL", R`$-\frac{1}{2} \sum (1 + \log \sigma^2 - \mu^2 - \sigma^2)$`],
    ["Variance from log-variance", R`$\sigma^2 = e^{\log \sigma^2}$; $\;\sigma = e^{\frac{1}{2} \log \sigma^2}$`],
    ["Reparameterisation", R`$z = \mu + \sigma \odot \epsilon$, $\;\epsilon \sim \mathcal{N}(0, I)$; $\;\frac{\partial z}{\partial \mu} = 1$, $\frac{\partial z}{\partial \sigma} = \epsilon$`, R`Move the randomness into $\epsilon$ so gradients can flow through $\mu$ and $\sigma$.`],
    [R`$\beta$-VAE`, R`$\text{Recon} + \beta \cdot \text{KL}$ ($\beta > 1$: more disentangled, blurrier)`],
    ["cVAE", R`$q(z \mid x, c)$, $p(x \mid z, c)$; input size $= x + c$`],
    ["Interpolation", R`$z(\alpha) = (1 - \alpha) z_1 + \alpha z_2$`]
  ]},
  { w: "Week 5–6", h: "GANs", items: [
    ["Discriminator loss", R`$L_D = -\log D(x) - \log(1 - D(G(z)))$`],
    ["Value function", R`$$\min_G \max_D \; \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1 - D(G(z)))]$$`, "The detective D maximises, the forger G minimises."],
    ["Non-saturating G loss", R`$\min \; -\log D(G(z))$`],
    ["Optimal discriminator", R`$$D^* = \frac{p_{\text{data}}}{p_{\text{data}} + p_g}$$`],
    ["At optimum", R`$V = -\log 4 + 2 \cdot \text{JSD}$; at equilibrium $D^* = \frac{1}{2}$, $V = -1.386$`],
    ["DCGAN", R`strided conv (D), transposed conv (G), BatchNorm, ReLU/tanh (G), LeakyReLU $0.2$ (D), Adam $2 \times 10^{-4}$, $\beta_1 = 0.5$`],
    ["Pix2Pix", R`$L_{\text{cGAN}} + \lambda L_1$, $\lambda = 100$; U-Net G; $70 \times 70$ PatchGAN D`],
    ["CycleGAN", R`2 G + 2 D; $\;L_{\text{cyc}} = \lVert F(G(x)) - x \rVert_1 + \lVert G(F(y)) - y \rVert_1$, $\lambda = 10$; identity loss`],
    ["StyleGAN", R`mapping MLP (8 layers) $z \to w$; learned constant $4 \times 4$ input; 18 convs ($9$ resolutions $\times 2$); AdaIN; noise; StyleGAN2: weight (de)modulation`],
    ["AdaIN", R`$$y_s \cdot \frac{x - \mu(x)}{\sigma(x)} + y_b$$`, "Wipe the old style (normalise), then paint the new one (scale and shift)."],
    ["Demodulation", R`$w' = s \cdot w$; $\;w'' = \frac{w'}{\sqrt{\sum w'^2 + \epsilon}}$`],
    ["Pix2Pix training", R`Adam lr $0.0002$, $\beta_1 = 0.5$, $\beta_2 = 0.999$; D is thrown away at inference`]
  ]},
  { w: "Week 7–8", h: "Diffusion", items: [
    ["Forward step", R`$q(x_t \mid x_{t-1}) = \mathcal{N}(\sqrt{1 - \beta_t}\, x_{t-1}, \beta_t I)$`],
    ["Notation", R`$\alpha_t = 1 - \beta_t$; $\;\bar{\alpha}_t = \prod_s \alpha_s$`],
    ["Closed form", R`$$x_t = \sqrt{\bar{\alpha}_t}\, x_0 + \sqrt{1 - \bar{\alpha}_t}\, \epsilon$$`, "Jump straight to any noise level: some picture plus some noise."],
    ["SNR", R`$\frac{\bar{\alpha}_t}{1 - \bar{\alpha}_t}$`],
    ["DDPM schedule", R`linear $\beta$: $10^{-4} \to 0.02$, $T = 1000$`],
    ["Loss", R`$\lVert \epsilon - \epsilon_\theta(x_t, t) \rVert^2$`, "Guess the noise that was added."],
    ["Reverse mean", R`$$\mu_\theta = \frac{1}{\sqrt{\alpha_t}} \Big( x_t - \frac{\beta_t}{\sqrt{1 - \bar{\alpha}_t}}\, \epsilon_\theta \Big)$$`],
    [R`$x_0$ estimate`, R`$$\hat{x}_0 = \frac{x_t - \sqrt{1 - \bar{\alpha}_t}\, \hat{\epsilon}}{\sqrt{\bar{\alpha}_t}}$$`],
    ["CFG (course form)", R`$\hat{\epsilon} = (1 + s)\, \epsilon(x_t, t, y) - s\, \epsilon(x_t, t, \varnothing)$; $\;s = 0$ → plain conditional`],
    ["CFG (w form)", R`$\tilde{\epsilon} = \epsilon(\varnothing) + w\big(\epsilon(y) - \epsilon(\varnothing)\big)$, $\;w = 1 + s$`],
    ["Classifier guidance", R`$\nabla \log p(x_t \mid y) = \nabla \log p(x_t) + s \nabla \log p(y \mid x_t)$; $\;\nabla \log p(x_t) = -\frac{\epsilon_\theta}{\sqrt{1 - \bar{\alpha}_t}}$`],
    ["Posterior variance", R`$$\tilde{\beta}_t = \frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t} \cdot \beta_t$$`],
    ["U-Net residual block", R`GN → SiLU → Conv → $+\, W_t \cdot \text{TE}(t)$ → GN → SiLU → Conv → + skip`],
    ["Latent diffusion", R`$512 \times 512 \times 3 \to 64 \times 64 \times 4$ ($f = 8$, $48\times$ fewer values)`],
    ["Covariance", R`$\text{Cov}(X, Y) = \mathbb{E}[(X - \mu_X)(Y - \mu_Y)]$; divide by $n$ (population) or $n - 1$ (sample)`]
  ]},
  { w: "Week 9", h: "Sequence models and attention", items: [
    ["TF-IDF", R`$\text{tf}(t, d) \times \log \frac{N}{\text{df}(t)}$`, "Frequent in this document, rare across documents → important."],
    ["Cosine similarity", R`$$\cos = \frac{u \cdot v}{\lVert u \rVert \, \lVert v \rVert}$$`],
    ["RNN", R`$h_t = \tanh(W_{xh} x_t + W_{hh} h_{t-1} + b)$`],
    ["LSTM", R`$c_t = f \odot c_{t-1} + i \odot g$; $\;h_t = o \odot \tanh(c_t)$`],
    ["Attention", R`$$\text{softmax}\Big(\frac{Q K^\top}{\sqrt{d_k}}\Big) V$$`, "Each word scores every other word, then takes a weighted average of their values."],
    ["Multi-head", R`$d = h \times d_k$ ($512 / 8 = 64$)`],
    ["Positional encoding", R`$PE_{(pos, 2i)} = \sin\big(pos / 10000^{2i/d}\big)$; $\;PE_{(pos, 2i+1)} = \cos\big(pos / 10000^{2i/d}\big)$`],
    ["Encoder layer", R`MHA → Add&Norm → FFN ($512 \to 2048 \to 512$) → Add&Norm; $N = 6$`]
  ]},
  { w: "Week 10", h: "LLMs and prompting", items: [
    ["BERT", "encoder-only; Base 12L/768/12H/110M; Large 24L/1024/16H/340M"],
    ["MLM", "15% selected → 80% [MASK], 10% random, 10% unchanged"],
    ["GPT", R`decoder-only; loss $-\sum_t \log P(x_t \mid x_{\lt t})$`, "Predict each next token from the ones before it."],
    ["DistilBERT", "distilled, smaller and faster; keeps about 95% of BERT's performance (course slides)"],
    ["GPT sizes", "GPT-1 117M · GPT-2 1.5B · GPT-3 175B"],
    ["Tokenisers", "BPE (GPT) · WordPiece ## (BERT) · SentencePiece/Unigram (T5)"],
    ["Prompting", "zero / one / few (2–5) shot · CoT · role · structured output"]
  ]},
  { w: "Week 11", h: "ICL, LoRA, RAG", items: [
    ["LoRA (course form)", R`$W = W_0 + \alpha BA$; $\;W_0 \in \mathbb{R}^{D \times d}$, $B \in \mathbb{R}^{D \times r}$, $A \in \mathbb{R}^{r \times d}$; trainable $r(D + d)$`, "Freeze the big matrix; learn two thin ones whose product is the change."],
    ["LoRA saving (slide)", R`$D = 1024$, $d = 128$, $r = 8$ → $\frac{8 \times 1152}{131{,}072} = 0.0703 \approx 7\%$`],
    ["LoRA (paper / tutorial)", R`scale $\frac{\alpha}{r}$; $B = 0$ at the start; usually on the Q and V projections`],
    ["ICL", R`$\hat{y} = \arg\max_y p(y \mid I, D_{\text{demo}}, x)$, weights frozen`],
    ["QLoRA", "4-bit NF4 frozen base + LoRA"],
    ["RAG", "chunk → embed → vector DB · query → embed → top-k → augment → generate"],
    ["RAG (Lewis 2020)", R`$p(y \mid x) \approx \sum_{z \in \text{top-}k} p_\eta(z \mid x)\, p_\theta(y \mid x, z)$; retriever: BERT encoders + MIPS`],
    ["Memory", "parametric (weights) vs non-parametric (index)"],
    ["Advanced RAG", "Graph RAG (knowledge graph, multi-hop) · Agentic RAG (tools, planning, ReAct)"],
    ["GraphRAG indexing", "chunks → LLM extracts entities/relations → graph → Leiden communities → community summaries"]
  ]},
  { w: "Week 12", h: "Decoding, evaluation, ethics", items: [
    ["Temperature softmax", R`$$p_i = \frac{e^{z_i / T}}{\sum_j e^{z_j / T}}$$`, "T below 1: sharper (safer); T above 1: flatter (more creative)."],
    ["Top-k / top-p", R`keep the $k$ most likely · keep the smallest set whose probabilities add up to $p$`],
    ["Sampling with U", R`slices car $0$–$0.1$, dog $0.1$–$0.35$, cat $0.35$–$0.95$, quantum $0.95$–$1$: $U = 0.57$ → cat, $U = 0.32$ → dog`],
    ["Temperature example", R`logits cat 5, dog 4, car 1: $T = 0.5$ → $0.881 / 0.119 / 0.000$ · $T = 1$ → $0.721 / 0.265 / 0.013$ · $T = 2$ → $0.574 / 0.348 / 0.078$`],
    ["Token F1", R`$P = \frac{\text{overlap}}{|\text{pred}|}$, $\;R = \frac{\text{overlap}}{|\text{ref}|}$, $\;F_1 = \frac{2PR}{P + R}$`],
    ["ROUGE-L", "F-score on the longest common subsequence"],
    ["Chinchilla", "about 20 training tokens per parameter"],
    ["Benchmarks", "MMLU · BIG-bench · GSM8K · HumanEval/MBPP · TruthfulQA · VQAv2/MMMU · LibriSpeech (WER)"],
    ["Bias types", "representational (stereotypes) · allocational (unequal resources)"],
    ["Fairness", "demographic parity · equal opportunity (TPR) · equalized odds (TPR + FPR)"],
    ["Policy gate", "allow (read notes, search a public index) · human approval (write a file, send a message, including one requested by retrieved text) · deny (shell command from a document, money transfer)"]
  ]}
);
