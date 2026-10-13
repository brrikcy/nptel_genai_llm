COURSE.weeks.push({
  id: "w3", n: 3, title: "Variational autoencoders",
  tagline: "KL divergence, probabilistic encoder/decoder, ELBO, reparameterisation.",
  intro: "The VAE turns the autoencoder into a true generative model by making the latent space probabilistic and regularised. First the information-theory tools (entropy, cross-entropy, KL), then the encoder, decoder, ELBO loss and the reparameterisation trick, and finally a full numerical forward pass. Lectures 19–24.",
  topics: [
    {
      id: "w3t1", title: "Information, entropy and KL divergence", lec: [19, 20], min: 21, w: "kl",
      hook: "Weather report A says “sunny in the Sahara today”. Report B says “snow in the Sahara today”. Which carries more information, and can you turn your answer into a number?",
      reveal: "<p>The surprising one. Information measures surprise: <b>I(x) = −log p(x)</b>. A near-certain event (p ≈ 1) carries ≈ 0 bits; a rare event carries many. Average that surprise over a distribution and you get <b>entropy</b>. Measure the extra surprise of using the wrong distribution and you get <b>KL divergence</b>, the regulariser at the heart of the VAE.</p>",
      cards: [
        { h: "Self-information, entropy, cross-entropy", b: `<div class="eq">Self-information: I(x) = −log p(x)</div><div class="eq">Entropy: H(P) = −Σ p(x) log p(x) = E_P[−log p(x)]</div><div class="eq">Cross-entropy: H(P, Q) = −Σ p(x) log q(x)</div>
          <ul><li>log base 2 → bits; natural log → nats.</li><li>Entropy is the average surprise, maximal for a uniform distribution (a fair coin has H = 1 bit) and zero for a certain outcome.</li><li>Cross-entropy is the average surprise when the truth is P but you encode or predict with Q. It is always ≥ H(P).</li></ul>`, w: "entropy" },
        { h: "KL divergence: the price of the wrong distribution", b: `<div class="eq">KL(P ‖ Q) = Σ p(x) log [p(x) / q(x)] = H(P, Q) − H(P)</div>
          <ul><li>KL ≥ 0, and KL = 0 if and only if P = Q (Gibbs' inequality).</li><li><b>Not symmetric:</b> KL(P‖Q) ≠ KL(Q‖P) in general, so it is not a true distance metric.</li><li>With P fixed, minimising cross-entropy is the same as minimising KL(P‖Q). That is why classifiers are trained with cross-entropy.</li></ul>
          <div class="eq">Two Gaussians: KL(N(μ₁,σ₁²) ‖ N(μ₂,σ₂²)) = ln(σ₂/σ₁) + (σ₁² + (μ₁−μ₂)²)/(2σ₂²) − ½</div>`, w: "kl" },
        { h: "Forward vs reverse KL: covering or seeking", b: `<p>Fit a single Gaussian Q to a two-peaked P:</p>
          <ul><li><b>Forward KL(P ‖ Q)</b> (the expectation is over P): Q is punished wherever P has mass and Q doesn't, so Q spreads to cover every mode. <b>Mode covering</b> (mean-seeking), which can put mass in the gap between peaks.</li><li><b>Reverse KL(Q ‖ P)</b> (the expectation is over Q): Q is punished wherever Q has mass and P doesn't, so Q hides inside one mode. <b>Mode seeking</b> (zero-forcing).</li></ul>
          <p>Maximum likelihood corresponds to forward KL. Variational inference (the VAE) minimises the reverse KL between the approximate and true posterior.</p>`, w: "klmodes",
          ask: { q: "Which KL direction tends to lock onto a single mode of a multimodal P?", o: ["KL(P ‖ Q), forward", "KL(Q ‖ P), reverse", "Both equally", "Neither"], a: 1, x: "Reverse KL penalises Q for placing mass where P ≈ 0, so Q settles into one mode." } },
        { h: "The weather example (all in bits, log₂)", b: `<p>Tomorrow: Sunny with p = 0.875, Rainy with p = 0.125.</p>
          <ul><li>Self-information: I(sunny) = −log₂ 0.875 ≈ <b>0.193 bits</b> (little surprise); I(rainy) = −log₂ 0.125 = <b>3 bits</b> (rarer, more surprise). Logs turn the product of independent probabilities into a sum of information.</li><li>Entropy of [0.875, 0.125] = 0.875·0.193 + 0.125·3 ≈ <b>0.544 bits</b>: fairly confident, low uncertainty. [0.5, 0.5] → <b>1 bit</b> (maximum). [1, 0] → <b>0</b>.</li><li>Cross-entropy with the truth = Sunny (P = [1, 0]): model Q = [0.875, 0.125] → −log₂ 0.875 ≈ <b>0.193</b> (good); Q = [0.125, 0.875] → −log₂ 0.125 = <b>3</b> (bad).</li><li>Derivation: KL(P‖Q) = H(P,Q) − H(P) = −Σp log q + Σp log p = Σ p (log p − log q) = <b>Σ p log(p/q)</b>.</li></ul>
          <p><b>Why forward KL covers modes</b>: if P(x) > 0 where Q(x) = 0, then log(P/Q) → ∞, so Q must spread over all of P's support. <b>Why reverse KL seeks a mode</b>: if Q puts mass where P ≈ 0, log(Q/P) blows up, so Q stays inside regions where P is large.</p>
          <p>Slide examples: heights with modes at 160 cm and 190 cm and few people at 175 cm. Forward KL gives one broad Gaussian that also generates unrealistic 175 cm people; reverse KL picks one group (realistic samples, the other mode missed). Cats and dogs: forward KL can produce ambiguous cat-dog images; reverse KL produces sharp cats only (or dogs only).</p>` }
      ],
      keys: ["I(x) = −log p(x); H(P) = −Σ p log p; H(P,Q) = −Σ p log q.", "KL(P‖Q) = Σ p log(p/q) = H(P,Q) − H(P) ≥ 0, equal to 0 only when P = Q.", "KL is asymmetric, so it is not a distance metric.", "Forward KL(P‖Q) is mode covering; reverse KL(Q‖P) is mode seeking.", "Gaussian KL: ln(σ₂/σ₁) + (σ₁² + (μ₁−μ₂)²)/(2σ₂²) − ½."],
      traps: ["Cross-entropy ≥ entropy, and the gap is exactly KL.", "A fair coin has 1 bit of entropy; a coin with p = 1 has 0.", "Which argument the expectation is taken over decides covering vs seeking."],
      quiz: [
        { q: "What is the entropy, in bits, of a fair 4-sided die?", a: { n: 2, tol: 0.001 }, x: "H = −Σ ¼ log₂ ¼ = log₂ 4 = 2 bits.", r: 0 },
        { q: "Which statements about KL divergence are true? (Select all that apply)", o: ["KL(P‖Q) ≥ 0", "KL(P‖Q) = KL(Q‖P) for all P, Q", "KL(P‖Q) = H(P,Q) − H(P)", "KL(P‖Q) = 0 when P = Q"], a: [0, 2, 3], x: "KL is asymmetric in general.", r: 1 },
        { q: "Fitting a unimodal Q to a bimodal P by minimising KL(P‖Q) typically produces a Q that:", o: ["Sits on one of the two peaks", "Spreads to cover both peaks", "Collapses to a point", "Equals P exactly"], a: 1, x: "Forward KL is mode covering.", r: 2 },
        { q: "Compute KL(P‖Q) in bits for P = (0.5, 0.5) and Q = (0.25, 0.75). Round to 3 decimals.", a: { n: 0.208, tol: 0.003 }, x: "0.5·log₂(0.5/0.25) + 0.5·log₂(0.5/0.75) = 0.5·1 + 0.5·(−0.585) = 0.5 − 0.2925 = 0.2075.", r: 1 },
        { q: "The self-information of an event with probability 1/8, in bits, is:", a: { n: 3, tol: 0.001 }, x: "−log₂(1/8) = 3 bits.", r: 0 },
        { q: "Self-information of an outcome with probability 0.125, in bits:", a: { n: 3, tol: 0.001 }, x: "−log₂ 0.125 = 3 bits.", r: 3 },
        { q: "Entropy (bits) of the weather distribution [0.875, 0.125] (3 decimals):", a: { n: 0.544, tol: 0.003 }, x: "0.875·0.193 + 0.125·3 ≈ 0.169 + 0.375 = 0.544.", r: 3 },
        { q: "Truth is Sunny, P = [1, 0]. The model predicts Q = [0.125, 0.875]. Cross-entropy in bits:", a: { n: 3, tol: 0.001 }, x: "−1·log₂ 0.125 = 3 bits: large, because the model gave the correct outcome low probability.", r: 3 },
        { q: "Heights cluster at 160 cm and 190 cm. A single Gaussian fitted by forward KL will typically:", o: ["Pick only the 160 cm group", "Spread over both groups and also generate unrealistic ~175 cm heights", "Collapse to one point", "Exactly match both modes"], a: 1, x: "Mode covering assigns probability to the low-density region between the modes.", r: 3 }
      ]
    },
    {
      id: "w3t2", title: "The VAE: probabilistic encoder, decoder and ELBO", lec: [21, 22], min: 25,
      hook: "A plain autoencoder maps each image to one point. What if the encoder instead said “this image lives somewhere in this cloud”, and every cloud were pulled towards the same standard normal? What would that buy you at generation time?",
      reveal: "<p>Because every training cloud overlaps around N(0, I), you can sample z ~ N(0, I) and decode it into something realistic: the space between training codes is filled in. That is the VAE's deal: a probabilistic encoder q_φ(z|x), a decoder p_θ(x|z), and a loss that balances reconstruction against staying close to the prior.</p>",
      cards: [
        { h: "The generative story", b: `<p>Assume each data point x is produced by first drawing a latent z from a simple <b>prior</b> p(z) = N(0, I), then drawing x from a <b>likelihood</b> p_θ(x | z) given by the decoder network.</p>
          <div class="eq">p_θ(x) = ∫ p_θ(x | z) p(z) dz       (the evidence: intractable to compute)</div>
          <p>The true posterior p(z | x) = p(x|z)p(z)/p(x) is therefore intractable too. The VAE approximates it with an <b>encoder network q_φ(z | x)</b>. This is <b>variational inference</b>: approximate an intractable posterior with a tractable family.</p>` },
        { h: "Probabilistic encoder: output a distribution, not a point", b: `<div class="eq">q_φ(z | x) = N(z; μ_φ(x), diag(σ²_φ(x)))</div>
          <ul><li>The encoder's final layer has two heads: <b>μ</b> and <b>log σ²</b>, each of size d (the latent dimension).</li><li>These heads use <b>no activation</b> (linear): μ may be negative, and log σ² can be any real number. Then σ² = exp(log σ²) > 0 is guaranteed.</li><li>Then z is <i>sampled</i> from this Gaussian, so the same x can give different z.</li></ul>`,
          ask: { q: "Why does the encoder output log σ² instead of σ² directly?", o: ["It is faster to compute", "So an unconstrained linear output always maps to a positive variance via exp", "Because the decoder needs logs", "To make the KL term zero"], a: 1, x: "exp(log σ²) is always positive, and the network can output any real number." } },
        { h: "Probabilistic decoder", b: `<p>The decoder p_θ(x | z) maps z to the parameters of a distribution over x:</p><ul><li>Continuous data → Gaussian: the decoder outputs the mean (linear activation); the negative log-likelihood is MSE up to constants.</li><li>Binary or [0, 1] data → Bernoulli: a sigmoid output; the negative log-likelihood is BCE.</li></ul><p>In practice the decoder's output (the mean) <b>is</b> the reconstruction x̂, as in the lecture's numerical example.</p>` },
        { h: "The ELBO, and the VAE loss", b: `<div class="eq">log p_θ(x) ≥ ELBO = E_{q_φ(z|x)}[log p_θ(x | z)] − KL(q_φ(z | x) ‖ p(z))</div>
          <div class="eq">log p(x) − ELBO = KL(q_φ(z|x) ‖ p(z|x)) ≥ 0</div>
          <p>Maximise the ELBO (Evidence Lower BOund) ⇔ minimise the VAE loss:</p>
          <div class="eq">L_VAE = Reconstruction loss (MSE or BCE)  +  KL(q_φ(z | x) ‖ N(0, I))</div>
          <div class="eq">KL closed form (diagonal Gaussian vs N(0, I)) = ½ Σ_j (μ_j² + σ_j² − log σ_j² − 1)</div>
          <ul><li>The reconstruction term makes codes informative.</li><li>The KL term pulls every q(z|x) towards N(0, I): a smooth, continuous, sampleable latent space. Too strong and you get <b>posterior collapse</b> (z ignored, blurry outputs).</li><li>Generation: sample z ~ N(0, I) and decode. The encoder is not needed.</li></ul>`, w: "vaeloss" },
        { h: "Slide numbers: encoder outputs and many z per x", b: `<p><b>Encoder with a 5-D latent</b>: μ = [0.5, −0.2, 1.0, 0.3, −0.5], log σ² = [−1.386, −2.303, −0.693, −1.833, −1.386] → σ² = exp(log σ²) = <b>[0.25, 0.10, 0.50, 0.16, 0.25]</b>. So z₁ ~ N(0.5, 0.25), z₂ ~ N(−0.2, 0.10), … One sample: z = [0.65, −0.10, 0.80, 0.42, −0.70].</p>
          <p><b>Why a Gaussian prior N(0, I)?</b> Simple and mathematically convenient, easy to sample, and it forces a well-structured, continuous latent space. Choosing q(z|x) Gaussian too makes the KL comparison closed-form. Latent vectors near the origin, e.g. [0.2, −0.1], have high prior density; [4.0, −3.5] has very low density.</p>
          <p><b>Decoder output distribution</b>: continuous data → the decoder gives (μ, σ²) of a Gaussian p_θ(x|z); binary data → a probability per pixel (Bernoulli). For x = [0.80, 0.10, 0.60, 0.30, 0.90] with μ(x) = [0.50, −0.20], σ²(x) = [0.04, 0.09], three sampled z's ([0.56, −0.11], [0.43, −0.32], [0.61, −0.24]) decode to three slightly different reconstructions, all close to x. <b>One x ↔ infinitely many possible z.</b></p>
          <p>The evidence p(x) = ∫ p(x|z)p(z)dz needs every possible z, which is intractable for neural decoders. So the VAE maximises the computable ELBO, and training minimises −ELBO = reconstruction loss + KL loss.</p>` }
      ],
      keys: ["Prior p(z) = N(0, I); encoder q_φ(z|x) = N(μ, diag σ²) approximates the intractable posterior p(z|x).", "Encoder heads μ and log σ² have no activation; σ² = exp(log σ²), σ = exp(½ log σ²).", "ELBO = E_q[log p(x|z)] − KL(q(z|x)‖p(z)) ≤ log p(x); the gap is KL(q(z|x)‖p(z|x)).", "L_VAE = reconstruction + ½Σ(μ² + σ² − log σ² − 1).", "Generate by sampling z ~ N(0, I) and running only the decoder."],
      traps: ["You MAXIMISE the ELBO, which means MINIMISING the loss = −ELBO.", "The KL in the loss is to the prior p(z), not to the true posterior.", "The KL term is zero only when μ = 0 and σ² = 1 for every dimension."],
      quiz: [
        { q: "In a VAE, the encoder outputs:", o: ["A single deterministic code z", "The parameters (μ, log σ²) of q(z | x)", "The class label", "The reconstruction x̂"], a: 1, x: "The encoder parameterises a Gaussian over z.", r: 1 },
        { q: "The ELBO is a lower bound on:", o: ["The KL divergence", "The log-likelihood log p(x)", "The reconstruction error", "The entropy of z"], a: 1, x: "log p(x) ≥ ELBO, with the gap being KL(q(z|x) ‖ p(z|x)).", r: 3 },
        { q: "Compute the KL term ½ Σ (μ² + σ² − log σ² − 1) for a 1-D latent with μ = 1 and log σ² = 0.", a: { n: 0.5, tol: 0.001 }, x: "σ² = e⁰ = 1, so ½(1 + 1 − 0 − 1) = 0.5.", r: 3 },
        { q: "Which statements about the VAE loss are true? (Select all that apply)", o: ["It has a reconstruction term and a KL term", "The KL term pushes q(z|x) towards the prior N(0, I)", "Minimising the loss maximises the ELBO", "The KL term is computed between the decoder output and the input"], a: [0, 1, 2], x: "The KL is between the approximate posterior and the prior, in latent space.", r: 3 },
        { q: "To generate a new sample from a trained VAE you:", o: ["Encode a training image and decode it", "Sample z ~ N(0, I) and pass it through the decoder", "Run the encoder on random noise", "Sample x from the prior"], a: 1, x: "The KL regulariser makes N(0, I) a valid place to sample codes from.", r: 3 },
        { q: "Why do the μ and log σ² layers of the encoder use no activation function?", o: ["To speed up training", "Because μ may be negative and log σ² may be any real number; ReLU would clip them", "Because activations are not differentiable", "Because they are frozen"], a: 1, x: "The lecture stresses this: applying ReLU would wrongly turn a negative mean into 0.", r: 1 },
        { q: "An encoder outputs log σ² = −1.386 for a latent dimension. The variance σ² is:", a: { n: 0.25, tol: 0.002 }, x: "exp(−1.386) ≈ 0.25.", r: 4 },
        { q: "Which reasons does the course give for choosing the prior p(z) = N(0, I)? (Select all that apply)", o: ["Mathematically simple and convenient", "Easy to sample from", "Encourages a well-structured, continuous latent space", "It equals the true posterior exactly"], a: [0, 1, 2], x: "The true posterior is unknown; that is why q(z|x) approximates it.", r: 4 },
        { q: "For binary-valued data, the VAE decoder's outputs define which likelihood p_θ(x|z)?", o: ["Gaussian", "Bernoulli", "Poisson", "Uniform"], a: 1, x: "A probability per pixel → Bernoulli; for continuous data → Gaussian.", r: 4 }
      ]
    },
    {
      id: "w3t3", title: "The reparameterisation trick", lec: [23], min: 14, w: "reparam",
      hook: "Backpropagation needs a derivative at every step. Somewhere in the middle of the VAE is the operation “draw a random sample”. What is the derivative of rolling a die with respect to which die you picked?",
      reveal: "<p>There isn't one: sampling is not a differentiable function of μ and σ, so gradients can't reach the encoder. The trick moves the randomness <i>outside</i> the path: draw ε ~ N(0, 1) independently, then compute <b>z = μ + σ ⊙ ε</b>. That is a plain differentiable formula in μ and σ.</p>",
      cards: [
        { h: "The problem", b: `<p>z ~ N(μ_φ(x), σ²_φ(x)) is a stochastic node. The loss depends on z, but there is no gradient ∂z/∂μ through a sampling operation, so the encoder parameters φ could not be trained by backprop.</p>` },
        { h: "The trick", b: `<div class="eq">ε ~ N(0, I)      z = μ + σ ⊙ ε      with σ = exp(½ · log σ²)</div>
          <ul><li>All randomness now lives in ε, which does not depend on any parameter.</li><li>z is a deterministic, differentiable function of μ and σ: ∂z/∂μ = 1, ∂z/∂σ = ε.</li><li>The distribution of z is unchanged: μ + σε ~ N(μ, σ²).</li><li>The same x gives a different z each time you draw a new ε, which is how a VAE produces variations.</li></ul>`, w: "reparam" },
        { h: "Worked numbers", b: `<p>Lecture 24: the encoder gives μ = [0.043, 0.551] and log σ² = [0.732, 0.302].</p><ul><li>σ² = [e^0.732, e^0.302] = [2.079, 1.353]; σ = [1.442, 1.163].</li><li>ε = [0.5, −0.2]: z₁ = 0.043 + 1.442 × 0.5 = <b>0.764</b>; z₂ = 0.551 + 1.163 × (−0.2) = <b>0.318</b>.</li><li>ε = [0, 0] gives z = μ = [0.043, 0.551]; ε = [0.6, −0.4] gives [0.908, 0.086]. Same distribution, different samples.</li></ul>
          <p>Exam recipe: log σ² → (exp) σ² → (sqrt) σ → z = μ + σε.</p>`,
          ask: { q: "μ = 2, log σ² = 0, ε = −1. z = ?", o: ["1", "2", "3", "0"], a: 0, x: "σ = e⁰ = 1, z = 2 + 1·(−1) = 1." } },
        { h: "The chain rule, step by step", b: `<ul><li>Decoder side is easy: x̂ = g_θ(z); ∂L/∂θ follows by ordinary backprop through h₁ = ReLU(W₁z + b₁), x̂ = f(W₂h₁ + b₂). z is treated as a numeric input, so ∂L/∂z = ∂L/∂x̂ · ∂x̂/∂z exists.</li><li>The real problem is reaching μ and σ: with z ~ N(μ, σ²) drawn at random, z is not a differentiable function of μ and σ.</li><li>With z = μ + σ ⊙ ε, ε is treated as a constant during backprop: ∂z/∂μ = 1 and ∂z/∂σ = ε.</li></ul>
          <div class="eq">∂L/∂μ = ∂L/∂x̂ · ∂x̂/∂z · 1          ∂L/∂σ = ∂L/∂x̂ · ∂x̂/∂z · ε</div>
          <p>Then the gradients flow on into the encoder weights φ: L → x̂ → z → (μ, σ) → φ. Before reparameterisation z is a random function of φ; after it, z is deterministic in φ with independent noise ε.</p>` }
      ],
      keys: ["Sampling blocks gradients; the fix is z = μ + σ ⊙ ε with ε ~ N(0, I).", "ε is independent of the parameters; μ and σ sit on a differentiable path.", "σ = exp(½ log σ²), σ² = exp(log σ²).", "The same input yields different z for different ε."],
      traps: ["Add σ·ε, not σ²·ε.", "ε comes from the standard normal N(0, 1), not from N(μ, σ²).", "The trick is used during training too, not only at generation time."],
      quiz: [
        { q: "In the reparameterisation trick, the random noise ε is sampled from:", o: ["N(μ, σ²)", "N(0, I)", "Uniform(0, 1)", "The data distribution"], a: 1, x: "ε ~ N(0, I) is independent of the network's parameters.", r: 1 },
        { q: "Given μ = 0.5, log σ² = 0.693 (so σ² ≈ 2) and ε = 1, compute z = μ + σ·ε. Round to 3 decimals.", a: { n: 1.914, tol: 0.004 }, x: "σ = √2 ≈ 1.414; z = 0.5 + 1.414 = 1.914.", r: 2 },
        { q: "Why is the reparameterisation trick necessary?", o: ["To reduce the latent dimension", "To make sampling differentiable with respect to μ and σ so gradients reach the encoder", "To remove the KL term", "To speed up the decoder"], a: 1, x: "Moving randomness into ε turns z into a differentiable function of μ and σ.", r: 0 },
        { q: "For z = μ + σε, the derivative ∂z/∂σ equals:", o: ["1", "μ", "ε", "σ"], a: 2, x: "z is linear in σ with coefficient ε.", r: 1 },
        { q: "μ = −1, σ = 0.5, ε = 2. Compute z.", a: { n: 0, tol: 0.001 }, x: "−1 + 0.5 × 2 = 0.", r: 2 },
        { q: "With z = μ + σ·ε, suppose ∂L/∂z = 2 and ε = −0.5. What is ∂L/∂σ?", a: { n: -1, tol: 0.001 }, x: "∂L/∂σ = ∂L/∂z · ε = 2 × (−0.5) = −1. (∂L/∂μ would be 2.)", r: 3 }
      ]
    },
    {
      id: "w3t4", title: "A full VAE forward pass, by hand", lec: [24, 25], min: 17, w: "vaeloss",
      hook: "In the lecture's example, the total loss comes out at 10.06, and almost all of it is reconstruction error. Is that a sign the VAE is broken?",
      reveal: "<p>No: the weights are random before training. Reconstruction dominates at first; training drives it down while the KL term keeps the latent space tidy. The point of the numerical example is the <b>sequence of operations</b>, which you must be able to reproduce in the exam.</p>",
      cards: [
        { h: "The recipe, layer by layer", b: `<ol><li><b>Encoder hidden layer</b>: h = ReLU(Wx + b). Input x = [5.1, 3.5, 1.4, 0.2] (4 features), 3 hidden neurons, bias 0.1 → <b>a = [1.07, 1.93, 0.87]</b>. First neuron: 5.1·0.1 + 3.5·0.4 + 1.4·(−0.7) + 0.2·0.2 + 0.1 = 1.07.</li>
          <li><b>μ head</b>: μ = W_μ h + b_μ, <i>no activation</i> (latent dimension 2): μ₁ = 1.07·0.5 + 1.93·(−0.3) + 0.87·0.1 = <b>0.043</b>, μ₂ = <b>0.551</b>. ReLU here would wrongly turn a valid negative mean like −2.5 into 0.</li>
          <li><b>log σ² head</b>: log σ² = W_σ h + b_σ, <i>no activation</i>; then σ² = e^(log σ²), σ = √σ².</li>
          <li><b>Sample</b>: ε ~ N(0, 1) for each dimension; z = μ + σ·ε.</li>
          <li><b>Decoder hidden layer</b>: ReLU(W z + b) with z = [0.764, 0.318], bias 0.1 → [0.6538, ReLU(−0.1738) = <b>0</b>, 0.0938].</li>
          <li><b>Decoder output</b>: linear for continuous data (sigmoid for binary). x̂ = <b>[0.103, −0.028, 0.206, 0.243]</b>. Theory says x̂ is sampled from p(x|z); in practice the decoder's mean output is used as x̂.</li>
          <li><b>Loss</b> = MSE(x, x̂) + ½ Σ(μ² + σ² − log σ² − 1). MSE = (24.9700 + 12.4468 + 1.4256 + 0.0018)/4 = <b>9.711</b>; KL = ½[(0.00185 + 2.079 − 0.732 − 1) + (0.3036 + 1.353 − 0.302 − 1)] = ½(0.349 + 0.355) = <b>0.352</b>; total <b>10.063</b>. The loss is large only because the weights are still random.</li>
          <li><b>Backprop</b> through the reparameterisation into all weights; repeat.</li></ol>` },
        { h: "Practice the loss", b: `<p>Edit the numbers below, or use your own from a past assignment, and check every intermediate value.</p>`, w: "vaeloss" },
        { h: "From the hands-on session: a VAE in Keras", b: `<ul><li>Encoder: Conv/Dense layers → <code>Dense(latent_dim)</code> for z_mean and <code>Dense(latent_dim)</code> for z_log_var.</li><li>A custom <code>Sampling</code> layer returns <code>z_mean + tf.exp(0.5 * z_log_var) * epsilon</code>.</li><li>The decoder mirrors the encoder and ends in a sigmoid for MNIST.</li><li>Loss = BCE reconstruction (summed over pixels) + KL = <code>-0.5 * sum(1 + z_log_var − z_mean² − exp(z_log_var))</code>, which is the same formula rearranged.</li><li>With a 2-D latent, plot z_mean coloured by digit to see clusters; decode a grid of z values to see digits morph smoothly.</li></ul>`,
          ask: { q: "−½ Σ(1 + log σ² − μ² − σ²) is the same as:", o: ["½ Σ(μ² + σ² − log σ² − 1)", "Σ(μ² + σ²)", "The reconstruction loss", "−KL"], a: 0, x: "Move the minus sign inside: identical to the closed-form KL." } }
      ],
      keys: ["Order: hidden ReLU → μ, log σ² (linear) → σ² = e^(log σ²), σ = √σ² → z = μ + σε → decoder → x̂ → loss.", "No activation on the μ and log σ² heads.", "Decoder output layer: linear (continuous) or sigmoid (binary); its output is used as x̂.", "Loss = MSE (or BCE) + ½Σ(μ² + σ² − log σ² − 1); Keras writes it −½Σ(1 + log σ² − μ² − σ²)."],
      traps: ["Forgetting the bias, or applying ReLU to μ, are the classic numerical mistakes.", "Use e^(log σ²) for σ², and √ of that for σ, in z = μ + σε.", "The same input sampled twice gives different z, so different x̂."],
      quiz: [
        { q: "In the VAE forward pass, which layers get NO activation function? (Select all that apply)", o: ["The μ (mean) layer", "The log σ² layer", "The encoder hidden layer", "The decoder output layer for continuous data (linear)"], a: [0, 1, 3], x: "The encoder hidden layer uses ReLU. The μ and log σ² heads, and a linear output, apply no non-linearity.", r: 0 },
        { q: "An encoder outputs log σ² = 1.386. What is σ (2 decimals)?", a: { n: 2, tol: 0.01 }, x: "σ² = e^1.386 ≈ 4, σ = 2.", r: 0 },
        { q: "Reconstruction loss = 2.5 and KL = 0.4. The total VAE loss is:", a: { n: 2.9, tol: 0.001 }, x: "The VAE loss is the sum of the two terms.", r: 0 },
        { q: "Compute the KL term for μ = [0, 1], log σ² = [0, 0].", a: { n: 0.5, tol: 0.001 }, x: "Dimension 1: 0 + 1 − 0 − 1 = 0. Dimension 2: 1 + 1 − 0 − 1 = 1. Sum = 1; ½ × 1 = 0.5.", r: 1 },
        { q: "Passing the same input through a trained VAE twice usually gives slightly different reconstructions because:", o: ["The weights change between passes", "A new ε is drawn each time, giving a different z", "Dropout is always active", "The decoder is random"], a: 1, x: "z = μ + σε, with fresh ε each pass.", r: 0 },
        { q: "Lecture 24: μ₂ = 0.551, σ₂ = 1.163, ε₂ = −0.2. Compute z₂ (3 decimals).", a: { n: 0.318, tol: 0.002 }, x: "0.551 + 1.163 × (−0.2) = 0.551 − 0.233 = 0.318.", r: 0 },
        { q: "Lecture 24's decoder hidden neuron gets pre-activation −0.1738. After ReLU, its value is:", a: { n: 0, tol: 0.0001 }, x: "max(0, −0.1738) = 0.", r: 0 }
      ]
    }
  ],
  test: [
    { q: "Which equation correctly relates cross-entropy, entropy and KL divergence?", o: ["H(P,Q) = H(P) − KL(P‖Q)", "H(P,Q) = H(P) + KL(P‖Q)", "KL(P‖Q) = H(P) + H(Q)", "H(P) = H(P,Q) + KL(P‖Q)"], a: 1, x: "Cross-entropy = entropy + the extra cost KL.", t: "w3t1", r: 1 },
    { q: "KL(N(0,1) ‖ N(1,1)) in nats equals:", a: { n: 0.5, tol: 0.001 }, x: "ln(1/1) + (1 + (0−1)²)/(2·1) − ½ = 0 + 1 − 0.5 = 0.5.", t: "w3t1", r: 1 },
    { q: "Reverse KL, KL(Q‖P), when fitting a simple Q to a multimodal P, tends to be:", o: ["Mode covering", "Mode seeking", "Symmetric", "Always zero"], a: 1, x: "Q avoids regions where P is small and settles into one mode.", t: "w3t1", r: 2 },
    { q: "The VAE needs an approximate posterior q_φ(z|x) because:", o: ["The prior is unknown", "The true posterior p(z|x) requires the intractable evidence p(x)", "The decoder cannot be trained", "z is discrete"], a: 1, x: "p(x) = ∫p(x|z)p(z)dz is intractable, and so is p(z|x).", t: "w3t2", r: 0 },
    { q: "Which statements about the ELBO are true? (Select all that apply)", o: ["ELBO ≤ log p(x)", "ELBO = E_q[log p(x|z)] − KL(q(z|x)‖p(z))", "Maximising the ELBO minimises the VAE loss", "The ELBO equals log p(x) when q = p(z) regardless of x"], a: [0, 1, 2], x: "The bound is tight only when q(z|x) equals the true posterior p(z|x).", t: "w3t2", r: 3 },
    { q: "When is the VAE's KL term exactly zero?", o: ["When the reconstruction is perfect", "When μ = 0 and σ² = 1 in every latent dimension", "When σ = 0", "Never"], a: 1, x: "Then q(z|x) = N(0, I) = p(z).", t: "w3t2", r: 3 },
    { q: "Using the reparameterisation trick with μ = 1.0, σ² = 0.25 and ε = −2, compute z.", a: { n: 0, tol: 0.001 }, x: "σ = 0.5; z = 1 + 0.5·(−2) = 0.", t: "w3t3", r: 2 },
    { q: "The reparameterisation trick makes the VAE trainable because:", o: ["It removes all randomness", "It expresses z as a deterministic, differentiable function of μ, σ and an independent noise ε", "It replaces the KL term", "It makes the decoder linear"], a: 1, x: "Gradients flow through μ and σ; ε is treated as a constant input.", t: "w3t3", r: 1 },
    { q: "An encoder outputs log σ² = 0.732. What is σ² (2 decimals)?", a: { n: 2.08, tol: 0.01 }, x: "e^0.732 ≈ 2.079.", t: "w3t4", r: 0 },
    { q: "In the lecture's VAE numerical example, the reconstruction is taken to be:", o: ["A random sample from p(x|z)", "The decoder's output, i.e. the mean of p(x|z)", "The encoder's μ", "The input itself"], a: 1, x: "In practice the decoder's mean output is used as x̂.", t: "w3t4", r: 0 },
    { q: "In the lecture's VAE example, the KL term was computed from μ = [0.043, 0.551] and log σ² = [0.732, 0.302]. Its value is approximately:", o: ["0.035", "0.352", "0.704", "9.711"], a: 1, x: "½ × (0.349 + 0.355) ≈ 0.352 (0.704 is the sum before halving; 9.711 is the reconstruction loss).", t: "w3t4", r: 0 },
    { q: "Forward KL becomes infinite when:", o: ["Q(x) > 0 where P(x) = 0", "P(x) > 0 where Q(x) = 0", "P = Q", "Both are Gaussian"], a: 1, x: "log(P/Q) → ∞ where Q misses P's support, which is why forward KL is mode covering.", t: "w3t1", r: 3 }
  ]
});
