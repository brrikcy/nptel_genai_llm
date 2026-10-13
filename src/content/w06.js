COURSE.weeks.push({
  id: "w6", n: 6, title: "GAN variants and applications",
  tagline: "cGAN, Pix2Pix, CycleGAN, StyleGAN, StyleGAN2.",
  intro: "Vanilla GANs generate random samples. This week adds control: conditioning on a label (cGAN), translating paired images (Pix2Pix), translating without pairs (CycleGAN), and controlling style at every scale (StyleGAN, StyleGAN2). Lectures 38–43.",
  topics: [
    {
      id: "w6t1", title: "Conditional GAN: steer the generator", lec: [38], min: 13,
      hook: "Your GAN draws convincing digits, but the discriminator only checks “real or fake”. If you hand both networks the label “3”, what new thing can the discriminator now catch?",
      reveal: "<p>A perfectly realistic <b>7</b> passed off as a 3. With the label, D judges <i>real-and-matching</i>, so G is forced to produce images that agree with the condition. That is the conditional GAN.</p>",
      cards: [
        { h: "Add the condition to both players", b: `<div class="eq">min_G max_D  E[log D(x | y)] + E[log(1 − D(G(z | y) | y))]</div>
          <ul><li>Condition y: a class label (one-hot or embedded), attributes, text, or an image.</li><li>Generator input: concatenate z and y (or a label embedding).</li><li>Discriminator input: the image together with y (concatenate y as extra channels or embed it).</li><li>Result: <b>controlled generation</b>; choose y to choose what you get.</li></ul>` },
        { h: "Why it matters", b: `<ul><li>Label conditioning: generate a requested class (data augmentation for rare classes).</li><li>Paired learning: when the condition is a whole image, you get image-to-image translation (Pix2Pix, next topic).</li><li>Text conditioning: text-to-image GANs, a forerunner of today's diffusion systems.</li></ul>`,
          ask: { q: "In a cGAN, the discriminator receives:", o: ["Only the image", "Only the label", "The image together with the condition", "The noise vector"], a: 2, x: "D must judge whether the image is real AND matches the condition." } }
      ],
      keys: ["cGAN: G(z, y) and D(x, y); the label is fed to both networks.", "Objective: min_G max_D E[log D(x|y)] + E[log(1 − D(G(z|y)|y))].", "D checks realism and consistency with the condition.", "Enables controlled generation; an image condition gives Pix2Pix."],
      traps: ["Conditioning only G is not a cGAN; D must see y too.", "z is still needed for variety within a class."],
      quiz: [
        { q: "In a conditional GAN, the condition y is provided to:", o: ["Only the generator", "Only the discriminator", "Both generator and discriminator", "Neither; it is used in the loss only"], a: 2, x: "Both networks are conditioned.", r: 0 },
        { q: "What new kind of fake can a conditional discriminator reject that an unconditional one cannot?", o: ["A blurry image", "A realistic image that does not match its label", "A noisy image", "An image of the wrong size"], a: 1, x: "D(x | y) checks label consistency.", r: 0 },
        { q: "Which are typical ways to inject a class label into a cGAN? (Select all that apply)", o: ["Concatenate a one-hot vector with z", "Use a learned label embedding", "Append the label as extra image channels for D", "Remove the noise vector entirely"], a: [0, 1, 2], x: "Noise is still needed for diversity within a class.", r: 0 }
      ]
    },
    {
      id: "w6t2", title: "Pix2Pix: paired image-to-image translation", lec: [39], min: 16, w: "unet",
      hook: "You have 1,000 pairs of (building outline, photo of that building). You want to turn new outlines into photos. A plain L1 loss gives blurry photos; a plain GAN gives sharp photos of the wrong building. What happens if you use both?",
      reveal: "<p>You get <b>Pix2Pix</b>: the L1 loss keeps the output faithful to the target (low-frequency correctness), and the adversarial loss makes it sharp and realistic (high-frequency detail). Add a U-Net generator and a PatchGAN discriminator and you have the full recipe.</p>",
      cards: [
        { h: "The setup", b: `<ul><li><b>Paired data</b>: each input x (sketch, edge map, label map, day photo, B/W image) has a matching target y.</li><li>Pix2Pix is a <b>conditional GAN</b> whose condition is the input image x.</li></ul>
          <div class="eq">G* = arg min_G max_D  L_cGAN(G, D) + λ · L_L1(G),     L_L1 = E‖y − G(x)‖₁     (λ = 100 in the paper)</div>` },
        { h: "U-Net generator", b: `<p>An encoder-decoder with <b>skip connections</b> between mirrored layers. Input and output share low-level structure (edges, layout), and the skips let that detail bypass the bottleneck. The noise z is supplied as dropout rather than an input vector.</p>`, w: "unet" },
        { h: "PatchGAN discriminator", b: `<ul><li>Instead of one real/fake score per image, D outputs an <b>N × N grid</b> of scores, each judging one patch (receptive field 70 × 70 in the paper).</li><li>The scores are averaged. The L1 term handles global correctness; PatchGAN enforces local, high-frequency realism (texture).</li><li>Fewer parameters, works on any image size, and treats the image like a Markov random field.</li></ul>`,
          ask: { q: "Why is the L1 term included in Pix2Pix?", o: ["To make images sharper", "To keep the output close to the paired target", "To replace the discriminator", "To add noise"], a: 1, x: "L1 enforces correspondence with the ground truth; the GAN loss enforces sharpness." } },
        { h: "Applications", b: `<p>Labels → street scene, edges → photo, aerial → map, day → night, B/W → colour, sketch → product image. The limitation is that it needs <b>paired</b> training data, which is often unavailable.</p>` }
      ],
      keys: ["Pix2Pix = conditional GAN on paired data; condition = the input image.", "Loss = cGAN loss + λ·L1(y, G(x)), λ ≈ 100.", "Generator: U-Net with skip connections. Discriminator: PatchGAN (an N×N grid of patch real/fake scores).", "Requires paired data, which motivates CycleGAN."],
      traps: ["L1 (not L2) is used because it blurs less.", "PatchGAN classifies patches, not pixels and not the whole image.", "Pix2Pix cannot train without paired examples."],
      quiz: [
        { q: "Pix2Pix requires which kind of training data?", o: ["Unpaired images from two domains", "Paired input–output images", "Only class labels", "Text–image pairs"], a: 1, x: "Each input must have its matching target.", r: 0 },
        { q: "The generator architecture used in Pix2Pix is:", o: ["A plain MLP", "A U-Net with skip connections", "A transformer decoder", "A VAE"], a: 1, x: "Skip connections carry low-level structure from input to output.", r: 1 },
        { q: "A PatchGAN discriminator outputs:", o: ["A single scalar for the whole image", "A grid of real/fake scores, one per image patch", "A segmentation mask", "A reconstruction"], a: 1, x: "Each output judges a local patch; the scores are averaged.", r: 2 },
        { q: "The Pix2Pix objective combines which terms? (Select all that apply)", o: ["Conditional adversarial loss", "L1 reconstruction loss weighted by λ", "Cycle-consistency loss", "KL divergence to a prior"], a: [0, 1], x: "Cycle-consistency belongs to CycleGAN; KL belongs to VAEs.", r: 0 }
      ]
    },
    {
      id: "w6t3", title: "CycleGAN: translation without pairs", lec: [40, 43], min: 16,
      hook: "Nobody has photographed the same horse as a zebra. Yet CycleGAN learns to turn horses into zebras. If there are no pairs to compare against, what stops the generator from outputting any random zebra?",
      reveal: "<p>The <b>round trip</b>. Horse → zebra → horse must give back the original horse. If the generator ignored the input and drew a random zebra, the reverse generator could not recover the original horse. That constraint is the <b>cycle-consistency loss</b>.</p>",
      cards: [
        { h: "Two generators, two discriminators", b: `<ul><li>G: X → Y (horse → zebra) and F: Y → X (zebra → horse).</li><li>D_Y: tells real zebras from G's zebras. D_X: tells real horses from F's horses.</li><li>Training data: <b>unpaired</b> sets of X images and Y images.</li></ul>` },
        { h: "The losses", b: `<div class="eq">L = L_GAN(G, D_Y) + L_GAN(F, D_X) + λ_cyc · L_cyc + λ_id · L_identity</div>
          <div class="eq">L_cyc = E_x‖F(G(x)) − x‖₁ + E_y‖G(F(y)) − y‖₁     (forward and backward cycle, λ_cyc ≈ 10)</div>
          <div class="eq">L_identity = E_y‖G(y) − y‖₁ + E_x‖F(x) − x‖₁     (optional; preserves colour composition)</div>
          <ul><li>The adversarial losses make outputs look like the target domain.</li><li>The cycle loss keeps the content of the input (it acts like a reconstruction loss via the other generator).</li><li>The original paper used least-squares GAN losses and a ResNet-based generator with PatchGAN discriminators.</li></ul>`,
          ask: { q: "The cycle-consistency loss compares:", o: ["G(x) with a paired target y", "F(G(x)) with the original x", "D_X with D_Y", "x with a random y"], a: 1, x: "Translate there and back again; you should recover the input." } },
        { h: "Uses, limits and the hands-on", b: `<ul><li>Uses: style transfer (photo ↔ Monet), season transfer (summer ↔ winter), horse ↔ zebra, domain adaptation (synthetic ↔ real), medical modality translation.</li><li>Limits: good at changing texture and colour, weak at changing geometry (a cat → dog shape change); can hide information steganographically to satisfy the cycle loss.</li><li>The practical session trains G, F, D_X and D_Y with adversarial, cycle and identity losses and shows translations in both directions.</li></ul>` }
      ],
      keys: ["CycleGAN: unpaired translation with two generators (G: X→Y, F: Y→X) and two discriminators (D_X, D_Y).", "Cycle loss: ‖F(G(x)) − x‖₁ + ‖G(F(y)) − y‖₁, weight λ ≈ 10.", "Optional identity loss ‖G(y) − y‖₁ preserves colour.", "Good for style, texture and colour changes; weak at large geometric changes."],
      traps: ["CycleGAN has 4 networks; Pix2Pix has 2.", "The cycle loss uses L1, not adversarial terms.", "Unpaired ≠ unlabelled: you still need two separate domain collections."],
      quiz: [
        { q: "How many generator networks does CycleGAN train?", a: { n: 2, tol: 0 }, x: "G: X→Y and F: Y→X (plus two discriminators).", r: 0 },
        { q: "CycleGAN's key advantage over Pix2Pix is that it:", o: ["Trains faster", "Does not need paired training examples", "Uses no discriminator", "Generates higher resolution by default"], a: 1, x: "It learns from two unpaired image collections.", r: 0 },
        { q: "The forward cycle-consistency term is:", o: ["‖G(x) − y‖₁", "‖F(G(x)) − x‖₁", "‖D(x) − 1‖²", "KL(G(x) ‖ y)"], a: 1, x: "x → G → F → back to x.", r: 1 },
        { q: "Which statements about CycleGAN are true? (Select all that apply)", o: ["It uses two adversarial losses", "It uses a cycle-consistency loss in both directions", "It can use an identity loss to preserve colour", "It requires the same scene photographed in both domains"], a: [0, 1, 2], x: "It specifically does not need paired scenes.", r: 1 }
      ]
    },
    {
      id: "w6t4", title: "StyleGAN and StyleGAN2", lec: [41, 42], min: 18,
      hook: "Older GANs feed the noise vector in at the first layer and hope for the best. StyleGAN feeds the first layer a constant, the same for every image. So where does each face's identity come from?",
      reveal: "<p>From <b>styles</b> injected at every layer. The noise z goes through a mapping network to w, and w modulates each layer's features via AdaIN. Coarse layers control pose and face shape; fine layers control colour and micro-texture. Separate per-pixel noise adds stochastic detail such as hair strands and freckles.</p>",
      cards: [
        { h: "StyleGAN's style-based generator", b: `<ul><li><b>Mapping network</b>: an 8-layer MLP maps z ∈ Z to an intermediate latent w ∈ W (512-d). W is less entangled than Z because it does not have to follow a fixed Gaussian shape.</li><li><b>Synthesis network</b>: starts from a <b>learned constant</b> 4×4×512 tensor and upsamples to 1024×1024.</li><li><b>AdaIN</b> (adaptive instance normalisation) at each layer: AdaIN(x_i, y) = y_s,i · (x_i − μ(x_i))/σ(x_i) + y_b,i, where (y_s, y_b) come from a learned affine transform of w.</li><li><b>Noise inputs</b>: per-layer Gaussian noise for stochastic variation.</li><li>Built on <b>progressive growing</b> (from ProGAN).</li></ul>` },
        { h: "Control at every scale", b: `<div class="tablewrap"><table><tr><th>Layers (resolution)</th><th>Controls</th></tr><tr><td>Coarse (4² – 8²)</td><td>Pose, face shape, glasses, hairstyle</td></tr><tr><td>Middle (16² – 32²)</td><td>Facial features, eyes open/closed</td></tr><tr><td>Fine (64² – 1024²)</td><td>Colour scheme, micro-structure</td></tr></table></div>
          <p><b>Style mixing</b>: use w₁ for the coarse layers and w₂ for the fine layers to mix two faces. The <b>truncation trick</b> (w′ = w̄ + ψ(w − w̄), ψ &lt; 1) trades diversity for quality.</p>`,
          ask: { q: "In StyleGAN, the synthesis network's very first input is:", o: ["The noise vector z", "A learned constant tensor", "The intermediate latent w", "A real image"], a: 1, x: "Styles from w arrive through AdaIN at every layer instead." } },
        { h: "StyleGAN2: fixing the artifacts", b: `<ul><li><b>Water-droplet artifacts</b>: blob-like spots caused by AdaIN normalising each feature map's mean and variance separately; the generator learned to sneak signal strength past the normalisation via a localised spike.</li><li><b>Fix: weight modulation and demodulation</b>. Instead of normalising activations, scale the convolution weights by the style (modulate), then normalise the weights to unit expected output variance (demodulate). The droplets disappear.</li><li><b>Phase artifacts</b> (features like teeth staying fixed while the face turns) came from progressive growing, which StyleGAN2 replaces with skip / residual generator and discriminator architectures.</li><li>Also: <b>path-length regularisation</b> (a fixed step in w gives a fixed-magnitude change in the image, for a smoother latent space) and lazy regularisation.</li></ul>` }
      ],
      keys: ["StyleGAN: mapping network z → w (8-layer MLP), constant input, AdaIN styles per layer, per-pixel noise, progressive growing.", "Coarse layers: pose and shape; fine layers: colour and texture. Style mixing and the truncation trick.", "StyleGAN2: water-droplet artifacts caused by AdaIN → replaced by weight modulation/demodulation.", "StyleGAN2: no progressive growing (phase artifacts) and path-length regularisation."],
      traps: ["AdaIN gets its scale and bias from w, not from z directly.", "Droplet artifacts come from AdaIN normalisation; phase artifacts come from progressive growing.", "The noise inputs add stochastic detail; they do not set identity."],
      quiz: [
        { q: "What is the role of StyleGAN's mapping network?", o: ["It classifies faces", "It maps z to an intermediate latent w that is less entangled", "It upsamples images", "It replaces the discriminator"], a: 1, x: "An 8-layer MLP from Z to W.", r: 0 },
        { q: "In AdaIN, the scale and bias applied to each normalised feature map come from:", o: ["Batch statistics", "A learned affine transform of w", "The discriminator", "Random noise"], a: 1, x: "Style (y_s, y_b) = A(w).", r: 0 },
        { q: "StyleGAN2 removed the water-droplet artifacts by:", o: ["Adding more noise", "Replacing AdaIN with weight modulation and demodulation", "Using a larger discriminator", "Removing the mapping network"], a: 1, x: "The normalisation moved from activations to convolution weights.", r: 2 },
        { q: "In StyleGAN, styles applied at coarse resolutions (4×4 to 8×8) mainly control:", o: ["Freckles and hair strands", "Colour scheme", "Pose and overall face shape", "Background noise only"], a: 2, x: "Coarse layers determine global structure.", r: 1 },
        { q: "Which are StyleGAN2 changes? (Select all that apply)", o: ["Weight demodulation", "Removing progressive growing", "Path-length regularisation", "Replacing the mapping network with a VAE encoder"], a: [0, 1, 2], x: "The mapping network is kept.", r: 2 }
      ]
    }
  ],
  test: [
    { q: "In a conditional GAN with class labels, the generator's input is:", o: ["Noise z only", "Label y only", "Noise z together with label y", "A real image"], a: 2, x: "z gives variety, y gives control.", t: "w6t1", r: 0 },
    { q: "Pix2Pix's full objective is:", o: ["L_cGAN only", "L_cGAN + λ·L1", "L_GAN + λ·L_cyc", "Reconstruction + KL"], a: 1, x: "Adversarial for realism plus L1 for faithfulness to the paired target.", t: "w6t2", r: 0 },
    { q: "PatchGAN mainly enforces:", o: ["Global colour balance", "Local, high-frequency realism (texture) in each patch", "Cycle consistency", "Disentanglement"], a: 1, x: "The L1 term handles low-frequency correctness.", t: "w6t2", r: 2 },
    { q: "The skip connections in the Pix2Pix U-Net generator help by:", o: ["Adding noise", "Passing low-level spatial detail directly from encoder to decoder", "Reducing the number of layers", "Classifying patches"], a: 1, x: "Input and output share structure such as edges.", t: "w6t2", r: 1 },
    { q: "How many networks in total are trained in a standard CycleGAN?", a: { n: 4, tol: 0 }, x: "Two generators and two discriminators.", t: "w6t3", r: 0 },
    { q: "For CycleGAN with generators G: X→Y and F: Y→X, the backward cycle loss is:", o: ["‖F(G(x)) − x‖₁", "‖G(F(y)) − y‖₁", "‖G(x) − y‖₁", "‖F(y) − x‖₁"], a: 1, x: "y → F → G → back to y.", t: "w6t3", r: 1 },
    { q: "Which tasks suit CycleGAN better than Pix2Pix? (Select all that apply)", o: ["Photo ↔ Monet painting style", "Horse ↔ zebra", "Edges → photo when paired data is available", "Summer ↔ winter landscapes"], a: [0, 1, 3], x: "When paired data exists, Pix2Pix is the natural choice.", t: "w6t3", r: 2 },
    { q: "In StyleGAN, per-pixel noise inputs are responsible for:", o: ["Identity of the face", "Stochastic details such as hair placement and freckles", "Pose", "The mapping from z to w"], a: 1, x: "Identity comes from the styles.", t: "w6t4", r: 0 },
    { q: "The truncation trick w′ = w̄ + ψ(w − w̄) with ψ < 1:", o: ["Increases diversity", "Trades diversity for higher average quality", "Removes the mapping network", "Fixes droplet artifacts"], a: 1, x: "Pulling w towards the mean avoids poorly modelled regions.", t: "w6t4", r: 1 },
    { q: "StyleGAN2's 'phase artifacts' (e.g. teeth not following head pose) were attributed to:", o: ["AdaIN", "Progressive growing", "The mapping network", "Weight demodulation"], a: 1, x: "StyleGAN2 replaced progressive growing with skip / residual architectures.", t: "w6t4", r: 2 }
  ]
});
