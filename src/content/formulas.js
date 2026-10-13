COURSE.formulas.push(
  { w: "Week 1", h: "Losses and activations", items: [
    ["Mean squared error", "MSE = (1/n) Σ (y − ŷ)²"],
    ["Binary cross-entropy", "BCE = −(1/n) Σ [y log ŷ + (1−y) log(1−ŷ)]"],
    ["Categorical cross-entropy", "CE = −Σ_k y_k log ŷ_k"],
    ["Softmax", "ŷ_k = e^(z_k) / Σ_j e^(z_j)"],
    ["Sigmoid and its derivative", "σ(z) = 1/(1+e^(−z));  σ′ = σ(1−σ) ≤ 0.25"],
    ["Output pairing", "continuous → linear + MSE · binary → sigmoid + BCE · K classes → softmax + CE"],
    ["Handy logs", "ln 0.1 = −2.303 · ln 0.5 = −0.693 · ln 0.8 = −0.223 · ln 0.9 = −0.105"]
  ]},
  { w: "Week 1", h: "Optimizers", items: [
    ["Gradient descent", "θ ← θ − η ∇L"],
    ["Momentum", "v = βv + η∇L;  θ ← θ − v  (β ≈ 0.9)"],
    ["AdaGrad", "G += g²;  θ ← θ − η g / (√G + ε)   (rate decays to 0)"],
    ["RMSProp", "s = ρs + (1−ρ)g²;  θ ← θ − η g / (√s + ε)"],
    ["Adam", "m = β₁m+(1−β₁)g; v = β₂v+(1−β₂)g²; m̂ = m/(1−β₁ᵗ); v̂ = v/(1−β₂ᵗ); θ ← θ − η m̂/(√v̂+ε)"],
    ["Updates per epoch", "⌈N / batch size⌉"]
  ]},
  { w: "Week 1", h: "CNN arithmetic", items: [
    ["Output size", "⌊(n + 2p − f) / s⌋ + 1"],
    ["'same' padding (stride 1)", "p = (f − 1)/2"],
    ["Conv parameters", "(f · f · C_in + 1) · K"],
    ["Dense parameters", "(inputs + 1) · outputs"],
    ["Pooling 2×2, stride 2", "halves H and W, keeps channels, 0 parameters"],
    ["Transposed conv output", "(n − 1)·s − 2p + f"]
  ]},
  { w: "Week 2", h: "Autoencoders", items: [
    ["Neuron", "a = f(Σ wᵢxᵢ + b)"],
    ["Sparse AE penalty", "β Σ_j KL(ρ‖ρ̂_j),  KL = ρ log(ρ/ρ̂) + (1−ρ) log((1−ρ)/(1−ρ̂))"],
    ["Contractive AE penalty", "λ ‖∂h/∂x‖²_F"],
    ["Denoising AE", "input x̃ = x + noise; loss L(x, x̂) against CLEAN x"],
    ["Under / overcomplete", "latent < input · latent ≥ input (can copy)"]
  ]},
  { w: "Week 3", h: "Information theory", items: [
    ["Self-information", "I(x) = −log p(x)"],
    ["Entropy", "H(P) = −Σ p log p   (fair coin = 1 bit)"],
    ["Cross-entropy", "H(P,Q) = −Σ p log q = H(P) + KL(P‖Q)"],
    ["KL divergence", "KL(P‖Q) = Σ p log(p/q) ≥ 0, asymmetric"],
    ["KL of two Gaussians", "ln(σ₂/σ₁) + (σ₁² + (μ₁−μ₂)²)/(2σ₂²) − ½"],
    ["Direction", "KL(P‖Q) mode covering · KL(Q‖P) mode seeking"]
  ]},
  { w: "Week 3–4", h: "VAE", items: [
    ["ELBO", "log p(x) ≥ E_q[log p(x|z)] − KL(q(z|x) ‖ p(z))"],
    ["Gap", "log p(x) − ELBO = KL(q(z|x) ‖ p(z|x))"],
    ["VAE loss", "Recon (MSE/BCE) + ½ Σ (μ² + σ² − log σ² − 1)"],
    ["Keras form of KL", "−½ Σ (1 + log σ² − μ² − σ²)"],
    ["Variance from log-variance", "σ² = e^(log σ²);  σ = e^(½ log σ²)"],
    ["Reparameterisation", "z = μ + σ ⊙ ε,  ε ~ N(0, I);  ∂z/∂μ = 1, ∂z/∂σ = ε"],
    ["β-VAE", "Recon + β · KL   (β > 1: disentangle, blurrier)"],
    ["cVAE", "q(z|x,c), p(x|z,c); input dim = x + c"],
    ["Interpolation", "z(α) = (1−α) z₁ + α z₂"]
  ]},
  { w: "Week 5–6", h: "GANs", items: [
    ["Discriminator loss", "L_D = −log D(x) − log(1 − D(G(z)))"],
    ["Value function", "min_G max_D E[log D(x)] + E[log(1 − D(G(z)))]"],
    ["Non-saturating G loss", "min −log D(G(z))"],
    ["Optimal discriminator", "D* = p_data / (p_data + p_g)"],
    ["At optimum", "V = −log 4 + 2·JSD; equilibrium D* = ½, V = −1.386"],
    ["DCGAN", "strided conv (D), transposed conv (G), BatchNorm, ReLU/tanh (G), LeakyReLU 0.2 (D), Adam 2e-4, β₁ = 0.5"],
    ["Pix2Pix", "L_cGAN + λ·L1, λ = 100; U-Net G; 70×70 PatchGAN D"],
    ["CycleGAN", "2 G + 2 D; L_cyc = ‖F(G(x))−x‖₁ + ‖G(F(y))−y‖₁, λ = 10; identity loss"],
    ["StyleGAN", "mapping MLP (8 layers) z→w; constant input; AdaIN; noise; StyleGAN2: weight (de)modulation"]
  ]},
  { w: "Week 7–8", h: "Diffusion", items: [
    ["Forward step", "q(x_t|x_(t−1)) = N(√(1−β_t) x_(t−1), β_t I)"],
    ["Notation", "α_t = 1 − β_t;  ᾱ_t = Π α_s"],
    ["Closed form", "x_t = √ᾱ_t x₀ + √(1−ᾱ_t) ε"],
    ["SNR", "ᾱ_t / (1 − ᾱ_t)"],
    ["DDPM schedule", "linear β: 10⁻⁴ → 0.02, T = 1000"],
    ["Loss", "‖ε − ε_θ(x_t, t)‖²"],
    ["Reverse mean", "μ_θ = (1/√α_t)(x_t − β_t/√(1−ᾱ_t) · ε_θ)"],
    ["x₀ estimate", "x̂₀ = (x_t − √(1−ᾱ_t) ε̂)/√ᾱ_t"],
    ["CFG", "ε̃ = ε(∅) + w(ε(y) − ε(∅))"],
    ["Latent diffusion", "512×512×3 → 64×64×4 (f = 8, 48× fewer values)"],
    ["Covariance", "Cov(X,Y) = E[(X−μ_X)(Y−μ_Y)]; population /n, sample /(n−1)"]
  ]},
  { w: "Week 9", h: "Sequence models and attention", items: [
    ["TF-IDF", "tf(t,d) × log(N / df(t))"],
    ["Cosine similarity", "u·v / (‖u‖‖v‖)"],
    ["RNN", "h_t = tanh(W_xh x_t + W_hh h_(t−1) + b)"],
    ["LSTM", "c_t = f⊙c_(t−1) + i⊙g;  h_t = o⊙tanh(c_t)"],
    ["Attention", "softmax(QKᵀ/√d_k) V"],
    ["Multi-head", "d_k = d_model / h  (512 / 8 = 64)"],
    ["Positional encoding", "PE(pos,2i) = sin(pos/10000^(2i/d)); PE(pos,2i+1) = cos(…)"],
    ["Encoder layer", "MHA → Add&Norm → FFN (512→2048→512) → Add&Norm; N = 6"]
  ]},
  { w: "Week 10", h: "LLMs and prompting", items: [
    ["BERT", "encoder-only; Base 12L/768/12H/110M; Large 24L/1024/16H/340M"],
    ["MLM", "15% selected → 80% [MASK], 10% random, 10% unchanged"],
    ["GPT", "decoder-only; maximise Σ log P(x_t | x_<t)"],
    ["GPT sizes", "GPT-1 117M · GPT-2 1.5B · GPT-3 175B"],
    ["Tokenisers", "BPE (GPT) · WordPiece ## (BERT) · SentencePiece/Unigram (T5)"],
    ["Prompting", "zero / one / few (2–5) shot · CoT · role · structured output"]
  ]},
  { w: "Week 11", h: "ICL, LoRA, RAG", items: [
    ["LoRA", "h = W₀x + (α/r)·BAx; trainable r(d + k); B = 0 at init"],
    ["QLoRA", "4-bit NF4 frozen base + LoRA"],
    ["RAG", "chunk → embed → vector DB · query → embed → top-k → augment → generate"],
    ["Memory", "parametric (weights) vs non-parametric (index)"],
    ["Advanced RAG", "Graph RAG (knowledge graph, multi-hop) · Agentic RAG (tools, planning, ReAct)"]
  ]},
  { w: "Week 12", h: "Decoding, evaluation, ethics", items: [
    ["Temperature softmax", "p_i = e^(z_i/T) / Σ e^(z_j/T); T<1 sharper, T>1 flatter"],
    ["Top-k / top-p", "k most likely · smallest set with cumulative p"],
    ["Token F1", "P = overlap/|pred|, R = overlap/|ref|, F1 = 2PR/(P+R)"],
    ["ROUGE-L", "F-score on the longest common subsequence"],
    ["Chinchilla", "≈ 20 training tokens per parameter"],
    ["Benchmarks", "MMLU · BIG-bench · GSM8K · HumanEval/MBPP · TruthfulQA · VQAv2/MMMU · LibriSpeech (WER)"],
    ["Bias types", "representational (stereotypes) · allocational (unequal resources)"],
    ["Fairness", "demographic parity · equal opportunity (TPR) · equalized odds (TPR + FPR)"],
    ["Policy gate", "allow (read) · review (write, message) · deny (shell, money, injected instructions)"]
  ]}
);
