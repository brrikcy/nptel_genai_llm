COURSE.weeks.push({
  id: "w2", n: 2, title: "Autoencoders",
  tagline: "Compress, reconstruct, regularise: denoising, sparse, contractive.",
  intro: "The autoencoder is the first generative-flavoured model in the course: squeeze data through a narrow code and rebuild it. This week covers how it works, the losses, the main types, the three regularised variants, and why its limits lead straight to the VAE. Lectures 10–18.",
  topics: [
    {
      id: "w2t1", title: "Autoencoders: learn by squeezing", lec: [10], min: 19, w: "bottleneck",
      hook: "You must describe a friend's face to a sketch artist using only 10 numbers. Which 10 would you choose, and how would you know they were good choices?",
      reveal: "<p>You would pick the numbers that let the artist <b>redraw the face best</b>. That is exactly the autoencoder's training signal: compress the input to a few numbers (the <b>latent code</b>), reconstruct it, and judge the code by the reconstruction error. No labels are needed.</p>",
      cards: [
        { h: "Three parts: encoder, code, decoder", b: `<div class="eq">x → Encoder f(x) → z (latent / code / bottleneck) → Decoder g(z) → x̂</div>
          <ul><li><b>Encoder</b>: maps the input to a lower-dimensional representation (5 → 4 → 3 in the lecture's example).</li><li><b>Latent space / code / bottleneck</b>: the compressed representation z.</li><li><b>Decoder</b>: maps z back up to the input size (3 → 4 → 5).</li><li><b>Objective</b>: make x̂ ≈ x by minimising a reconstruction loss L(x, x̂).</li></ul>
          <p>Training is unsupervised (more precisely self-supervised): the target is the input itself.</p>` },
        { h: "Undercomplete vs overcomplete", b: `<div class="tablewrap"><table><tr><th></th><th>Undercomplete</th><th>Overcomplete</th></tr>
          <tr><td>Latent size</td><td>smaller than the input</td><td>equal to or larger than the input</td></tr>
          <tr><td>What it learns</td><td>forced to keep only the most salient features</td><td>can learn the identity map and copy the input</td></tr>
          <tr><td>Risk</td><td>too small → information loss, blurry reconstructions</td><td>low error with no useful features</td></tr>
          <tr><td>Remedy</td><td>choose the code size carefully</td><td>regularise: denoising, sparse, contractive</td></tr></table></div>
          <p>An undercomplete AE with linear activations and MSE learns the same subspace as <b>PCA</b>. Non-linear activations make it a non-linear generalisation of PCA.</p>`, w: "bottleneck" },
        { h: "What autoencoders are used for", b: `<ul><li>Dimensionality reduction and feature learning (use the encoder output as features).</li><li>Denoising images or signals.</li><li>Anomaly detection: train on normal data only; inputs that reconstruct badly (high error) are anomalies.</li><li>Compression, and pre-training of encoders.</li><li>A stepping stone to generation: the VAE turns the decoder into a proper generator.</li></ul>`,
          ask: { q: "An AE trained only on normal heartbeats sees an abnormal one. The reconstruction error will most likely be:", o: ["Lower than usual", "Higher than usual", "Exactly zero", "Unchanged"], a: 1, x: "It never learned to reconstruct abnormal patterns, so they reconstruct poorly. That is the basis of AE anomaly detection." } }
      ],
      keys: ["AE = encoder → latent code (bottleneck) → decoder; trained to reconstruct its own input.", "Undercomplete: code smaller than the input, learns salient features. Overcomplete: code ≥ input, can copy the input unless regularised.", "A linear AE with MSE spans the same subspace as PCA.", "Uses: dimensionality reduction, denoising, anomaly detection (high reconstruction error = anomaly)."],
      traps: ["Low reconstruction error alone does not prove the AE learned useful features (it may copy).", "AE training needs no labels; the input is the target.", "The bottleneck is the code layer, not the output layer."],
      quiz: [
        { q: "In an autoencoder, the target output during training is:", o: ["A class label", "The input itself", "Random noise", "The latent code"], a: 1, x: "The loss compares the reconstruction x̂ with the original x.", r: 0 },
        { q: "An autoencoder whose latent dimension is larger than the input dimension is called:", o: ["Undercomplete", "Overcomplete", "Variational", "Contractive"], a: 1, x: "Overcomplete AEs can trivially learn the identity unless regularised.", r: 1 },
        { q: "Why is an overcomplete autoencoder without regularisation risky?", o: ["It cannot be trained with backpropagation", "It may simply copy the input, giving low error but no useful features", "It always has a high reconstruction error", "It needs labelled data"], a: 1, x: "With enough capacity, the identity map gives near-zero loss and teaches nothing.", r: 1 },
        { q: "A linear autoencoder trained with MSE learns a representation equivalent to:", o: ["K-means", "PCA (principal component subspace)", "A decision tree", "Softmax regression"], a: 1, x: "A linear AE with squared error recovers the principal subspace.", r: 1 },
        { q: "Which are valid uses of autoencoders? (Select all that apply)", o: ["Anomaly detection via reconstruction error", "Image denoising", "Dimensionality reduction", "Supervised multi-class classification without any labels"], a: [0, 1, 2], x: "Classification still needs labels; an AE can only supply features for it.", r: 2 }
      ]
    },
    {
      id: "w2t2", title: "Reconstruction losses and AE architectures", lec: [11, 12, 17], min: 17, w: "aenum",
      hook: "Two autoencoders reconstruct the same black-and-white handwriting scan. One ends in a sigmoid and uses BCE, the other ends in a linear layer and uses MSE. Which one matches the data, and what goes wrong with the other?",
      reveal: "<p>Binary or [0, 1] pixels pair with <b>sigmoid + binary cross-entropy</b>: outputs stay in (0, 1) and the loss treats each pixel as a Bernoulli probability. A linear output can produce values like 1.4 or −0.2 that are not valid pixel intensities. MSE with a linear output is the right choice for <i>continuous, unbounded</i> data.</p>",
      cards: [
        { h: "The two reconstruction losses", b: `<div class="eq">MSE: L = (1/n) Σ (x_i − x̂_i)²     → continuous data, linear output</div>
          <div class="eq">BCE: L = −(1/n) Σ [x_i log x̂_i + (1 − x_i) log(1 − x̂_i)]     → binary or [0, 1]-normalised data, sigmoid output</div>
          <p>Probabilistic view: MSE is the negative log-likelihood of a Gaussian decoder; BCE is the negative log-likelihood of a Bernoulli decoder. This reappears in the VAE.</p>`, w: "aenum" },
        { h: "Shallow, deep and convolutional autoencoders", b: `<div class="tablewrap"><table><tr><th>Type</th><th>Structure</th><th>Good for</th></tr>
          <tr><td>Shallow AE</td><td>One hidden (code) layer: input → code → output</td><td>Simple tabular data; close to PCA</td></tr>
          <tr><td>Deep (stacked) AE</td><td>Several dense layers each side, e.g. 784 → 256 → 64 → 32 → 64 → 256 → 784</td><td>More complex, non-linear structure</td></tr>
          <tr><td>Convolutional AE</td><td>Encoder: Conv + pooling/stride. Decoder: upsampling or transposed convolutions (Conv2DTranspose)</td><td>Images: keeps spatial structure, far fewer parameters</td></tr></table></div>
          <p>The decoder is usually a mirror image of the encoder, but it does not have to be.</p>` },
        { h: "The hands-on version in Keras", b: `<ul><li>Load MNIST and scale pixels to [0, 1] (divide by 255). The images are their own targets: <code>model.fit(x_train, x_train, ...)</code>.</li><li>Dense AE: flatten to 784, encode to e.g. 32, decode back to 784 with a sigmoid, loss <code>binary_crossentropy</code> (or <code>mse</code>).</li><li>Convolutional AE: <code>Conv2D</code> + <code>MaxPooling2D</code> down, <code>UpSampling2D</code> or <code>Conv2DTranspose</code> up, last layer <code>Conv2D(1, (3,3), activation='sigmoid', padding='same')</code>.</li><li>Compare original and reconstructed digits side by side; deeper and convolutional AEs give sharper reconstructions.</li></ul>`,
          ask: { q: "In Keras, which layer increases spatial resolution with learnable weights?", o: ["MaxPooling2D", "Flatten", "Conv2DTranspose", "Dropout"], a: 2, x: "Transposed convolution learns how to upsample. UpSampling2D also upsamples, but has no weights." } }
      ],
      keys: ["Continuous data → linear output + MSE. Binary or [0,1] data → sigmoid output + BCE.", "MSE = Gaussian negative log-likelihood; BCE = Bernoulli negative log-likelihood.", "Types: shallow (one hidden layer), deep/stacked, convolutional (Conv + pool / Conv2DTranspose or UpSampling).", "In code the AE is fit with x as both input and target."],
      traps: ["BCE needs predictions strictly inside (0, 1), which is why it pairs with a sigmoid.", "UpSampling2D has no parameters; Conv2DTranspose does.", "Mirror-image architectures are conventional, not mandatory."],
      quiz: [
        { q: "MNIST pixels are scaled to [0, 1]. A standard choice of output activation and loss for an AE is:", o: ["Linear + categorical cross-entropy", "Sigmoid + binary cross-entropy", "Softmax + MSE", "ReLU + hinge loss"], a: 1, x: "Values in [0, 1] → sigmoid output, BCE loss (MSE also works, but BCE is the standard pairing).", r: 0 },
        { q: "Compute the MSE reconstruction loss for x = [0.8, 0.4] and x̂ = [0.6, 0.5].", a: { n: 0.025, tol: 0.0005 }, x: "((0.2)² + (−0.1)²)/2 = (0.04 + 0.01)/2 = 0.025.", r: 0 },
        { q: "Which architecture is most appropriate for an image autoencoder that preserves spatial structure with few parameters?", o: ["Shallow dense AE", "Convolutional AE", "Overcomplete dense AE", "A single linear layer"], a: 1, x: "Convolutions share weights and keep neighbourhoods intact.", r: 1 },
        { q: "In Keras, an autoencoder is trained with:", o: ["model.fit(x_train, y_train)", "model.fit(x_train, x_train)", "model.fit(y_train, x_train)", "model.predict(x_train)"], a: 1, x: "The input is also the target.", r: 2 },
        { q: "Minimising MSE corresponds to maximising the likelihood under which decoder distribution?", o: ["Bernoulli", "Gaussian", "Uniform", "Poisson"], a: 1, x: "The Gaussian log-likelihood contains −(x − x̂)²/(2σ²), so maximising it is minimising squared error.", r: 0 }
      ]
    },
    {
      id: "w2t3", title: "Regularised autoencoders: denoising, sparse, contractive", lec: [13, 14, 15, 18], min: 21,
      hook: "An overcomplete autoencoder can cheat by copying its input. Three fixes: break the input, ration the neurons, or make the code stubborn. Can you guess which name goes with which fix?",
      reveal: "<p><b>Denoising AE</b>: break the input (add noise) but ask for the clean output, so copying no longer works. <b>Sparse AE</b>: ration the neurons, so only a few code units may be active for any input. <b>Contractive AE</b>: make the code stubborn, so small input changes barely move it (penalise the encoder's Jacobian).</p>",
      cards: [
        { h: "Denoising autoencoder (DAE)", b: `<div class="eq">x̃ = x + noise (or masking)  →  encoder → z → decoder → x̂;   loss = L(x, x̂)   (compare with the CLEAN x)</div>
          <ul><li>Corruptions: additive Gaussian noise, masking noise (randomly zero some pixels), salt-and-pepper.</li><li>To undo the noise, the network must learn how neighbouring pixels depend on each other, i.e. the structure of the data, instead of the identity.</li><li>Noise is added only during training. At test time you feed noisy images and get cleaned ones back.</li></ul>`,
          ask: { q: "In a denoising AE, the loss compares the output with:", o: ["The noisy input x̃", "The clean input x", "The latent code", "A label"], a: 1, x: "Corrupt the input, reconstruct the original. Comparing with x̃ would teach it to reproduce the noise." } },
        { h: "Sparse autoencoder", b: `<p>Allow a large code, but force most units to be inactive for any given input. Each unit then specialises in a feature.</p>
          <div class="eq">L = L_recon(x, x̂) + β · Σ_j KL(ρ ‖ ρ̂_j)</div>
          <div class="eq">KL(ρ ‖ ρ̂_j) = ρ·log(ρ/ρ̂_j) + (1−ρ)·log((1−ρ)/(1−ρ̂_j))</div>
          <ul><li>ρ = target sparsity (small, e.g. 0.05); ρ̂_j = average activation of hidden unit j over the batch.</li><li>The penalty is 0 when ρ̂_j = ρ and grows as the unit fires more often.</li><li>Alternative: an L1 penalty λ Σ|h_j| on the activations.</li></ul>
          <p>This is the first time <b>KL divergence</b> shows up as a penalty. It is the centre of the VAE next week.</p>` },
        { h: "Contractive autoencoder (CAE)", b: `<div class="eq">L = L_recon(x, x̂) + λ · ‖J_f(x)‖²_F = L_recon + λ Σ_{i,j} (∂h_j / ∂x_i)²</div>
          <ul><li>J_f is the Jacobian of the <b>encoder</b> with respect to the input; ‖·‖_F is the Frobenius norm.</li><li>The penalty makes the code locally insensitive (it “contracts”) to small perturbations of the input, while reconstruction keeps it sensitive along directions that matter.</li><li>Denoising AE: robust because noise was injected into the data. Contractive AE: robust because the encoder's derivative is penalised analytically.</li></ul>` },
        { h: "Side by side", b: `<div class="tablewrap"><table><tr><th>Variant</th><th>What is changed</th><th>Extra term</th><th>Effect</th></tr>
          <tr><td>Denoising</td><td>The input (corrupted)</td><td>none (clean target)</td><td>Robust features; can clean noisy data</td></tr>
          <tr><td>Sparse</td><td>The loss</td><td>β Σ KL(ρ‖ρ̂_j) or L1 on activations</td><td>Few active units; specialised features</td></tr>
          <tr><td>Contractive</td><td>The loss</td><td>λ ‖∂h/∂x‖²_F</td><td>Code insensitive to small input changes</td></tr></table></div>
          <p>In the practical session all three are trained on MNIST and compared: reconstructions of noisy digits, activation histograms (sparse) and robustness to perturbations (contractive).</p>` }
      ],
      keys: ["Denoising AE: corrupt x → reconstruct the clean x; learns dependencies between neighbouring pixels.", "Sparse AE: adds β Σ KL(ρ‖ρ̂_j); ρ = target average activation (e.g. 0.05), ρ̂_j = actual average activation.", "Contractive AE: adds λ‖J_f(x)‖²_F, the squared Frobenius norm of the encoder Jacobian.", "All three prevent an overcomplete AE from learning the identity."],
      traps: ["Contractive penalises the ENCODER Jacobian, not the decoder's.", "In a sparse AE, ρ̂_j is averaged over training samples for one unit, not over units for one sample.", "Denoising adds noise to the input only; the target stays clean."],
      quiz: [
        { q: "In a sparse autoencoder, the KL-divergence penalty compares:", o: ["The input and the reconstruction", "The target sparsity ρ with the average activation ρ̂_j of each hidden unit", "The encoder and decoder weights", "Two latent codes"], a: 1, x: "KL(ρ ‖ ρ̂_j) is zero when unit j's average activation equals the target ρ.", r: 1 },
        { q: "The contractive autoencoder adds a penalty on:", o: ["The L2 norm of the decoder weights", "The Frobenius norm of the encoder's Jacobian with respect to the input", "The number of latent units", "The KL divergence to a Gaussian prior"], a: 1, x: "λ‖∂h/∂x‖²_F makes the code insensitive to small input perturbations.", r: 2 },
        { q: "Which statements about the denoising autoencoder are true? (Select all that apply)", o: ["The input is corrupted during training", "The loss compares the output with the clean input", "It must learn dependencies between neighbouring pixels", "It needs labelled noise types"], a: [0, 1, 2], x: "No labels are needed: the clean input is the target.", r: 0 },
        { q: "Compute KL(ρ ‖ ρ̂) for ρ = 0.1 and ρ̂ = 0.2 using natural logs: ρ·ln(ρ/ρ̂) + (1−ρ)·ln((1−ρ)/(1−ρ̂)). Round to 4 decimals.", a: { n: 0.0367, tol: 0.0006 }, x: "0.1·ln(0.5) + 0.9·ln(0.9/0.8) = −0.0693 + 0.9·0.1178 = −0.0693 + 0.1060 = 0.0367.", r: 1 },
        { q: "Which regularised AE gets its robustness by modifying the data rather than adding an analytic penalty term?", o: ["Sparse AE", "Contractive AE", "Denoising AE", "Undercomplete AE"], a: 2, x: "The denoising AE corrupts the inputs; sparse and contractive AEs add loss terms.", r: 3 }
      ]
    },
    {
      id: "w2t4", title: "An autoencoder by the numbers, and its limits", lec: [16], min: 14, w: "aenum",
      hook: "An autoencoder reconstructs handwritten digits almost perfectly. Pick a random point in its latent space and decode it. Do you get a new digit?",
      reveal: "<p>Usually <b>no</b>: you get a smudge. A plain AE only learns to map training inputs to codes and back. Nothing forces the space <i>between</i> the codes to decode to anything sensible, so the latent space has gaps and no known distribution to sample from. Fixing that is the job of the VAE.</p>",
      cards: [
        { h: "The worked example from the lecture", b: `<p>Architecture <b>5 → 4 → 3 → 4 → 5</b>, ReLU in hidden layers, linear output (continuous inputs), MSE loss.</p>
          <ol><li>Input x = [0.8, 0.4, 0.6, 0.2, 0.5]. First hidden neuron: z = 0.8·0.2 + 0.4·0.5 + 0.6·0.4 + 0.2·0.3 + 0.5·0.1 + 0.01 = 0.71 + 0.01 = <b>0.72</b>; ReLU(0.72) = 0.72.</li>
          <li>Repeat for the other 3 neurons → a 4-vector. Then 4 → 3 gives the <b>latent representation</b> (e.g. [0.760, 0.714, 0.944]).</li>
          <li>Decoder: 3 → 4 (ReLU), then 4 → 5 with a <b>linear</b> activation, so the output is just the weighted sum plus bias.</li>
          <li>Loss: MSE between x and x̂, averaged over the 5 values. Backprop + optimizer update all weights and biases; after training, x̂ ≈ x.</li></ol>
          <p>Every step is “inputs × weights + bias → activation”. Exams test exactly this, one neuron at a time.</p>`, w: "aenum" },
        { h: "Four limitations of plain autoencoders", b: `<ol><li><b>A low reconstruction error does not guarantee meaningful features.</b> You cannot read from the code whether a digit is a 2 or a 9, thick or thin, slanted or upright.</li>
          <li><b>The latent code is not directly usable</b> for classification, clustering or anomaly scoring just because reconstruction is good.</li>
          <li><b>Reconstruction is an approximation</b> from a compressed code, and the AE <b>does not generate new samples</b>: the latent space is irregular, with no known distribution to sample from.</li>
          <li><b>Latent size is a dilemma.</b> Too small: too much information lost, poor reconstruction. Too large: the model may just copy the input, so learning is weak.</li></ol>
          <p><b>The fix:</b> regularise the latent space by adding a KL-divergence term to the loss, which pulls the codes towards a known distribution such as N(0, I). That is the <b>variational autoencoder</b>, next week.</p>`,
          ask: { q: "What does the VAE add to the AE loss to fix the latent space?", o: ["An L1 penalty on the weights", "A KL-divergence term", "A classification loss", "Dropout"], a: 1, x: "KL(q(z|x) ‖ p(z)) regularises the latent space towards a prior, usually N(0, I)." } }
      ],
      keys: ["Each neuron: z = Σ w_i x_i + b, then activation; ReLU in hidden layers, linear at the output for continuous data.", "The output of the last encoder layer is the latent representation.", "The AE limits: no guarantee of meaningful latent features, irregular latent space, cannot sample new data, and the latent-size dilemma.", "The VAE fixes this with a KL regulariser on the latent space."],
      traps: ["The bias is added once per neuron, after summing the weighted inputs.", "Output activation for continuous inputs is linear, so f(a) = a.", "An AE reconstructs; it does not generate."],
      quiz: [
        { q: "A hidden neuron receives x = [1, 2, 3] with weights w = [0.5, −1, 0.5] and bias 0.2, followed by ReLU. Its output is:", a: { n: 0.2, tol: 0.001 }, x: "z = 0.5 − 2 + 1.5 + 0.2 = 0.2; ReLU(0.2) = 0.2.", r: 0 },
        { q: "The same neuron but with bias −0.5. Its ReLU output is:", a: { n: 0, tol: 0.001 }, x: "z = 0.5 − 2 + 1.5 − 0.5 = −0.5; ReLU(−0.5) = 0.", r: 0 },
        { q: "Why can't you simply sample a random latent vector from a plain AE and decode it into a realistic sample?", o: ["The decoder has no weights", "The latent space is irregular and has no known distribution to sample from", "AEs only work on text", "The encoder is non-differentiable"], a: 1, x: "Nothing in the AE loss organises the latent space, so random points fall in gaps.", r: 1 },
        { q: "What happens when the latent space of an AE is made very large?", o: ["Reconstruction always gets worse", "The model may copy the input: low error, weak feature learning", "Training becomes impossible", "It turns into a VAE"], a: 1, x: "Too much capacity allows an identity-like mapping.", r: 1 },
        { q: "For continuous inputs, the lecture's AE uses which activation at the output layer?", o: ["ReLU", "Sigmoid", "Linear", "Softmax"], a: 2, x: "Continuous targets → linear output → MSE loss.", r: 0 }
      ]
    }
  ],
  test: [
    { q: "An autoencoder is trained to minimise:", o: ["Classification error", "Reconstruction error between x and x̂", "The number of latent units", "The KL divergence between two classifiers"], a: 1, x: "Reconstruction error is the AE objective.", t: "w2t1", r: 0 },
    { q: "Which statements are true for an undercomplete autoencoder? (Select all that apply)", o: ["The latent dimension is smaller than the input dimension", "It is forced to capture the most salient features", "It is guaranteed to learn the identity function", "With linear activations and MSE it relates to PCA"], a: [0, 1, 3], x: "The bottleneck prevents an exact identity map.", t: "w2t1", r: 1 },
    { q: "Compute the BCE (natural log, averaged) for targets x = [1, 0] and outputs x̂ = [0.9, 0.2]. Round to 3 decimals.", a: { n: 0.164, tol: 0.003 }, x: "−½[ln 0.9 + ln 0.8] = −½[−0.1054 − 0.2231] = 0.164.", t: "w2t2", r: 0 },
    { q: "Which layer is typically used in the decoder of a convolutional autoencoder to increase spatial size with learnable weights?", o: ["MaxPooling2D", "Conv2DTranspose", "GlobalAveragePooling2D", "Flatten"], a: 1, x: "Transposed convolutions upsample and learn weights.", t: "w2t2", r: 1 },
    { q: "In a denoising AE trained with masking noise, at test time the network:", o: ["Must receive clean images", "Receives a noisy image and outputs a cleaned version", "Generates new images from random noise", "Outputs a class label"], a: 1, x: "It learned to map corrupted inputs to clean ones.", t: "w2t3", r: 0 },
    { q: "A sparse AE's penalty grows when a hidden unit's average activation ρ̂_j…", o: ["equals the target ρ", "moves away from the target ρ", "becomes exactly zero for one sample", "is computed by the decoder"], a: 1, x: "KL(ρ‖ρ̂_j) is 0 at ρ̂_j = ρ and increases as they diverge.", t: "w2t3", r: 1 },
    { q: "The contractive AE penalty λ‖J_f(x)‖²_F encourages:", o: ["Larger weights in the decoder", "A latent code that changes little for small changes of the input", "More active hidden units", "Larger reconstruction error"], a: 1, x: "Small encoder derivatives = locally contractive mapping.", t: "w2t3", r: 2 },
    { q: "Which regularised AE uses KL divergence inside its penalty?", o: ["Denoising", "Contractive", "Sparse", "Undercomplete"], a: 2, x: "The sparsity penalty is Σ KL(ρ‖ρ̂_j).", t: "w2t3", r: 1 },
    { q: "Input to a linear output neuron: activations [0.5, 1.0], weights [2, −1], bias 0.3. The output is:", a: { n: 0.3, tol: 0.001 }, x: "0.5·2 + 1.0·(−1) + 0.3 = 1 − 1 + 0.3 = 0.3. A linear activation passes it through unchanged.", t: "w2t4", r: 0 },
    { q: "Which is NOT a limitation of plain autoencoders discussed in the course?", o: ["Low reconstruction error does not guarantee meaningful latent features", "The latent space cannot be reliably sampled to generate new data", "They cannot be trained with gradient descent", "Choosing the latent size trades information loss against copying"], a: 2, x: "AEs train perfectly well with backpropagation; the issues are about the latent space.", t: "w2t4", r: 1 }
  ]
});
