COURSE.weeks.push({
  id: "w4", n: 4, title: "Advanced VAEs",
  tagline: "Disentanglement and the beta-VAE, conditional VAE, latent interpolation.",
  intro: R`With a working VAE, this week asks three questions. Can each code number mean one clear thing ($\beta$-VAE)? Can we ask for a particular kind of output (conditional VAE)? Can we glide smoothly from one image to another (interpolation)? The hands-on sessions build a VAE, a cVAE and a $\beta$-VAE. Lectures 25–30.`,
  topics: [
    {
      id: "w4t1", title: "Disentangled latents and the beta-VAE", lec: [26, 30], min: 18,
      hook: R`A face generator has 32 knobs (latent numbers). You turn knob 7 hoping to add a smile, and the face smiles, ages ten years and turns its head. What has gone wrong inside the latent space?`,
      reveal: R`<p>The latent space is <b>entangled</b>: one knob controls a mixture of features. In a <b>disentangled</b> space each independent feature (smile, age, pose) gets its own knob. The $\beta$-VAE pushes towards this by making the KL term count more, at a price.</p>`,
      cards: [
        { h: "Entangled vs disentangled", b: R`<ul><li><b>Entangled</b>: turning one latent number changes several visible features together. Hard to understand or control.</li><li><b>Disentangled</b>: each latent number controls <b>one</b> independent feature (position, size, rotation, colour, smile) and leaves the others alone.</li></ul>
          <p>Why we want it: we can understand what the model learned, edit one feature at a time, reuse the codes for other tasks, and check for unfairness.</p>
          <p><b>Example from the slides.</b> A $28 \times 28$ digit (784 pixels) squeezed into 4 latent numbers: if entangled, each $z_i$ is a mix of thickness, slant, width and curvature, so changing one changes several. A disentangled face model with 5 latents might learn $z_1 \approx$ hair, $z_2 \approx$ lighting, $z_3 \approx$ skin tone, $z_4 \approx$ smile, $z_5 \approx$ pose. Raising $z_4$ mainly changes the smile.</p>`, w: "latentfaces" },
        { h: "The beta-VAE: one extra number", b: R`<div class="eq">$$L_\beta = \text{Reconstruction loss} + \beta \cdot D_{\mathrm{KL}}\big(q_\phi(z \mid x) \,\|\, \mathcal{N}(0, I)\big)$$</div>
          <ul><li><b>$\beta = 1$</b>: the ordinary VAE. It may still store mixed information in each latent if that helps rebuilding, so it does <b>not guarantee</b> disentanglement.</li><li><b>$\beta > 1$</b>: a stronger pull towards $\mathcal{N}(0, I)$ (each $\mu \approx 0$, $\sigma^2 \approx 1$). Each latent can carry less information, which encourages independent, disentangled features.</li><li><b>The cost</b>: bigger $\beta$ → blurrier rebuilds, and possibly <b>posterior collapse</b> (some latents ignored).</li><li><b>$\beta \lt 1$</b>: sharper rebuilds, weaker pull, more entanglement.</li></ul>
          <div class="steps"><ol><li>Reconstruction $3.0$, KL $0.8$, $\beta = 4$.</li><li>$L_\beta = 3.0 + 4 \times 0.8 = 6.2$.</li></ol></div>`, w: "betavae",
          ask: { q: R`Increasing $\beta$ in a $\beta$-VAE generally:`, o: ["Makes reconstructions sharper", "Encourages disentanglement at the cost of reconstruction quality", "Removes the KL term", "Makes the model discriminative"], a: 1, x: R`That is the central $\beta$-VAE trade-off.` } },
        { h: "Why a big beta pushes towards disentanglement (slide numbers)", b: R`<p>If every $\sigma^2 = 1$, the KL formula $\frac{1}{2}\sum(\mu^2 + \sigma^2 - \log\sigma^2 - 1)$ shrinks to $\frac{1}{2}\sum \mu^2$. Codes far from 0 cost more:</p>
          <div class="steps"><ol><li>Disentangled, $\mu = [0.4, 0.2]$: $\frac{1}{2}(0.16 + 0.04) = 0.10$ (close to the prior).</li><li>Entangled, $\mu = [0.8, 0.6]$: $\frac{1}{2}(0.64 + 0.36) = 0.50$.</li><li>$\mu = [1.5, 0.5]$: $\frac{1}{2}(2.25 + 0.25) = 1.25$: uses more “capacity”, farther from the prior.</li></ol></div>
          <p>Multiplying these costs by $\beta > 1$ makes the model stingy: it keeps only the information it really needs, one clean factor per latent.</p>
          <p><b>Too few latents for too many features</b> (say 6 features: hair, lighting, skin tone, smile, pose, background, but only 3 latents): either they get mixed (entangled, better rebuilds, bigger KL) or, with a high $\beta$, some features are dropped (worse rebuilds). Fixes: <b>more latents</b>, a <b>moderate $\beta$</b>, or <b>$\beta$ annealing</b>: start $\beta$ at 0 or small so the model first learns to rebuild, then raise it step by step (e.g. $1 \to 2 \to 4$).</p>` },
        { h: "Latent traversals: how you check", b: R`<p>Encode one image. Then change <b>only one</b> latent number across a range (say $-3$ to $+3$), keep the others fixed, and decode each step. Lay the pictures in a row.</p>
          <ul><li>Disentangled: the row changes along <b>one</b> feature (only the smile grows).</li><li>Entangled: several things change at once.</li></ul>
          <p>The hands-on session draws exactly these traversals for a VAE and a $\beta$-VAE.</p>`, f: ["traversalFig", R`A latent traversal: only $z_4$ changes along the row, and only the smile changes in the faces.`] }
      ],
      keys: ["Disentangled: each latent number ↔ one independent feature.", R`$\beta$-VAE loss = reconstruction $+\ \beta \cdot$ KL; $\beta = 1$ is the plain VAE.`, R`$\beta > 1$ → more disentanglement, blurrier rebuilds; too large → posterior collapse.`, R`With $\sigma^2 = 1$, KL $= \frac{1}{2}\sum\mu^2$.`, "Latent traversal: vary one latent, keep the others fixed, decode.", R`Fixes for too few latents: more latents, moderate $\beta$, $\beta$ annealing.`],
      traps: [R`$\beta$ multiplies the KL term, not the reconstruction term.`, "Disentanglement does not mean better reconstruction; usually it means worse.", R`$\beta \lt 1$ weakens the pull towards the prior.`],
      quiz: [
        { q: R`The $\beta$-VAE objective changes the standard VAE loss by:`, o: [R`Multiplying the reconstruction term by $\beta$`, R`Multiplying the KL term by $\beta$`, "Adding a discriminator", "Removing the encoder"], a: 1, x: R`$L = \text{recon} + \beta \cdot \text{KL}$.`, r: 1 },
        { q: "A latent space in which each dimension controls exactly one feature is called:", o: ["Entangled", "Disentangled", "Overcomplete", "Collapsed"], a: 1, x: "Disentangled features are independent and interpretable.", r: 0 },
        { q: R`Which are effects of setting $\beta$ much larger than 1? (Select all that apply)`, o: [R`Stronger pull towards the prior $\mathcal{N}(0, I)$`, "More disentangled latent features", "Sharper reconstructions", "Higher risk of some latents being ignored (posterior collapse)"], a: [0, 1, 3], x: "Reconstructions become blurrier, not sharper.", r: 1 },
        { q: R`Reconstruction loss $3.0$, KL $0.8$, $\beta = 4$. The $\beta$-VAE loss is:`, a: { n: 6.2, tol: 0.001 }, x: R`$3.0 + 4 \times 0.8 = 6.2$.`, r: 1 },
        { q: "To check visually whether latent dimension 3 is disentangled, you:", o: ["Retrain with a different seed", R`Vary only $z_3$ across a range, keep the other dimensions fixed, and decode`, "Increase the batch size", "Compute the accuracy of a classifier"], a: 1, x: "This is a latent traversal.", r: 3 },
        { q: R`With $\sigma^2 = 1$ in every latent dimension, the KL term becomes $\frac{1}{2}\sum\mu^2$. For $\mu = [0.8, 0.6]$, the KL is:`, a: { n: 0.5, tol: 0.001 }, x: R`$\frac{1}{2}(0.64 + 0.36) = 0.5$, compared with $0.10$ for $\mu = [0.4, 0.2]$.`, r: 2 },
        { q: R`$\beta$ annealing means:`, o: [R`Fixing $\beta = 10$ from the start`, R`Starting with $\beta$ at 0 or small so rebuilding is learned first, then gradually increasing it`, R`Decreasing $\beta$ to 0 at the end of training`, "Removing the KL term"], a: 1, x: "The KL pull is switched on only after the model can rebuild.", r: 2 },
        { q: "An image has 6 important features but the VAE has only 3 latent numbers. Which fixes does the course suggest? (Select all that apply)", o: ["Increase the latent size", R`Use a moderate $\beta$ instead of a very high one`, R`Use $\beta$ annealing`, "Remove the decoder"], a: [0, 1, 2], x: "All three balance rebuilding against disentanglement.", r: 2 }
      ]
    },
    {
      id: "w4t2", title: "Conditional VAE: generate what you ask for", lec: [27, 29], min: 12,
      hook: R`Your trained digit VAE draws lovely digits, but you cannot ask it for a 7: it gives a random digit every time. What is the smallest change that lets you choose?`,
      reveal: R`<p>Tell the network the label. Stick a one-hot label $c$ onto the encoder's input <i>and</i> onto the decoder's input $z$. That is the <b>conditional VAE</b> (cVAE): to generate, pick $c = 7$, sample $z \sim \mathcal{N}(0, I)$ and decode $[z, c]$.</p>`,
      cards: [
        { h: "How it is built", b: R`<div class="eq">$$\text{Encoder: } q_\phi(z \mid x, c) \qquad \text{Decoder: } p_\theta(x \mid z, c) \qquad \text{Prior: } p(z) = \mathcal{N}(0, I)$$</div>
          <ul><li>The condition $c$ can be a one-hot class label, a list of attributes (glasses yes/no), text, or another image.</li><li>In code: <b>concatenate</b> (join end to end) $c$ to $x$ before the encoder, and $c$ to $z$ before the decoder.</li><li>Since the decoder is <i>told</i> the class, the latent $z$ no longer needs to store it. $z$ is free to capture <b>style</b>: stroke thickness, slant, size.</li></ul>`, f: ["cvaeArch", "A conditional VAE: the label c is joined to the input of both the encoder and the decoder."] },
        { h: "Loss and generation", b: R`<div class="eq">$$L_{\text{cVAE}} = -\mathbb{E}_{q(z \mid x, c)}\big[\log p(x \mid z, c)\big] + D_{\mathrm{KL}}\big(q(z \mid x, c) \,\|\, p(z)\big)$$</div>
          <p>The same two parts as the VAE (rebuild + stay near the prior), with everything also told $c$. Sampling still uses the reparameterisation trick: $z = \mu_\phi(x, c) + \sigma_\phi(x, c) \odot \varepsilon$.</p>
          <p><b>To generate</b>: choose $c$, sample $z \sim \mathcal{N}(0, I)$, decode $[z, c]$. The encoder is not needed.</p>
          <p><b>Style transfer for free</b>: keep $z$ fixed and change $c$ to get <b>the same handwriting style</b> drawn as different digits.</p>`,
          ask: { q: R`In a cVAE, where is the condition $c$ fed in?`, o: ["Only the encoder", "Only the decoder", "Both encoder and decoder", "Only the loss"], a: 2, x: R`Both: $q(z \mid x, c)$ and $p(x \mid z, c)$.` } },
        { h: "Lecture 27's numbers: what the label changes", b: R`<div class="steps"><ol><li>VAE encoder input $x = [5.1, 3.5, 1.4, 0.2]$. cVAE input $[x, y]$ with $y = [1, 0]$: $[5.1, 3.5, 1.4, 0.2, 1, 0]$ (4 + 2 = 6 numbers).</li><li>Encoder hidden layer: VAE $[1.07, 1.93, 0.87]$ → cVAE $[1.27, 1.83, 1.17]$. The label adds its own weighted contribution.</li><li>Decoder input $[z, y] = [0.917, 0.153, 1, 0]$.</li><li>Reconstruction: VAE $[0.103, -0.028, 0.206, 0.243]$ → cVAE $[0.147, -0.047, 0.280, 0.337]$. The label changes the decoder's hidden layer, and so the output.</li></ol></div>
          <p>For MNIST: a 784-pixel image plus a 10-class one-hot label gives an encoder input of $784 + 10 = 794$ numbers.</p>` },
        { h: "Where conditional generation is used", b: R`<ul><li>Choosing which digit or face to generate.</li><li>Editing one attribute (glasses on/off).</li><li>Predicting several possible futures (the next video frames given the past).</li><li>Making extra examples of a rare class (data augmentation).</li></ul><p>The same trick, joining a label to the input, returns in conditional GANs (Week 6) and text-guided diffusion (Week 8).</p>` }
      ],
      keys: [R`cVAE: encoder $q(z \mid x, c)$, decoder $p(x \mid z, c)$; $c$ is usually one-hot and concatenated.`, R`Loss = reconstruction + $D_{\mathrm{KL}}(q(z \mid x, c) \,\|\, p(z))$.`, R`Generation: choose $c$, sample $z \sim \mathcal{N}(0, I)$, decode $[z, c]$.`, R`With the class supplied, $z$ captures style; fix $z$ and change $c$ to keep the style.`, R`Input size grows by the size of $c$: $784 + 10 = 794$.`],
      traps: [R`The decoder must receive $c$, or you cannot control the output.`, "The encoder is not used at generation time.", R`Conditioning on $c$ does not remove the KL term.`],
      quiz: [
        { q: "In a conditional VAE for MNIST with a 10-class one-hot label and a 784-pixel image, the encoder input has how many numbers?", a: { n: 794, tol: 0 }, x: R`$784 + 10 = 794$ after concatenation.`, r: 2 },
        { q: "To generate a specific digit with a trained cVAE you:", o: ["Encode a random image", R`Sample $z \sim \mathcal{N}(0, I)$, set $c$ to the wanted one-hot label, and decode $[z, c]$`, "Train a new model per digit", R`Set $z$ to the label`], a: 1, x: R`The label steers the decoder; $z$ supplies the style.`, r: 1 },
        { q: R`Keeping $z$ fixed and changing only $c$ in a well-trained cVAE generally produces:`, o: ["Identical images", "The same writing style across different digits", "Random noise", "The same digit with different styles"], a: 1, x: R`$z$ stores style once $c$ provides the class.`, r: 1 },
        { q: "Which statements are true about the cVAE? (Select all that apply)", o: [R`Its decoder models $p(x \mid z, c)$`, "Its loss has a reconstruction term and a KL term", "It no longer needs the reparameterisation trick", "The condition can be a class label or an attribute list"], a: [0, 1, 3], x: R`Sampling $z$ still needs the reparameterisation trick.`, r: 1 },
        { q: R`In Lecture 27, the input $x = [5.1, 3.5, 1.4, 0.2]$ with label $y = [1, 0]$. How many numbers go into the cVAE encoder?`, a: { n: 6, tol: 0 }, x: R`$[x, y] = [5.1, 3.5, 1.4, 0.2, 1, 0]$: $4 + 2 = 6$.`, r: 2 },
        { q: R`In Lecture 27's example, the cVAE decoder input $[z, y]$ with $z = [0.917, 0.153]$ and $y = [1, 0]$ is:`, o: [R`$[0.917, 0.153]$`, R`$[0.917, 0.153, 1, 0]$`, R`$[1, 0]$`, R`$[1.917, 0.153]$`], a: 1, x: "The condition is joined onto the end of the latent vector.", r: 2 }
      ]
    },
    {
      id: "w4t3", title: "Latent space interpolation", lec: [28], min: 13,
      hook: R`Average a photo of a cat and a photo of a dog pixel by pixel and you get a ghostly double exposure. Average their VAE codes and decode, and you can get a believable cat-dog in between. Why does one work and not the other?`,
      reveal: R`<p>Real images occupy only a thin, curved “sheet” (a <b>manifold</b>) inside the space of all pixel grids. The straight line between two pixel grids leaves that sheet, giving ghosting. The VAE's latent space is smooth and gap-free (thanks to the KL term), so the straight line between two codes stays where every point decodes to a realistic image.</p>`,
      cards: [
        { h: "Linear interpolation", b: R`<div class="eq">$$z(\alpha) = (1 - \alpha)\, z_1 + \alpha\, z_2, \qquad \alpha \in [0, 1], \qquad x(\alpha) = \text{Decoder}\big(z(\alpha)\big)$$</div>
          <p>$z_1$ and $z_2$ are the codes (usually the means $\mu$) of two inputs. $\alpha = 0$ gives the first, $\alpha = 1$ the second, $\alpha = 0.5$ the halfway point. Decoding a sequence of $\alpha$ values gives a smooth morph.</p>
          <div class="steps"><ol><li>$z_1 = [0, 4]$, $z_2 = [2, 0]$, $\alpha = 0.25$.</li><li>$0.75 \times [0, 4] + 0.25 \times [2, 0] = [0, 3] + [0.5, 0] = [0.5, 3]$.</li></ol></div>`, w: "interp" },
        { h: "Lecture 28's worked example: digit 3 → digit 8", b: R`<p>$z_A = [0.764, 0.318]$ (image A, a 3) and $z_B = [-0.200, 1.100]$ (image B, an 8).</p>
          <div class="tablewrap"><table><tr><th>$\alpha$</th><th>$z_\alpha = (1-\alpha)z_A + \alpha z_B$</th><th>decodes to</th></tr><tr><td>0</td><td>$[0.764, 0.318]$</td><td>3</td></tr><tr><td>0.25</td><td>$[0.523, 0.514]$</td><td>3-like</td></tr><tr><td>0.5</td><td>$[0.282, 0.709]$</td><td>3/8 mix</td></tr><tr><td>0.75</td><td>$[0.041, 0.9045]$</td><td>8-like</td></tr><tr><td>1</td><td>$[-0.200, 1.100]$</td><td>8</td></tr></table></div>
          <p>First entry at $\alpha = 0.25$: $0.75 \times 0.764 + 0.25 \times (-0.200) = 0.573 - 0.050 = 0.523$.</p>` },
        { h: "Why VAEs interpolate well and plain AEs do not", b: R`<ul><li>Plain AE: codes sit in scattered islands with gaps; the halfway point may decode to garbage.</li><li>VAE: the KL term makes every code a cloud that overlaps its neighbours around $\mathcal{N}(0, I)$, so the space is <b>continuous</b> (nearby codes decode to similar images) and <b>complete</b> (every point decodes to something meaningful).</li></ul>
          <p>Uses: seeing what the model learned, smooth morphing, generating in-between data, and <b>latent arithmetic</b>: $z_{\text{smiling woman}} - z_{\text{neutral woman}} + z_{\text{neutral man}}$ decodes to a smiling man.</p>`, f: ["interpFig", "Pixel averaging overlaps two pictures; latent averaging decodes a single in-between picture."],
          ask: { q: R`With $z_1 = [0, 4]$ and $z_2 = [2, 0]$, the linear interpolation at $\alpha = 0.25$ is:`, o: [R`$[0.5, 3]$`, R`$[1, 2]$`, R`$[1.5, 1]$`, R`$[0.25, 0.25]$`], a: 0, x: R`$0.75 \times [0, 4] + 0.25 \times [2, 0] = [0.5, 3]$.` } },
        { h: "Spherical interpolation (slerp)", b: R`<p>A surprising fact about many-dimensional bell curves: samples from $\mathcal{N}(0, I)$ in $d$ dimensions almost all sit near a “shell” at distance about $\sqrt{d}$ from the centre. The straight-line midpoint of two such codes is closer to the centre than normal, so it is an unusual code.</p>
          <p><b>Slerp</b> (spherical linear interpolation) walks along the curved shell instead:</p>
          <div class="eq">$$\text{slerp}(z_1, z_2; \alpha) = \frac{\sin\big((1-\alpha)\Omega\big)}{\sin\Omega}\, z_1 + \frac{\sin(\alpha\Omega)}{\sin\Omega}\, z_2, \qquad \cos\Omega = \frac{z_1 \cdot z_2}{\|z_1\|\,\|z_2\|}$$</div>
          <p>$\Omega$ (“omega”) is the angle between the two codes, from Week 0's cosine similarity.</p>` }
      ],
      keys: [R`$z(\alpha) = (1-\alpha)z_1 + \alpha z_2$, then decode.`, "VAE latent spaces are continuous and complete thanks to the KL term; plain AEs are not.", "Pixel-space averaging gives ghosting because it leaves the realistic-image “sheet” (manifold).", "Slerp keeps in-between codes at a typical distance from the centre in high dimensions."],
      traps: [R`$\alpha = 0$ returns $z_1$, not $z_2$ (with this formula).`, "Interpolate the latent codes, not the reconstructions.", "A smooth morph shows a well-organised latent space, not necessarily disentanglement."],
      quiz: [
        { q: R`$z_1 = [1, 3]$ and $z_2 = [5, -1]$. Compute the first entry of $z(\alpha)$ at $\alpha = 0.75$.`, a: { n: 4, tol: 0.001 }, x: R`$0.25 \times 1 + 0.75 \times 5 = 0.25 + 3.75 = 4$.`, r: 0 },
        { q: "Why does interpolating directly in pixel space usually look unnatural?", o: ["Pixels are whole numbers", "The straight line between two images leaves the set of realistic images, giving ghosting", "Decoders cannot process pixels", "It is too slow"], a: 1, x: "Averages of real images are generally not realistic images.", r: 2 },
        { q: "Which property of the VAE latent space makes interpolation meaningful?", o: ["It is discrete", "It is continuous and filled in near the prior thanks to the KL term", "It is overcomplete", "It is the same as pixel space"], a: 1, x: "Overlapping clouds leave no gaps.", r: 2 },
        { q: "Spherical interpolation (slerp) is preferred in high-dimensional Gaussian latent spaces because:", o: ["It is cheaper", "It keeps in-between codes at a typical distance instead of cutting through the unusual centre", "It avoids the decoder", "It only works for 2-D latents"], a: 1, x: "Gaussian samples cluster on a shell; straight-line midpoints fall inside it.", r: 3 },
        { q: R`$z_A = [0.764, 0.318]$, $z_B = [-0.200, 1.100]$. Second entry of $z$ at $\alpha = 0.5$ (3 decimals):`, a: { n: 0.709, tol: 0.001 }, x: R`$0.5 \times 0.318 + 0.5 \times 1.100 = 0.159 + 0.550 = 0.709$.`, r: 1 }
      ]
    }
  ],
  test: [
    { q: R`In a $\beta$-VAE with $\beta > 1$, compared with a standard VAE, reconstructions are typically:`, o: ["Sharper", "Blurrier", "Identical", "Always perfect"], a: 1, x: "More weight on KL leaves less room for rebuilding detail.", t: "w4t1", r: 1 },
    { q: R`Which member of the $\beta$-VAE family is the standard VAE?`, o: [R`$\beta = 0$`, R`$\beta = 1$`, R`$\beta = 10$`, R`$\beta = -1$`], a: 1, x: R`$\beta = 1$ gives the ordinary ELBO.`, t: "w4t1", r: 1 },
    { q: "A model where changing one latent number only rotates the generated object, leaving size and colour unchanged, has:", o: ["An entangled representation", "A disentangled representation", "Posterior collapse", "Mode collapse"], a: 1, x: "One latent ↔ one feature.", t: "w4t1", r: 0 },
    { q: R`Compute the $\beta$-VAE loss for reconstruction $= 1.2$, KL $= 0.5$, $\beta = 2$.`, a: { n: 2.2, tol: 0.001 }, x: R`$1.2 + 2 \times 0.5 = 2.2$.`, t: "w4t1", r: 1 },
    { q: "In a conditional VAE, the decoder models:", o: [R`$p(x)$`, R`$p(x \mid z)$`, R`$p(x \mid z, c)$`, R`$p(c \mid x)$`], a: 2, x: "Both the latent code and the condition feed the decoder.", t: "w4t2", r: 0 },
    { q: "Which statements are true for a cVAE trained on MNIST with one-hot labels? (Select all that apply)", o: ["The label is joined to the encoder input", "The label is joined to the latent vector before decoding", "At generation time the encoder must be run on a real image", R`$z$ tends to capture style such as slant and thickness`], a: [0, 1, 3], x: R`Generation only needs the decoder: sample $z$ and choose $c$.`, t: "w4t2", r: 1 },
    { q: R`Linear interpolation $z(\alpha) = (1-\alpha)z_1 + \alpha z_2$ with $z_1 = 2$, $z_2 = 10$, $\alpha = 0.5$ gives:`, a: { n: 6, tol: 0.001 }, x: R`$0.5 \times 2 + 0.5 \times 10 = 6$.`, t: "w4t3", r: 0 },
    { q: "Smooth, realistic morphs when decoding interpolated codes show that the latent space is:", o: ["Discrete", "Continuous and well organised", "Entangled", "Overfitted"], a: 1, x: "Nearby codes decode to similar, valid images.", t: "w4t3", r: 2 },
    { q: R`Latent arithmetic $z_{\text{smiling woman}} - z_{\text{neutral woman}} + z_{\text{neutral man}}$ is expected to decode to:`, o: ["A neutral man", "A smiling man", "A smiling woman", "Noise"], a: 1, x: "The difference captures “smile”, which is added to the neutral man.", t: "w4t3", r: 2 },
    { q: R`In the $\beta$-VAE hands-on, what is plotted to compare the disentanglement of a VAE and a $\beta$-VAE?`, o: ["Confusion matrices", "Latent traversals: images decoded while varying one latent dimension", "ROC curves", "Training time"], a: 1, x: "Traversals show whether each latent controls a single feature.", t: "w4t1", r: 3 },
    { q: R`Using Lecture 28's points $z_A = [0.764, 0.318]$ and $z_B = [-0.200, 1.100]$, the first entry of $z$ at $\alpha = 0.25$ is (3 decimals):`, a: { n: 0.523, tol: 0.001 }, x: R`$0.75 \times 0.764 + 0.25 \times (-0.200) = 0.573 - 0.050 = 0.523$.`, t: "w4t3", r: 1 },
    { q: R`Why does a standard VAE ($\beta = 1$) not guarantee a disentangled latent space?`, o: ["It has no KL term", "With KL weight 1 the model may still store mixed information across latents if that helps rebuilding", "It uses a discriminator", "Its latent space is discrete"], a: 1, x: R`$\beta > 1$ adds pressure towards the factorised prior.`, t: "w4t1", r: 1 }
  ]
});

