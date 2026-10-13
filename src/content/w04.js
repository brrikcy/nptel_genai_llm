COURSE.weeks.push({
  id: "w4", n: 4, title: "Advanced VAEs",
  tagline: "Disentanglement & β-VAE, conditional VAE, latent interpolation.",
  intro: "With a working VAE, this week asks how to make its latent space interpretable (β-VAE), how to control what it generates (conditional VAE), and how to move smoothly through it (interpolation). The hands-on sessions implement a VAE, a cVAE and a β-VAE. Lectures 25–30.",
  topics: [
    {
      id: "w4t1", title: "Disentangled latents and the β-VAE", lec: [26, 30], min: 17, w: "betavae",
      hook: "You have a face generator with 32 latent knobs. You turn knob 7 hoping to add a smile, and the face smiles, ages ten years and turns its head. What has gone wrong inside the latent space?",
      reveal: "<p>The latent space is <b>entangled</b>: one knob controls a mixture of factors. A <b>disentangled</b> space gives each independent factor of variation (smile, age, pose) its own knob. The β-VAE gets closer to this by weighting the KL term more heavily, at a price.</p>",
      cards: [
        { h: "Entangled vs disentangled", b: `<ul><li><b>Entangled</b>: changing one latent dimension changes several visual factors together. Hard to interpret or control.</li><li><b>Disentangled</b>: each latent dimension captures one independent generative factor (position, scale, rotation, colour, smile) and is relatively invariant to the others.</li></ul>
          <p>Why it helps: interpretability, controllable generation (edit one attribute), better transfer to downstream tasks and fairness auditing.</p>` },
        { h: "β-VAE: one extra coefficient", b: `<div class="eq">L_β = Reconstruction loss + β · KL(q_φ(z | x) ‖ N(0, I))</div>
          <ul><li><b>β = 1</b>: the standard VAE.</li><li><b>β > 1</b>: a stronger pull towards the factorised (isotropic) prior. That limits the information capacity of each latent dimension and encourages statistically independent, disentangled factors.</li><li><b>Trade-off</b>: larger β means blurrier reconstructions and possibly posterior collapse (some latents ignored).</li><li><b>β &lt; 1</b>: better reconstructions, weaker regularisation, more entanglement.</li></ul>`, w: "betavae",
          ask: { q: "Increasing β in a β-VAE generally:", o: ["Improves reconstruction sharpness", "Encourages disentanglement at the cost of reconstruction quality", "Removes the KL term", "Makes the model discriminative"], a: 1, x: "That is the central β-VAE trade-off." } },
        { h: "Latent traversals: how you check disentanglement", b: `<p>Encode an image, then vary <b>one</b> latent dimension across a range (−3 … +3) while keeping the others fixed, and decode each step. In a disentangled model the row of images changes along a single factor. The hands-on session plots exactly these traversals for VAE and β-VAE.</p>` }
      ],
      keys: ["Disentangled: each latent dimension ↔ one independent factor of variation.", "β-VAE loss = recon + β·KL; β = 1 is the plain VAE.", "β > 1 → more disentanglement, blurrier reconstructions; too large → posterior collapse.", "Latent traversal: vary one dimension, keep the others fixed, decode."],
      traps: ["β multiplies the KL term, not the reconstruction term.", "Disentanglement does not mean better reconstruction; it usually means worse.", "β < 1 weakens the regulariser."],
      quiz: [
        { q: "The β-VAE objective modifies the standard VAE loss by:", o: ["Multiplying the reconstruction term by β", "Multiplying the KL term by β", "Adding a discriminator", "Removing the encoder"], a: 1, x: "L = recon + β·KL.", r: 1 },
        { q: "A latent space in which each dimension controls exactly one generative factor is called:", o: ["Entangled", "Disentangled", "Overcomplete", "Collapsed"], a: 1, x: "Disentangled factors are independent and interpretable.", r: 0 },
        { q: "Which are effects of setting β much larger than 1? (Select all that apply)", o: ["Stronger pressure towards the factorised prior", "More disentangled latent factors", "Sharper reconstructions", "Higher risk of some latents being ignored (posterior collapse)"], a: [0, 1, 3], x: "Reconstructions become blurrier, not sharper.", r: 1 },
        { q: "Reconstruction loss 3.0, KL 0.8, β = 4. The β-VAE loss is:", a: { n: 6.2, tol: 0.001 }, x: "3.0 + 4 × 0.8 = 6.2.", r: 1 },
        { q: "To visually check whether latent dimension 3 is disentangled, you:", o: ["Retrain with a different seed", "Vary only z₃ across a range, fix the other dimensions, and decode", "Increase the batch size", "Compute the accuracy of a classifier"], a: 1, x: "This is a latent traversal.", r: 2 }
      ]
    },
    {
      id: "w4t2", title: "Conditional VAE: generate what you ask for", lec: [27, 29], min: 14,
      hook: "Your trained MNIST VAE generates beautiful digits, but you can't ask it for a 7: it gives a random digit each time. What is the smallest change to the architecture that lets you choose the class?",
      reveal: "<p>Feed the label to the network. Concatenate a one-hot label <b>c</b> to the encoder's input <i>and</i> to the decoder's input z. That is the <b>conditional VAE</b>: at generation time, pick c = 7, sample z ~ N(0, I) and decode [z, c].</p>",
      cards: [
        { h: "Architecture", b: `<div class="eq">Encoder: q_φ(z | x, c)        Decoder: p_θ(x | z, c)        Prior: p(z) (often N(0, I), can also depend on c)</div>
          <ul><li>Condition c: a one-hot class label, an attribute vector, text, or another image.</li><li>Implementation: concatenate c to x before the encoder, and to z before the decoder.</li><li>Because the decoder already knows c, the latent z is free to capture <b>style</b> (stroke thickness, slant) instead of class identity.</li></ul>` },
        { h: "cVAE loss", b: `<div class="eq">L_cVAE = −E_{q(z|x,c)}[log p(x | z, c)] + KL(q(z | x, c) ‖ p(z | c))</div><p>The same two terms as the VAE, now everything is conditioned on c. Numerically identical to the VAE example, except the input vector is longer by the size of c.</p>
          <p>Generation: choose c, sample z ~ N(0, I), decode [z ; c]. Keep z fixed and change c to get <b>the same handwriting style rendered as different digits</b>.</p>`,
          ask: { q: "In a cVAE, where is the condition c fed in?", o: ["Only the encoder", "Only the decoder", "Both encoder and decoder", "Only the loss"], a: 2, x: "Both: q(z|x, c) and p(x|z, c)." } },
        { h: "Where conditional generation is used", b: `<ul><li>Class-controlled digit or face generation.</li><li>Attribute editing (glasses on/off).</li><li>Structured prediction, e.g. predicting several plausible future frames given the past.</li><li>Data augmentation for minority classes.</li></ul><p>The same idea of conditioning by concatenating a label returns in conditional GANs (Week 6) and in text-conditioned diffusion (Week 8).</p>` }
      ],
      keys: ["cVAE: encoder q(z|x, c), decoder p(x|z, c); c is usually one-hot and concatenated.", "Loss = reconstruction + KL(q(z|x,c) ‖ p(z|c)).", "Generation: choose c, sample z ~ N(0, I), decode [z, c].", "With the class supplied, z captures style; fix z and vary c to keep the style."],
      traps: ["The decoder must receive c, or you cannot control the output at generation time.", "The encoder is not used at generation time.", "Conditioning on c does not remove the KL term."],
      quiz: [
        { q: "In a conditional VAE for MNIST with a 10-class one-hot label and a 784-pixel image, the encoder input has dimension:", a: { n: 794, tol: 0 }, x: "784 + 10 = 794 after concatenation.", r: 0 },
        { q: "To generate a specific digit with a trained cVAE you:", o: ["Encode a random image", "Sample z ~ N(0, I), set c to the desired one-hot label, and decode [z, c]", "Train a new model per digit", "Set z to the label"], a: 1, x: "The label steers the decoder; z supplies the style.", r: 1 },
        { q: "Keeping z fixed and changing only c in a well-trained cVAE generally produces:", o: ["Identical images", "The same writing style across different digits", "Random noise", "The same digit with different styles"], a: 1, x: "z encodes style once class information is provided by c.", r: 1 },
        { q: "Which statements are true about the cVAE? (Select all that apply)", o: ["Its decoder models p(x | z, c)", "Its loss has a reconstruction term and a KL term", "It no longer needs the reparameterisation trick", "The condition can be a class label or an attribute vector"], a: [0, 1, 3], x: "Sampling z still needs the reparameterisation trick.", r: 0 }
      ]
    },
    {
      id: "w4t3", title: "Latent space interpolation", lec: [28], min: 12, w: "interp",
      hook: "Average a photo of a cat and a photo of a dog pixel by pixel and you get a ghostly double exposure. Average their VAE codes and decode, and you can get a plausible cat-dog in between. Why does one work and not the other?",
      reveal: "<p>Real images lie on a thin, curved <b>manifold</b> inside pixel space. The straight line between two pixel vectors leaves that manifold, giving ghosting. The VAE's latent space is smooth and continuous (thanks to the KL term), so the straight line between two codes stays in a region that decodes to realistic images.</p>",
      cards: [
        { h: "Linear interpolation", b: `<div class="eq">z(α) = (1 − α)·z₁ + α·z₂,   α ∈ [0, 1];   x(α) = Decoder(z(α))</div>
          <p>z₁, z₂ are the encodings (usually the means μ) of two inputs. α = 0 gives the first input, α = 1 the second, and α = 0.5 the midpoint. Decoding the sequence gives a smooth morph.</p>`, w: "interp" },
        { h: "Spherical interpolation (slerp)", b: `<p>In high dimensions, samples from N(0, I) concentrate near a shell of radius ≈ √d. The straight-line midpoint between two codes has a smaller norm, which is atypical for the prior. <b>Slerp</b> follows the great circle:</p><div class="eq">slerp(z₁, z₂; α) = sin((1−α)Ω)/sin Ω · z₁ + sin(αΩ)/sin Ω · z₂,   cos Ω = z₁·z₂ / (‖z₁‖‖z₂‖)</div>` },
        { h: "Why VAEs interpolate well and plain AEs don't", b: `<ul><li>Plain AE: codes are scattered with gaps; the midpoint may decode to garbage.</li><li>VAE: the KL term makes each q(z|x) a cloud that overlaps its neighbours around N(0, I), so the space is <b>continuous</b> (nearby points decode similarly) and <b>complete</b> (every point decodes to something meaningful).</li></ul>
          <p>Uses: visualising what the model learned, smooth image morphing, generating intermediate data, and latent arithmetic (z_smiling − z_neutral + z_other → add a smile).</p>`,
          ask: { q: "With z₁ = [0, 4] and z₂ = [2, 0], the linear interpolation at α = 0.25 is:", o: ["[0.5, 3]", "[1, 2]", "[1.5, 1]", "[0.25, 0.25]"], a: 0, x: "0.75·[0,4] + 0.25·[2,0] = [0.5, 3]." } }
      ],
      keys: ["z(α) = (1−α)z₁ + αz₂, then decode.", "VAE latent spaces are continuous and complete thanks to the KL regulariser; plain AEs are not.", "Pixel-space interpolation gives ghosting because it leaves the data manifold.", "Slerp keeps interpolants at a typical norm for a Gaussian prior in high dimensions."],
      traps: ["α = 0 returns z₁, not z₂ (with this formula).", "Interpolate the latent means, not the reconstructions.", "A smooth morph is evidence of a well-structured latent space, not of disentanglement."],
      quiz: [
        { q: "z₁ = [1, 3] and z₂ = [5, −1]. Compute the first component of z(α) at α = 0.75.", a: { n: 4, tol: 0.001 }, x: "0.25·1 + 0.75·5 = 0.25 + 3.75 = 4.", r: 0 },
        { q: "Why does interpolating directly in pixel space usually look unnatural?", o: ["Pixels are discrete", "The straight line between two images leaves the data manifold, giving ghosting", "Decoders cannot process pixels", "It is too slow"], a: 1, x: "Averages of real images are generally not realistic images.", r: 2 },
        { q: "Which property of the VAE latent space makes interpolation meaningful?", o: ["It is discrete", "It is continuous and densely filled near the prior thanks to the KL term", "It is overcomplete", "It is identical to pixel space"], a: 1, x: "Overlapping posterior clouds leave no gaps.", r: 2 },
        { q: "Spherical linear interpolation (slerp) is preferred in high-dimensional Gaussian latent spaces because:", o: ["It is cheaper", "It keeps interpolants at a typical norm instead of cutting through the low-density centre", "It avoids the decoder", "It works only for 2-D latents"], a: 1, x: "Gaussian mass concentrates on a shell; linear midpoints fall inside it.", r: 1 }
      ]
    }
  ],
  test: [
    { q: "In a β-VAE with β > 1, compared with a standard VAE, reconstructions are typically:", o: ["Sharper", "Blurrier", "Identical", "Always perfect"], a: 1, x: "More weight on KL means less capacity for reconstruction detail.", t: "w4t1", r: 1 },
    { q: "Which loss corresponds to a standard VAE in the β-VAE family?", o: ["β = 0", "β = 1", "β = 10", "β = −1"], a: 1, x: "β = 1 recovers the ordinary ELBO.", t: "w4t1", r: 1 },
    { q: "A model where changing one latent unit only rotates the generated object, leaving size and colour unchanged, has:", o: ["An entangled representation", "A disentangled representation", "Posterior collapse", "Mode collapse"], a: 1, x: "One unit ↔ one factor.", t: "w4t1", r: 0 },
    { q: "Compute the β-VAE loss for reconstruction = 1.2, KL = 0.5, β = 2.", a: { n: 2.2, tol: 0.001 }, x: "1.2 + 2·0.5 = 2.2.", t: "w4t1", r: 1 },
    { q: "In a conditional VAE, the decoder models:", o: ["p(x)", "p(x | z)", "p(x | z, c)", "p(c | x)"], a: 2, x: "Both the latent code and the condition feed the decoder.", t: "w4t2", r: 0 },
    { q: "Which statements are true for a cVAE trained on MNIST with one-hot labels? (Select all that apply)", o: ["The label is concatenated to the encoder input", "The label is concatenated to the latent vector before decoding", "At generation time the encoder must be run on a real image", "z tends to capture style such as slant and thickness"], a: [0, 1, 3], x: "Generation only needs the decoder: sample z and choose c.", t: "w4t2", r: 1 },
    { q: "Linear interpolation z(α) = (1−α)z₁ + αz₂ with z₁ = 2, z₂ = 10, α = 0.5 gives:", a: { n: 6, tol: 0.001 }, x: "0.5·2 + 0.5·10 = 6.", t: "w4t3", r: 0 },
    { q: "Smooth, realistic morphs when decoding interpolated codes indicate that the latent space is:", o: ["Discrete", "Continuous and well-structured", "Entangled", "Overfitted"], a: 1, x: "Nearby codes decode to similar, valid images.", t: "w4t3", r: 2 },
    { q: "Latent arithmetic such as z(smiling woman) − z(neutral woman) + z(neutral man) is expected to decode to:", o: ["A neutral man", "A smiling man", "A smiling woman", "Noise"], a: 1, x: "The difference vector captures 'smile' and is added to the neutral man.", t: "w4t3", r: 2 },
    { q: "In the β-VAE hands-on, what is plotted to compare the disentanglement of VAE and β-VAE?", o: ["Confusion matrices", "Latent traversals: images decoded while varying one latent dimension", "ROC curves", "Training time"], a: 1, x: "Traversals show whether each dimension controls a single factor.", t: "w4t1", r: 2 }
  ]
});
