COURSE.weeks.push({
  id: "w5", n: 5, title: "Generative adversarial networks",
  tagline: "Generator vs discriminator, minimax loss, Nash equilibrium, DCGAN.",
  intro: "VAEs give blurry samples. GANs replace the reconstruction loss with a learned critic: a discriminator that a generator learns to fool. This week covers the architecture, the loss from first principles (exactly as derived in Lecture 33), convergence and failure modes, and DCGAN. Lectures 31–37.",
  topics: [
    {
      id: "w5t1", title: "Why GANs? Two networks in a contest", lec: [31, 32], min: 19,
      hook: "A forger paints fake banknotes; a bank inspector tries to catch them. Neither ever sees the other's methods, only whether the fakes were caught. If both keep improving, what do the fakes look like in the end?",
      reveal: "<p>Indistinguishable from real notes, and the inspector is reduced to guessing (50% right). That is a GAN: the <b>generator</b> is the forger, the <b>discriminator</b> is the inspector, and training ends at an equilibrium where D(x) = ½ everywhere.</p>",
      cards: [
        { h: "Why not just use a VAE?", b: `<ul><li>VAE samples tend to be <b>blurry</b>: pixel-wise MSE/BCE reconstruction averages over plausible outputs, and the KL term limits detail.</li><li>The VAE optimises a lower bound (ELBO), not realism.</li><li>A GAN never compares pixels with a target. Its loss is a <b>learned</b> judgement of “real or fake”, so it can reward sharp, realistic detail.</li></ul>` },
        { h: "The architecture", b: `<div class="eq">z ~ p_z (noise, e.g. N(0, I))  →  Generator G_φ  →  x_fake = G(z)
          D_θ(x) ∈ (0, 1): probability that x is REAL, for real x ~ p_data and fake G(z)</div>
          <ul><li><b>Generator</b>: maps random noise to a sample; it never sees real data directly, only gradients through D.</li><li><b>Discriminator</b>: a binary classifier (sigmoid output). Real samples are labelled y = 1, generated samples y = 0.</li><li>Both are neural networks (MLPs for vanilla GAN, CNNs for DCGAN).</li></ul>` },
        { h: "Alternating training", b: `<ol><li><b>Train D</b> (G frozen): take a mini-batch of real x (label 1) and fakes G(z) (label 0). Minimise BCE, update θ.</li><li><b>Train G</b> (D frozen): generate G(z), pass it through D, and update φ so that D labels the fakes as real. The gradient flows <i>through</i> D into G, but only G's weights change.</li><li>Repeat. Often k discriminator steps per generator step.</li></ol>
          <p>The lecture walks through the forward pass, the generator loss and backward pass, and the discriminator loss and backward pass, as separate stages.</p>`,
          ask: { q: "When the generator is updated, the discriminator's weights are:", o: ["Also updated", "Frozen", "Re-initialised", "Doubled"], a: 1, x: "Gradients pass through D, but only G's parameters change." } },
        { h: "Six limitations of VAEs (Lecture 31)", b: `<ol><li><b>Gaussian assumption</b>: q(z|x) = N(μ, σ²) and p(z) = N(0, I) make training easy, but real data can be far more complex.</li><li><b>Blurry images</b>: pixel-wise MSE makes the decoder <i>average</i> plausible outputs when uncertain, which removes sharp edges.</li><li><b>Reconstruction vs KL trade-off</b>: reconstruction wants more information in z; KL wants q(z|x) ≈ N(0, I). Improving one can hurt the other.</li><li><b>Posterior collapse</b>: if KL pressure is too strong, the encoder outputs μ ≈ 0, σ ≈ 1 for <i>every</i> input; KL ≈ 0 but z carries no information about x. Powerful autoregressive text decoders can then ignore z entirely.</li><li><b>Explicit likelihood assumption</b>: the decoder must output a predefined distribution (Gaussian → MSE, Bernoulli → BCE). If it's too simple, samples look unrealistic.</li><li><b>Missing fine detail</b>: overall structure is fine, but sharp edges, textures and small facial details are lost.</li></ol>
          <p><b>The GAN's promise</b>: generate highly realistic data <i>without</i> explicitly defining a probability distribution or a reconstruction loss. Two networks compete: generate fake → D classifies → G uses D's prediction to improve → repeat.</p>` },
        { h: "Generator and discriminator training, with numbers (Lecture 32)", b: `<p><b>Generator step</b> (target y = 1, D frozen): z ~ N(0, I) → x_fake = G_φ(z) (same size as a real image) → ŷ = D_θ(x_fake). BCE with y = 1 gives <b>L_G = −log D(G(z))</b>. If D(G(z)) = 0.2, L_G = −log 0.2 ≈ <b>1.609</b> (high: D spots the fake). Chain rule: ∂L_G/∂φ = ∂L_G/∂ŷ · ∂ŷ/∂x_fake · ∂x_fake/∂φ; then φ ← φ − η·∂L_G/∂φ, while θ stays fixed.</p>
          <p><b>Discriminator step</b> (G frozen): L_D = −log D(x) − log(1 − D(G(z))).</p>
          <ul><li>Good D: D(x) = 0.9, D(G(z)) = 0.2 → 0.105 + 0.223 = <b>0.328</b>.</li><li>Poor D: D(x) = 0.2, D(G(z)) = 0.8 → 1.609 + 1.609 = <b>3.218</b>.</li></ul>` }
      ],
      keys: ["G: noise z → fake sample. D: sample → probability of being real (sigmoid).", "Labels: real = 1, fake = 0 for D.", "Training alternates: update D with G frozen, then G with D frozen.", "GANs replace pixel reconstruction losses with a learned adversary, which gives sharper samples than VAEs."],
      traps: ["G never sees real images; it learns only through D's gradients.", "D outputs the probability that the input is REAL.", "Adversarial means opposite objectives, not malicious inputs."],
      quiz: [
        { q: "The input to a GAN generator is:", o: ["A real image", "A random noise vector z", "The discriminator's output", "A class label only"], a: 1, x: "z is sampled from a simple prior such as N(0, I) or Uniform.", r: 1 },
        { q: "When training the discriminator, generated samples are labelled:", o: ["1", "0", "0.5", "With their class index"], a: 1, x: "Real = 1, fake = 0.", r: 1 },
        { q: "A key motivation for GANs over VAEs is that VAE samples tend to be:", o: ["Too sharp", "Blurry", "Discrete", "Always identical"], a: 1, x: "Pixel-wise likelihood losses average over possibilities.", r: 0 },
        { q: "Which statements about GAN training are true? (Select all that apply)", o: ["D and G are updated alternately", "D is frozen while G is updated", "G receives gradients through D", "G is trained to minimise D's accuracy on real images"], a: [0, 1, 2], x: "G cannot affect D's output on real images; it only tries to make D call its fakes real.", r: 2 },
        { q: "In VAE posterior collapse, the encoder outputs approximately:", o: ["μ ≈ x, σ ≈ 0", "μ ≈ 0, σ ≈ 1 for every input, so z carries no information about x", "Very large μ", "A different distribution for every pixel"], a: 1, x: "KL ≈ 0, but the latent code becomes uninformative.", r: 3 },
        { q: "During the generator update, D(G(z)) = 0.2. The generator loss −log D(G(z)) is (natural log, 3 decimals):", a: { n: 1.609, tol: 0.002 }, x: "−ln 0.2 = 1.609: high, because D confidently calls the fake image fake.", r: 4 },
        { q: "A poorly trained discriminator gives D(x) = 0.2 on a real image and D(G(z)) = 0.8 on a fake. Compute L_D (natural log, 3 decimals).", a: { n: 3.219, tol: 0.003 }, x: "−ln 0.2 − ln(1 − 0.8) = 1.609 + 1.609 = 3.219.", r: 4 },
        { q: "Which are VAE limitations listed in the course? (Select all that apply)", o: ["Blurry outputs from pixel-wise averaging", "Posterior collapse", "An explicit likelihood assumption", "Mode collapse caused by a discriminator"], a: [0, 1, 2], x: "VAEs have no discriminator; mode collapse is a GAN problem.", r: 3 }
      ]
    },
    {
      id: "w5t2", title: "The GAN objective, derived step by step", lec: [33], min: 21, w: "ganloss",
      hook: "The discriminator is just a binary classifier trained with binary cross-entropy. Start from BCE, plug in y = 1 for real and y = 0 for fake, and you get the famous min-max equation. Try it before reading on.",
      reveal: "<p>BCE = −[y log ŷ + (1−y) log(1−ŷ)]. Real (y = 1, ŷ = D(x)) gives <b>−log D(x)</b>. Fake (y = 0, ŷ = D(G(z))) gives <b>−log(1 − D(G(z)))</b>. Add them, flip the sign, average over batches: V(D, G) = E[log D(x)] + E[log(1 − D(G(z)))]. D maximises V; G minimises it.</p>",
      cards: [
        { h: "Discriminator loss from BCE", b: `<div class="eq">Real sample (y = 1):  L_real = −log D_θ(x)</div><div class="eq">Fake sample (y = 0):  L_fake = −log(1 − D_θ(G_φ(z)))</div><div class="eq">L_D = L_real + L_fake = −[log D(x) + log(1 − D(G(z)))]</div>
          <p>Minimising L_D over θ is the same as <b>maximising</b> V_D = log D(x) + log(1 − D(G(z))). Over a mini-batch this becomes an expectation:</p>
          <div class="eq">max_θ  V(θ; φ) = E_{x~p_data}[log D_θ(x)] + E_{z~p_z}[log(1 − D_θ(G_φ(z)))]</div>
          <p>The semicolon notation V(θ; φ) means only θ is optimised while φ is held fixed.</p>` },
        { h: "Why D pushes D(x) → 1 and D(G(z)) → 0", b: `<div class="tablewrap"><table><tr><th>D(x) on a real image</th><th>log D(x)</th></tr><tr><td>0.1 (bad)</td><td>−2.303</td></tr><tr><td>0.5</td><td>−0.693</td></tr><tr><td>0.9 (good)</td><td>−0.105</td></tr><tr><td>1 (maximum)</td><td>0</td></tr></table></div>
          <p>log D(x) increases towards its maximum 0 as D(x) → 1. Likewise log(1 − D(G(z))) is maximised (→ 0) as D(G(z)) → 0. So maximising V makes D say 1 for real and 0 for fake.</p>`, w: "ganloss" },
        { h: "The generator's side, and the min-max game", b: `<p>The first term, E[log D(x)], does not depend on φ, so the generator only affects the second term and wants D(G(z)) → 1, which drives log(1 − D(G(z))) → −∞:</p>
          <div class="eq">min_φ  E_{z}[log(1 − D_θ(G_φ(z)))]</div><div class="eq">Together:  min_G max_D  V(D, G) = E_{x~p_data}[log D(x)] + E_{z~p_z}[log(1 − D(G(z)))]</div>
          <p><b>Non-saturating trick</b> (used in practice): early in training D easily rejects fakes (D(G(z)) ≈ 0), and log(1 − D(G(z))) is flat there, so G gets tiny gradients. Instead G <b>maximises log D(G(z))</b>, i.e. minimises −log D(G(z)), which has strong gradients exactly when G is losing.</p>`,
          ask: { q: "D(G(z)) = 0.1. What is log(1 − D(G(z))) (natural log)?", o: ["−0.105", "−2.303", "−0.693", "0"], a: 0, x: "ln(0.9) = −0.105." } }
      ],
      keys: ["L_D = −log D(x) − log(1 − D(G(z))), straight from BCE with y = 1 and y = 0.", "V(D,G) = E[log D(x)] + E[log(1 − D(G(z)))]; D maximises, G minimises: min_G max_D V.", "D wants D(x) → 1 and D(G(z)) → 0; G wants D(G(z)) → 1.", "The first term doesn't depend on G.", "Non-saturating generator loss: minimise −log D(G(z)) for stronger early gradients."],
      traps: ["ln(0.1) = −2.303, ln(0.5) = −0.693, ln(0.9) = −0.105: memorise these.", "Minimising −V is maximising V; watch the signs.", "The generator objective in the original minimax form saturates early in training."],
      quiz: [
        { q: "Starting from BCE, the discriminator loss on a single real sample is:", o: ["−log(1 − D(x))", "−log D(x)", "log D(x)", "−log D(G(z))"], a: 1, x: "y = 1 kills the second BCE term, leaving −log D(x).", r: 0 },
        { q: "Compute the discriminator loss L_D = −log D(x) − log(1 − D(G(z))) for D(x) = 0.9 and D(G(z)) = 0.2 (natural logs, 3 decimals).", a: { n: 0.329, tol: 0.003 }, x: "−ln 0.9 − ln 0.8 = 0.105 + 0.223 = 0.329.", r: 0 },
        { q: "In min_G max_D V(D, G), which term of V does the generator influence?", o: ["E[log D(x)] only", "E[log(1 − D(G(z)))] only", "Both terms", "Neither"], a: 1, x: "Real data does not depend on G.", r: 2 },
        { q: "Why is the non-saturating generator loss −log D(G(z)) used in practice?", o: ["It is symmetric", "log(1 − D(G(z))) has very small gradients when D confidently rejects fakes early in training", "It removes the need for a discriminator", "It makes D linear"], a: 1, x: "−log D(G(z)) is steep exactly when D(G(z)) ≈ 0.", r: 2 },
        { q: "As D(x) on real images rises from 0.1 to 0.9, the value log D(x):", o: ["Decreases from −0.105 to −2.303", "Increases from −2.303 to −0.105", "Stays at 0", "Becomes positive"], a: 1, x: "log is increasing; its maximum on (0,1] is 0 at D(x) = 1.", r: 1 }
      ]
    },
    {
      id: "w5t3", title: "Convergence, Nash equilibrium and failure modes", lec: [34], min: 15, w: "gan1d",
      hook: "At the end of perfect GAN training, the discriminator outputs exactly 0.5 for every image. Is that a broken discriminator, or a sign of success?",
      reveal: "<p>Success. If p_g = p_data, no classifier can do better than chance, so the optimal discriminator is D*(x) = ½. This point, where neither player can improve by changing only its own strategy, is the <b>Nash equilibrium</b> of the game.</p>",
      cards: [
        { h: "The optimal discriminator", b: `<div class="eq">For a fixed G:  D*(x) = p_data(x) / (p_data(x) + p_g(x))</div>
          <div class="eq">V(D*, G) = −log 4 + 2 · JSD(p_data ‖ p_g)</div>
          <ul><li>So training G against an optimal D minimises the <b>Jensen–Shannon divergence</b> (JSD ≥ 0, symmetric, maximum log 2).</li><li>The global minimum is reached when p_g = p_data: then D* = ½ everywhere and V = −log 4 ≈ −1.386.</li></ul>`, w: "gan1d" },
        { h: "Nash equilibrium", b: `<p>A pair (G*, D*) where neither player can lower its own cost by changing only its own parameters. For GANs: p_g = p_data and D(x) = ½. In practice simultaneous gradient descent on a min-max game need not converge: it can oscillate around the equilibrium.</p>`,
          ask: { q: "At the GAN's global optimum, D(x) for any input equals:", o: ["0", "1", "0.5", "It depends on x"], a: 2, x: "p_g = p_data ⇒ D* = p/(p + p) = ½." } },
        { h: "What goes wrong in practice", b: `<ul><li><b>Mode collapse</b>: G produces only a few kinds of samples (e.g. only 1s and 7s) because they reliably fool D. Low diversity.</li><li><b>Vanishing gradients</b>: if D becomes too good, D(G(z)) ≈ 0 and the minimax generator loss saturates. When the supports of p_g and p_data barely overlap, the JSD is stuck at log 2 and gives no useful gradient.</li><li><b>Non-convergence / oscillation</b>: the two players chase each other.</li><li><b>Sensitivity to hyperparameters</b> and to the balance between D and G.</li></ul>
          <p>Remedies: the non-saturating loss, DCGAN architecture rules, label smoothing, minibatch discrimination, and Wasserstein GAN (Earth-Mover distance with a 1-Lipschitz critic, via weight clipping or a gradient penalty).</p>` },
        { h: "What convergence looks like during training (Lecture 34)", b: `<ul><li>Early: G_φ(z) produces noise or distorted faces; p_g ≠ p_data, so D wins easily (D(x) ≈ 1, D(G(z)) ≈ 0).</li><li>Gradients from D flow back into G; generated samples improve and p_g → p_data. D(G(z)) climbs, e.g. <b>0.1 → 0.4 → 0.5</b>.</li><li>Ideal equilibrium: p_g = p_data, so D(x) ≈ D(G(z)) ≈ 0.5. This does not mean D is poorly trained; it means G matched the data distribution.</li><li><b>Nash equilibrium</b>: neither G nor D can get a better outcome by changing only its own parameters while the other's are fixed.</li></ul>` }
      ],
      keys: ["D*(x) = p_data/(p_data + p_g).", "With D*, G minimises JSD: V = −log 4 + 2·JSD; global optimum p_g = p_data, D* = ½, V = −log 4.", "Nash equilibrium: neither player can improve unilaterally.", "Failure modes: mode collapse, vanishing gradients, oscillation/non-convergence.", "Fixes: non-saturating loss, DCGAN design, WGAN (Wasserstein distance, 1-Lipschitz critic)."],
      traps: ["Mode collapse is low diversity, not low quality.", "JSD is symmetric; KL is not.", "D = ½ at equilibrium does not mean D is untrained."],
      quiz: [
        { q: "For a fixed generator, the optimal discriminator is:", o: ["D*(x) = p_g(x) / p_data(x)", "D*(x) = p_data(x) / (p_data(x) + p_g(x))", "D*(x) = ½ always", "D*(x) = p_data(x)"], a: 1, x: "Derived by maximising V pointwise.", r: 0 },
        { q: "With an optimal discriminator, the GAN generator objective is equivalent to minimising:", o: ["KL(p_g ‖ p_data)", "Jensen–Shannon divergence between p_data and p_g", "Mean squared error", "Total variation only"], a: 1, x: "V(D*, G) = −log 4 + 2·JSD.", r: 0 },
        { q: "At the global optimum, the value V(D*, G*) equals (natural log, 3 decimals):", a: { n: -1.386, tol: 0.002 }, x: "−log 4 = −1.386.", r: 0 },
        { q: "A GAN trained on MNIST generates only the digits 1 and 7, but very realistically. This is:", o: ["Overfitting", "Mode collapse", "Vanishing gradients", "Posterior collapse"], a: 1, x: "The generator covers only a few modes of the data distribution.", r: 2 },
        { q: "Which are recognised GAN training problems? (Select all that apply)", o: ["Mode collapse", "Vanishing generator gradients when D is too strong", "Oscillation instead of convergence", "Guaranteed convergence in one epoch"], a: [0, 1, 2], x: "GANs are notoriously unstable; convergence is never guaranteed.", r: 2 },
        { q: "During GAN training, D(G(z)) rising from 0.1 towards 0.5 indicates:", o: ["The discriminator is diverging", "Generated samples are becoming harder to tell from real ones", "Mode collapse", "The learning rate is too small"], a: 1, x: "p_g is approaching p_data.", r: 3 }
      ]
    },
    {
      id: "w5t4", title: "DCGAN and the hands-on GANs", lec: [35, 36, 37], min: 15,
      hook: "Swap the MLPs inside a GAN for CNNs and training often blows up. DCGAN found a handful of architectural rules that made convolutional GANs train reliably. Guess one: what replaces max pooling?",
      reveal: "<p><b>Strided convolutions</b> in the discriminator (learned down-sampling) and <b>fractionally-strided (transposed) convolutions</b> in the generator (learned up-sampling). No pooling, no fully connected hidden layers, and batch normalisation almost everywhere.</p>",
      cards: [
        { h: "DCGAN guidelines (Radford et al., 2015)", b: `<ul><li>Replace pooling with <b>strided convolutions</b> (D) and <b>transposed convolutions</b> (G).</li><li>Use <b>batch normalisation</b> in both networks, except the generator's output layer and the discriminator's input layer.</li><li>Remove fully connected hidden layers.</li><li>Generator: <b>ReLU</b> in hidden layers, <b>tanh</b> at the output (images scaled to [−1, 1]).</li><li>Discriminator: <b>LeakyReLU</b> (slope 0.2) everywhere, sigmoid output.</li><li>Adam with learning rate 0.0002 and β₁ = 0.5.</li></ul>
          <p>Generator shape flow: z (100) → project and reshape 4×4×1024 → 8×8×512 → 16×16×256 → 32×32×128 → 64×64×3.</p>`,
          ask: { q: "DCGAN's generator output activation is:", o: ["Sigmoid", "Softmax", "Tanh", "LeakyReLU"], a: 2, x: "Images are scaled to [−1, 1] to match tanh." } },
        { h: "Transposed convolution output size", b: `<div class="eq">output = (n − 1)·s − 2p + f   (+ output_padding)</div><p>Example: n = 4, f = 4, s = 2, p = 1 → (3)·2 − 2 + 4 = 8. Each DCGAN generator block doubles the spatial size this way.</p>` },
        { h: "Hands-on: vanilla GAN and DCGAN on MNIST", b: `<ul><li>Vanilla GAN: MLP generator (z → 256 → 512 → 784, tanh) and MLP discriminator (784 → 512 → 256 → 1, sigmoid), LeakyReLU in D.</li><li>Training loop per batch: (1) D step on real (label 1) and fake (label 0) with BCE; (2) G step: generate fakes, label them 1 (non-saturating), back-propagate through the frozen D.</li><li>Monitor D loss, G loss, and sample grids every few epochs. The losses do not steadily fall as in a classifier; they balance and oscillate.</li><li>DCGAN version: Conv2DTranspose generator and Conv2D discriminator, giving visibly sharper digits.</li></ul>` }
      ],
      keys: ["DCGAN: strided conv in D, transposed conv in G, no pooling, no FC hidden layers, BatchNorm.", "G: ReLU hidden, tanh output. D: LeakyReLU (0.2), sigmoid output.", "Adam with lr = 2e-4, β₁ = 0.5.", "Transposed conv output = (n − 1)s − 2p + f.", "In code, the G step labels fakes as 'real' (1) to use the non-saturating loss."],
      traps: ["BatchNorm is NOT applied on G's output layer or D's input layer.", "GAN losses don't converge to zero; watch the samples, not only the loss.", "LeakyReLU is in the discriminator; ReLU is in the generator."],
      quiz: [
        { q: "Which DCGAN design choices are correct? (Select all that apply)", o: ["Replace pooling with strided convolutions", "Use tanh at the generator output", "Use LeakyReLU in the discriminator", "Use large fully connected hidden layers in both networks"], a: [0, 1, 2], x: "DCGAN removes fully connected hidden layers.", r: 0 },
        { q: "A transposed convolution with input 8×8, kernel 4, stride 2, padding 1 outputs size:", a: { n: 16, tol: 0 }, x: "(8 − 1)·2 − 2·1 + 4 = 14 − 2 + 4 = 16.", r: 1 },
        { q: "In the generator update step of the hands-on code, fake images are passed to D with target label:", o: ["0", "1", "0.5", "No label"], a: 1, x: "Labelling fakes as real implements the non-saturating loss −log D(G(z)).", r: 2 },
        { q: "The recommended Adam settings in DCGAN are:", o: ["lr = 0.1, β₁ = 0.9", "lr = 0.0002, β₁ = 0.5", "lr = 0.001, β₁ = 0.999", "lr = 1, β₁ = 0"], a: 1, x: "A lower β₁ reduces momentum, which stabilises GAN training.", r: 0 }
      ]
    }
  ],
  test: [
    { q: "In a GAN, D(x) represents:", o: ["The probability that x is fake", "The probability that x is real", "The latent code of x", "The reconstruction of x"], a: 1, x: "D outputs P(real).", t: "w5t1", r: 1 },
    { q: "The discriminator of a GAN is trained as a binary classifier using:", o: ["MSE", "Binary cross-entropy", "Categorical cross-entropy with 10 classes", "KL divergence to N(0, I)"], a: 1, x: "The GAN objective is derived from BCE.", t: "w5t2", r: 0 },
    { q: "Compute −log D(x) for D(x) = 0.5 (natural log, 3 decimals).", a: { n: 0.693, tol: 0.002 }, x: "−ln 0.5 = 0.693.", t: "w5t2", r: 1 },
    { q: "The GAN value function is V(D,G) = E[log D(x)] + E[log(1 − D(G(z)))]. The players' goals are:", o: ["Both minimise V", "D minimises V, G maximises V", "D maximises V, G minimises V", "Both maximise V"], a: 2, x: "min_G max_D V.", t: "w5t2", r: 2 },
    { q: "If p_g = p_data, the optimal discriminator outputs:", a: { n: 0.5, tol: 0.001 }, x: "D* = p/(p + p) = 0.5.", t: "w5t3", r: 0 },
    { q: "Which divergence does the original GAN minimise when the discriminator is optimal?", o: ["KL divergence", "Reverse KL divergence", "Jensen–Shannon divergence", "Wasserstein distance"], a: 2, x: "WGAN switches to the Wasserstein distance.", t: "w5t3", r: 0 },
    { q: "A generator that produces very realistic but nearly identical samples suffers from:", o: ["Vanishing gradients", "Mode collapse", "Over-regularisation", "Exploding KL"], a: 1, x: "Low diversity = mode collapse.", t: "w5t3", r: 2 },
    { q: "Which of the following are true about the Nash equilibrium of a GAN? (Select all that apply)", o: ["Neither player can improve by changing only its own parameters", "The discriminator outputs ½ for all inputs", "The generator distribution equals the data distribution", "The generator loss becomes exactly zero"], a: [0, 1, 2], x: "At equilibrium log(1 − ½) = −log 2, so the loss is not zero.", t: "w5t3", r: 1 },
    { q: "DCGAN's discriminator uses which activation in its hidden layers?", o: ["ReLU", "LeakyReLU", "Tanh", "Softmax"], a: 1, x: "LeakyReLU with slope 0.2.", t: "w5t4", r: 0 },
    { q: "Why does a GAN produce sharper images than a VAE trained with pixel-wise MSE?", o: ["GANs have more layers", "GANs use a learned adversarial loss instead of averaging pixel-wise reconstruction errors", "GANs use a KL term", "GANs use larger images"], a: 1, x: "Pixel-wise losses favour the average of plausible outputs, which looks blurry.", t: "w5t1", r: 0 },
    { q: "Lecture 32: a well-trained discriminator gives D(x) = 0.9 and D(G(z)) = 0.2. Compute L_D = −ln D(x) − ln(1 − D(G(z))) (3 decimals).", a: { n: 0.328, tol: 0.003 }, x: "0.105 + 0.223 = 0.328.", t: "w5t1", r: 4 },
    { q: "The main motivation for GANs given in the course is to:", o: ["Learn an explicit likelihood p(x)", "Generate highly realistic data without explicitly defining a probability distribution or reconstruction loss", "Compress data", "Speed up VAE training"], a: 1, x: "GANs are implicit models: realism is judged by a learned discriminator.", t: "w5t1", r: 3 }
  ]
});