COURSE.glossary.push(
  ["disentangled", R`A latent space where each number controls one independent feature (like smile, or pose).`, ["disentanglement"]],
  ["entangled", R`A latent space where one number controls several features at once.`, ["entanglement"]],
  ["beta-VAE", R`A VAE whose KL term is multiplied by $\beta > 1$ to encourage disentangled latents.`],
  ["latent traversal", R`Changing one latent number step by step (others fixed) and decoding each step, to see what it controls.`, ["latent traversals", "traversal", "traversals"]],
  ["beta annealing", R`Starting training with a small $\beta$ and raising it gradually.`],
  ["conditional VAE", R`A VAE that is also given a label or condition $c$, so you can ask for a particular kind of output. Abbreviated cVAE.`, ["cVAE"]],
  ["concatenate", R`Join two lists end to end: $[1, 2]$ and $[3]$ become $[1, 2, 3]$.`, ["concatenated", "concatenation", "concatenating"]],
  ["interpolation", R`Moving smoothly between two points, e.g. $z(\alpha) = (1-\alpha)z_1 + \alpha z_2$.`, ["interpolate", "interpolating"]],
  ["manifold", R`The thin, curved “sheet” inside a huge space where all realistic examples live.`],
  ["slerp", R`Spherical linear interpolation: moving between two codes along a curved arc instead of a straight line.`],
  ["latent arithmetic", R`Adding and subtracting latent codes to transfer a feature, e.g. smiling minus neutral plus another face.`]
);
