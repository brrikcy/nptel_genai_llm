COURSE.weeks.push({
  id: "w5", n: 5, title: "Generative adversarial networks",
  tagline: "Generator vs discriminator, the min-max loss, Nash equilibrium, DCGAN.",
  intro: R`VAEs give blurry pictures. GANs drop the “rebuild the pixels” loss and replace it with a judge: a discriminator network that a generator network learns to fool. This week covers the set-up, the loss built step by step (exactly as in Lecture 33), how training ends and how it goes wrong, and DCGAN. Lectures 31–37.`,
  topics: [
    {
      id: "w5t1", title: "Why GANs? Two networks in a contest", lec: [31, 32], min: 17,
      hook: R`A forger paints fake banknotes; a bank inspector tries to catch them. Neither sees the other's methods, only whether the fakes were caught. If both keep improving, what do the fakes look like in the end?`,
      reveal: R`<p>Indistinguishable from real notes, and the inspector is reduced to guessing, right only 50% of the time. That is a GAN: the <b>generator</b> is the forger, the <b>discriminator</b> is the inspector, and training ends when $D(x) = \frac{1}{2}$ for every picture.</p>`,
      cards: [
        { h: "Six limits of VAEs (Lecture 31)", b: R`<ol><li><b>Gaussian assumption</b>: $q(z \mid x) = \mathcal{N}(\mu, \sigma^2)$ and $p(z) = \mathcal{N}(0, I)$ make training easy, but real data can be far more complicated.</li><li><b>Blurry images</b>: pixel-by-pixel MSE makes the decoder <i>average</i> all plausible answers when unsure, which wipes out sharp edges.</li><li><b>Rebuild vs KL tug-of-war</b>: rebuilding wants more information in $z$; KL wants $q(z \mid x) \approx \mathcal{N}(0, I)$. Improving one can hurt the other.</li><li><b>Posterior collapse</b>: if the KL pull is too strong, the encoder outputs $\mu \approx 0$, $\sigma \approx 1$ for <i>every</i> input; KL $\approx 0$ but $z$ says nothing about $x$.</li><li><b>A fixed likelihood shape</b>: the decoder must output a chosen distribution (Gaussian → MSE, Bernoulli → BCE). If that is too simple, samples look fake.</li><li><b>Missing fine detail</b>: the overall shape is fine, but sharp edges, textures and small facial details are lost.</li></ol>
          <div class="plain">The GAN's promise: create very realistic data <i>without</i> writing down a probability formula or a pixel-matching loss. Instead, one network judges the other.</div>`,
          ask: { q: "Why do VAE images often look blurry?", o: ["VAEs have too few layers", "Pixel-wise losses make the decoder average all plausible outputs", "VAEs use a discriminator", "VAEs only work on text"], a: 1, x: "Averaging many plausible sharp images gives one blurry image." } },
        { h: "The set-up: a forger and a detective", b: R`<ul><li>The <b>generator</b> $G$ takes random noise $z$ (e.g. from $\mathcal{N}(0, I)$) and turns it into a fake sample $x_{\text{fake}} = G(z)$, the same size as a real image. It <b>never sees real data</b>; it only learns from the discriminator's reactions.</li><li>The <b>discriminator</b> $D$ is a yes/no classifier with a sigmoid output. $D(x)$ is its probability that $x$ is <b>real</b>. Real images are labelled $y = 1$, generated ones $y = 0$.</li><li>Both are neural networks: plain dense networks in the original GAN, CNNs in DCGAN.</li></ul>
          <p>Notation: $\phi$ for the generator's weights, $\theta$ for the discriminator's, so you will see $G_\phi$ and $D_\theta$.</p>`, f: ["ganArch", "A GAN: noise goes into the generator; the discriminator judges real and fake images."] },
        { h: "Taking turns: how a GAN trains", b: R`<ol><li><b>Train D</b> (G frozen): show a batch of real images (label 1) and fakes $G(z)$ (label 0). Lower D's binary cross-entropy; update $\theta$.</li><li><b>Train G</b> (D frozen): make fakes, pass them through D, and change $\phi$ so that D calls them real. The gradient flows <i>through</i> D back into G, but only G's weights change.</li><li>Repeat. Often D gets $k$ steps for every G step.</li></ol>`, w: "ganrounds",
          ask: { q: "When the generator is updated, the discriminator's weights are:", o: ["Also updated", "Frozen", "Reset to random", "Doubled"], a: 1, x: "Gradients pass through D, but only G's weights change." } },
        { h: "Both training steps with numbers (Lecture 32)", b: R`<p><b>Generator step</b> (target $y = 1$, D frozen): $z \sim \mathcal{N}(0, I) \to x_{\text{fake}} = G_\phi(z) \to \hat{y} = D_\theta(x_{\text{fake}})$. BCE with $y = 1$ gives</p>
          <div class="eq">$$L_G = -\log D(G(z))$$</div>
          <div class="steps"><ol><li>If $D(G(z)) = 0.2$: $L_G = -\ln 0.2 \approx 1.609$. High, because D spots the fake.</li><li>Chain rule: $\frac{\partial L_G}{\partial \phi} = \frac{\partial L_G}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial x_{\text{fake}}} \cdot \frac{\partial x_{\text{fake}}}{\partial \phi}$; then $\phi \leftarrow \phi - \eta \frac{\partial L_G}{\partial \phi}$, while $\theta$ stays fixed.</li></ol></div>
          <p><b>Discriminator step</b> (G frozen):</p>
          <div class="eq">$$L_D = -\log D(x) - \log\big(1 - D(G(z))\big)$$</div>
          <div class="steps"><ol><li>Good D: $D(x) = 0.9$, $D(G(z)) = 0.2$ → $0.105 + 0.223 = 0.328$.</li><li>Poor D: $D(x) = 0.2$, $D(G(z)) = 0.8$ → $1.609 + 1.609 = 3.218$.</li></ol></div>` }
      ],
      keys: [R`G: noise $z$ → fake sample. D: sample → probability it is real (sigmoid).`, "Labels for D: real = 1, fake = 0.", "Training takes turns: update D with G frozen, then G with D frozen.", R`$L_G = -\log D(G(z))$; $L_D = -\log D(x) - \log(1 - D(G(z)))$.`, "GANs replace pixel losses with a learned judge, which gives sharper images than VAEs."],
      traps: ["G never sees real images; it learns only through D's gradients.", "D outputs the probability that the input is REAL.", "“Adversarial” means the two networks have opposite goals, not that inputs are malicious."],
      quiz: [
        { q: "The input to a GAN generator is:", o: ["A real image", R`A random noise vector $z$`, "The discriminator's output", "A class label only"], a: 1, x: R`$z$ is sampled from a simple distribution such as $\mathcal{N}(0, I)$.`, r: 1 },
        { q: "When training the discriminator, generated samples are labelled:", o: ["1", "0", "0.5", "With their class number"], a: 1, x: "Real = 1, fake = 0.", r: 1 },
        { q: "A key reason for GANs over VAEs is that VAE samples tend to be:", o: ["Too sharp", "Blurry", "Discrete", "Always identical"], a: 1, x: "Pixel-wise losses average over possibilities.", r: 0 },
        { q: "Which statements about GAN training are true? (Select all that apply)", o: ["D and G are updated in turns", "D is frozen while G is updated", "G receives gradients through D", "G is trained to lower D's accuracy on real images"], a: [0, 1, 2], x: "G cannot affect D's output on real images; it only tries to make D call its fakes real.", r: 2 },
        { q: "In VAE posterior collapse, the encoder outputs approximately:", o: [R`$\mu \approx x$, $\sigma \approx 0$`, R`$\mu \approx 0$, $\sigma \approx 1$ for every input, so $z$ says nothing about $x$`, R`Very large $\mu$`, "A different distribution for every pixel"], a: 1, x: R`KL $\approx 0$, but the code is useless.`, r: 0 },
        { q: R`During the generator update, $D(G(z)) = 0.2$. The generator loss $-\log D(G(z))$ is (natural log, 3 decimals):`, a: { n: 1.609, tol: 0.002 }, x: R`$-\ln 0.2 = 1.609$: high, because D confidently calls the fake fake.`, r: 3 },
        { q: R`A poorly trained discriminator gives $D(x) = 0.2$ on a real image and $D(G(z)) = 0.8$ on a fake. Compute $L_D$ (natural log, 3 decimals).`, a: { n: 3.219, tol: 0.003 }, x: R`$-\ln 0.2 - \ln(1 - 0.8) = 1.609 + 1.609 = 3.219$.`, r: 3 },
        { q: "Which are VAE limitations listed in the course? (Select all that apply)", o: ["Blurry outputs from pixel-wise averaging", "Posterior collapse", "A fixed (explicit) likelihood assumption", "Mode collapse caused by a discriminator"], a: [0, 1, 2], x: "VAEs have no discriminator; mode collapse is a GAN problem.", r: 0 }
      ]
    },
    {
      id: "w5t2", title: "The GAN objective, built step by step", lec: [33], min: 19,
      hook: R`The discriminator is just a yes/no classifier trained with binary cross-entropy. Start from BCE, put in $y = 1$ for real and $y = 0$ for fake, and you get the famous GAN equation. Try it before reading on.`,
      reveal: R`<p>$\text{BCE} = -[y\log\hat{y} + (1-y)\log(1-\hat{y})]$. Real ($y = 1$, $\hat{y} = D(x)$) leaves $-\log D(x)$. Fake ($y = 0$, $\hat{y} = D(G(z))$) leaves $-\log(1 - D(G(z)))$. Add them, flip the sign and average over many examples: $V(D, G) = \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1 - D(G(z)))]$. D pushes $V$ up; G pushes it down.</p>`,
      cards: [
        { h: "The discriminator's loss, from BCE", b: R`<div class="eq">$$\text{Real sample } (y = 1): \quad L_{\text{real}} = -\log D_\theta(x)$$</div>
          <div class="eq">$$\text{Fake sample } (y = 0): \quad L_{\text{fake}} = -\log\big(1 - D_\theta(G_\phi(z))\big)$$</div>
          <div class="eq">$$L_D = L_{\text{real}} + L_{\text{fake}} = -\Big[\log D(x) + \log\big(1 - D(G(z))\big)\Big]$$</div>
          <p>Making $L_D$ small is the same as making $V_D = \log D(x) + \log(1 - D(G(z)))$ <b>big</b>. Averaged over a batch it becomes an expected value:</p>
          <div class="eq">$$\max_\theta \; V(\theta; \phi) = \mathbb{E}_{x \sim p_{\text{data}}}\big[\log D_\theta(x)\big] + \mathbb{E}_{z \sim p_z}\big[\log\big(1 - D_\theta(G_\phi(z))\big)\big]$$</div>
          <p>The semicolon in $V(\theta; \phi)$ means: only $\theta$ is being changed; $\phi$ is held fixed.</p>
          <div class="steps"><ol><li>$D(x) = 0.9$, $D(G(z)) = 0.2$.</li><li>$L_D = -\ln 0.9 - \ln 0.8 = 0.105 + 0.223 = 0.329$.</li></ol></div>` },
        { h: "Why D pushes D(x) towards 1 and D(G(z)) towards 0", b: R`<div class="tablewrap"><table><tr><th>$D(x)$ on a real image</th><th>$\log D(x)$</th></tr><tr><td>0.1 (bad)</td><td>$-2.303$</td></tr><tr><td>0.5</td><td>$-0.693$</td></tr><tr><td>0.9 (good)</td><td>$-0.105$</td></tr><tr><td>1 (best)</td><td>$0$</td></tr></table></div>
          <p>$\log D(x)$ rises towards its largest value 0 as $D(x) \to 1$. In the same way $\log(1 - D(G(z)))$ is largest (→ 0) as $D(G(z)) \to 0$. So pushing $V$ up makes D say 1 for real and 0 for fake.</p>
          <div class="remember">Memorise: $\ln 0.1 = -2.303$, $\ln 0.5 = -0.693$, $\ln 0.9 = -0.105$.</div>`, w: "ganloss" },
        { h: "The generator's side, and the min-max game", b: R`<p>The first term $\mathbb{E}[\log D(x)]$ only involves real images, so the generator cannot change it. G only affects the second term and wants $D(G(z)) \to 1$, which drives $\log(1 - D(G(z))) \to -\infty$:</p>
          <div class="eq">$$\min_\phi \; \mathbb{E}_{z}\big[\log\big(1 - D_\theta(G_\phi(z))\big)\big]$$</div>
          <p>Put both players together and you get the GAN objective:</p>
          <div class="eq">$$\min_G \max_D \; V(D, G) = \mathbb{E}_{x \sim p_{\text{data}}}\big[\log D(x)\big] + \mathbb{E}_{z \sim p_z}\big[\log\big(1 - D(G(z))\big)\big]$$</div>
          <p><b>The non-saturating trick</b> (what code actually does): early on, D easily rejects fakes ($D(G(z)) \approx 0$), and $\log(1 - D(G(z)))$ is almost flat there, so G gets tiny gradients and learns nothing. Instead G <b>maximises $\log D(G(z))$</b>, i.e. minimises $-\log D(G(z))$, which is steep exactly when G is losing.</p>`, f: ["ganSaturate", "Near D(G(z)) = 0 the minimax loss is flat (tiny gradient) while the non-saturating loss is steep."],
          ask: { q: R`$D(G(z)) = 0.1$. What is $\log(1 - D(G(z)))$ (natural log)?`, o: [R`$-0.105$`, R`$-2.303$`, R`$-0.693$`, "0"], a: 0, x: R`$\ln 0.9 = -0.105$.` } }
      ],
      keys: [R`$L_D = -\log D(x) - \log(1 - D(G(z)))$, straight from BCE with $y = 1$ and $y = 0$.`, R`$V(D,G) = \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1 - D(G(z)))]$; D maximises, G minimises: $\min_G \max_D V$.`, R`D wants $D(x) \to 1$ and $D(G(z)) \to 0$; G wants $D(G(z)) \to 1$.`, "The first term does not depend on G.", R`Non-saturating generator loss: minimise $-\log D(G(z))$ for strong early gradients.`],
      traps: [R`$\ln 0.1 = -2.303$, $\ln 0.5 = -0.693$, $\ln 0.9 = -0.105$: memorise these.`, R`Minimising $-V$ is maximising $V$; watch the signs.`, "The original minimax generator loss gives almost no gradient early in training."],
      quiz: [
        { q: "Starting from BCE, the discriminator loss on a single real sample is:", o: [R`$-\log(1 - D(x))$`, R`$-\log D(x)$`, R`$\log D(x)$`, R`$-\log D(G(z))$`], a: 1, x: R`$y = 1$ removes the second BCE term, leaving $-\log D(x)$.`, r: 0 },
        { q: R`Compute $L_D = -\log D(x) - \log(1 - D(G(z)))$ for $D(x) = 0.9$ and $D(G(z)) = 0.2$ (natural logs, 3 decimals).`, a: { n: 0.329, tol: 0.003 }, x: R`$-\ln 0.9 - \ln 0.8 = 0.105 + 0.223 = 0.329$.`, r: 0 },
        { q: R`In $\min_G \max_D V(D, G)$, which term of $V$ can the generator change?`, o: [R`$\mathbb{E}[\log D(x)]$ only`, R`$\mathbb{E}[\log(1 - D(G(z)))]$ only`, "Both terms", "Neither"], a: 1, x: "Real data does not depend on G.", r: 2 },
        { q: R`Why is the non-saturating generator loss $-\log D(G(z))$ used in practice?`, o: ["It is symmetric", R`$\log(1 - D(G(z)))$ has very small gradients when D confidently rejects fakes early in training`, "It removes the need for a discriminator", "It makes D linear"], a: 1, x: R`$-\log D(G(z))$ is steep exactly when $D(G(z)) \approx 0$.`, r: 2 },
        { q: R`As $D(x)$ on real images rises from 0.1 to 0.9, the value $\log D(x)$:`, o: [R`Decreases from $-0.105$ to $-2.303$`, R`Increases from $-2.303$ to $-0.105$`, "Stays at 0", "Becomes positive"], a: 1, x: R`$\log$ is increasing; its maximum on $(0, 1]$ is 0, at $D(x) = 1$.`, r: 1 }
      ]
    },
    {
      id: "w5t3", title: "Convergence, Nash equilibrium and failure modes", lec: [34], min: 13,
      hook: R`At the end of perfect GAN training, the discriminator outputs exactly 0.5 for every image. Is that a broken discriminator, or a sign of success?`,
      reveal: R`<p>Success. If the generator's distribution $p_g$ equals the real one $p_{\text{data}}$, no classifier can beat a coin toss, so the best possible discriminator says $D^*(x) = \frac{1}{2}$. This point, where neither player can do better by changing only its own play, is the <b>Nash equilibrium</b> of the game.</p>`,
      cards: [
        { h: "What convergence looks like (Lecture 34)", b: R`<ul><li>Early: $G_\phi(z)$ produces noise or distorted faces; $p_g \ne p_{\text{data}}$, so D wins easily ($D(x) \approx 1$, $D(G(z)) \approx 0$).</li><li>D's gradients flow back into G; fakes improve and $p_g$ moves towards $p_{\text{data}}$. $D(G(z))$ climbs, e.g. $0.1 \to 0.4 \to 0.5$.</li><li>Ideal end: $p_g = p_{\text{data}}$, so $D(x) \approx D(G(z)) \approx 0.5$. This does not mean D is badly trained; it means G matched the real data.</li><li><b>Nash equilibrium</b>: neither G nor D can get a better result by changing only its own weights while the other's stay fixed.</li></ul>
          <div class="analogy">Two chess players who have both found their best strategy: neither gains by changing their moves alone.</div>` },
        { h: "The best possible discriminator", b: R`<p>For a fixed generator, the best discriminator compares how likely $x$ is under the real data and under the generator:</p>
          <div class="eq">$$D^*(x) = \frac{p_{\text{data}}(x)}{p_{\text{data}}(x) + p_g(x)}$$</div>
          <p>Put $D^*$ back into the game and the value becomes</p>
          <div class="eq">$$V(D^*, G) = -\log 4 + 2 \cdot \text{JSD}(p_{\text{data}} \,\|\, p_g)$$</div>
          <ul><li>JSD is the <b>Jensen–Shannon divergence</b>, a cousin of KL: never negative, <b>symmetric</b>, and at most $\log 2$.</li><li>So training G against the best D shrinks the JSD. The lowest point is reached when $p_g = p_{\text{data}}$: then $D^* = \frac{p}{p + p} = \frac{1}{2}$ everywhere and $V = -\log 4 \approx -1.386$.</li></ul>`, w: "gan1d",
          ask: { q: R`At the GAN's global optimum, $D(x)$ for any input equals:`, o: ["0", "1", "0.5", R`It depends on $x$`], a: 2, x: R`$p_g = p_{\text{data}} \Rightarrow D^* = \frac{p}{p + p} = \frac{1}{2}$.` } },
        { h: "What goes wrong in practice", b: R`<ul><li><b>Mode collapse</b>: G produces only a few kinds of output (say only 1s and 7s) because they reliably fool D. The pictures may look great, but there is little variety.</li><li><b>Vanishing gradients</b>: if D becomes too good, $D(G(z)) \approx 0$ and the minimax generator loss goes flat. When real and fake barely overlap, the JSD is stuck at $\log 2$ and gives no useful direction.</li><li><b>Never settling</b>: the two players chase each other round and round (oscillation).</li><li><b>Fragile settings</b>: very sensitive to learning rates and to the balance between D and G.</li></ul>
          <p>Remedies: the non-saturating loss, the DCGAN design rules, label smoothing, minibatch discrimination, and the <b>Wasserstein GAN</b> (WGAN), which uses the Earth-Mover distance with a “1-Lipschitz” critic (kept smooth by weight clipping or a gradient penalty).</p>`, f: ["modeCollapse", "Mode collapse: the real data has many kinds; the collapsed generator only makes two."] }
      ],
      keys: [R`$D^*(x) = \frac{p_{\text{data}}}{p_{\text{data}} + p_g}$.`, R`With $D^*$, G shrinks the JSD: $V = -\log 4 + 2\,\text{JSD}$; best point $p_g = p_{\text{data}}$, $D^* = \frac{1}{2}$, $V = -\log 4 \approx -1.386$.`, "Nash equilibrium: neither player can improve by changing alone.", "Failure modes: mode collapse, vanishing gradients, oscillation.", "Fixes: non-saturating loss, DCGAN design, WGAN (Wasserstein distance, 1-Lipschitz critic)."],
      traps: ["Mode collapse means low variety, not low quality.", "JSD is symmetric; KL is not.", R`$D = \frac{1}{2}$ at the equilibrium does not mean D is untrained.`],
      quiz: [
        { q: "For a fixed generator, the best discriminator is:", o: [R`$D^*(x) = \frac{p_g(x)}{p_{\text{data}}(x)}$`, R`$D^*(x) = \frac{p_{\text{data}}(x)}{p_{\text{data}}(x) + p_g(x)}$`, R`$D^*(x) = \frac{1}{2}$ always`, R`$D^*(x) = p_{\text{data}}(x)$`], a: 1, x: R`Found by maximising $V$ at each $x$.`, r: 1 },
        { q: "With the best discriminator, the GAN generator objective is the same as minimising:", o: [R`$D_{\mathrm{KL}}(p_g \,\|\, p_{\text{data}})$`, R`The Jensen–Shannon divergence between $p_{\text{data}}$ and $p_g$`, "Mean squared error", "Total variation only"], a: 1, x: R`$V(D^*, G) = -\log 4 + 2\,\text{JSD}$.`, r: 1 },
        { q: R`At the global optimum, the value $V(D^*, G^*)$ equals (natural log, 3 decimals):`, a: { n: -1.386, tol: 0.002 }, x: R`$-\log 4 = -1.386$.`, r: 1 },
        { q: "A GAN trained on handwritten digits produces only 1s and 7s, but very realistic ones. This is:", o: ["Overfitting", "Mode collapse", "Vanishing gradients", "Posterior collapse"], a: 1, x: "The generator covers only a few kinds (modes) of the real data.", r: 2 },
        { q: "Which are known GAN training problems? (Select all that apply)", o: ["Mode collapse", "Vanishing generator gradients when D is too strong", "Oscillation instead of settling", "Guaranteed convergence in one epoch"], a: [0, 1, 2], x: "GANs are famously unstable; convergence is never guaranteed.", r: 2 },
        { q: R`During GAN training, $D(G(z))$ rising from 0.1 towards 0.5 shows:`, o: ["The discriminator is diverging", "Generated samples are getting harder to tell from real ones", "Mode collapse", "The learning rate is too small"], a: 1, x: R`$p_g$ is approaching $p_{\text{data}}$.`, r: 0 }
      ]
    },
    {
      id: "w5t4", title: "DCGAN and the hands-on GANs", lec: [35, 36, 37], min: 14,
      hook: R`Swap the plain networks inside a GAN for CNNs and training often blows up. DCGAN found a few design rules that made convolutional GANs train reliably. Guess one: what replaces max pooling?`,
      reveal: R`<p><b>Strided convolutions</b> in the discriminator (shrinking with learned weights) and <b>transposed convolutions</b> in the generator (growing with learned weights). No pooling, no fully connected hidden layers, and batch normalisation almost everywhere.</p>`,
      cards: [
        { h: "The DCGAN rules (Radford et al., 2015)", b: R`<ul><li>Replace pooling with <b>strided convolutions</b> (in D) and <b>transposed convolutions</b> (in G).</li><li>Use <b>batch normalisation</b> (re-centring each layer's outputs) in both networks, <b>except</b> the generator's output layer and the discriminator's input layer.</li><li>Remove fully connected hidden layers.</li><li>Generator: <b>ReLU</b> in hidden layers, <b>tanh</b> at the output (images scaled to $[-1, 1]$).</li><li>Discriminator: <b>LeakyReLU</b> (slope 0.2) everywhere, sigmoid output.</li><li>Adam with learning rate $0.0002$ and $\beta_1 = 0.5$ (less momentum, steadier training).</li></ul>
          <p>Generator shapes: $z$ (100 numbers) → reshape to $4 \times 4 \times 1024$ → $8 \times 8 \times 512$ → $16 \times 16 \times 256$ → $32 \times 32 \times 128$ → $64 \times 64 \times 3$. Each block doubles height and width.</p>`, f: ["dcganShapes", "The DCGAN generator grows a 4 by 4 block into a 64 by 64 colour image."],
          ask: { q: "DCGAN's generator output activation is:", o: ["Sigmoid", "Softmax", "Tanh", "LeakyReLU"], a: 2, x: R`Images are scaled to $[-1, 1]$ to match tanh.` } },
        { h: "Transposed convolution output size", b: R`<div class="eq">$$\text{output} = (n - 1)\, s - 2p + f \quad (+\ \text{output padding})$$</div>
          <div class="steps"><ol><li>$n = 4$, $f = 4$, $s = 2$, $p = 1$.</li><li>$(4 - 1) \times 2 - 2 \times 1 + 4 = 6 - 2 + 4 = 8$.</li><li>$n = 8$ with the same settings: $7 \times 2 - 2 + 4 = 16$. Each DCGAN block doubles the size this way.</li></ol></div>
          <p>Compare Week 1's ordinary convolution, which shrinks: $\left\lfloor\frac{n + 2p - f}{s}\right\rfloor + 1$. The transposed version undoes it.</p>` },
        { h: "Hands-on: vanilla GAN and DCGAN on MNIST", b: R`<ul><li>Vanilla GAN: generator $z \to 256 \to 512 \to 784$ (tanh); discriminator $784 \to 512 \to 256 \to 1$ (sigmoid), LeakyReLU in D.</li><li>Each batch: (1) D step on real (label 1) and fake (label 0) with BCE; (2) G step: make fakes, <b>label them 1</b> (that is the non-saturating loss), and back-propagate through the frozen D.</li><li>Watch D loss, G loss and sample grids every few epochs. The losses do not steadily fall like a classifier's; they balance and wobble. Judge by the pictures.</li><li>DCGAN version: Conv2DTranspose generator and Conv2D discriminator, giving visibly sharper digits.</li></ul>` }
      ],
      keys: ["DCGAN: strided conv in D, transposed conv in G, no pooling, no fully connected hidden layers, BatchNorm.", "G: ReLU hidden, tanh output. D: LeakyReLU (0.2), sigmoid output.", R`Adam with learning rate $2 \times 10^{-4}$, $\beta_1 = 0.5$.`, R`Transposed conv output $= (n-1)s - 2p + f$.`, "In code, the G step labels fakes as “real” (1) to use the non-saturating loss."],
      traps: ["BatchNorm is NOT used on G's output layer or D's input layer.", "GAN losses do not fall to zero; watch the samples, not only the loss.", "LeakyReLU is in the discriminator; ReLU is in the generator."],
      quiz: [
        { q: "Which DCGAN design choices are correct? (Select all that apply)", o: ["Replace pooling with strided convolutions", "Use tanh at the generator output", "Use LeakyReLU in the discriminator", "Use large fully connected hidden layers in both networks"], a: [0, 1, 2], x: "DCGAN removes fully connected hidden layers.", r: 0 },
        { q: R`A transposed convolution with input $8 \times 8$, kernel 4, stride 2, padding 1 outputs size:`, a: { n: 16, tol: 0 }, x: R`$(8 - 1) \times 2 - 2 \times 1 + 4 = 14 - 2 + 4 = 16$.`, r: 1 },
        { q: "In the generator step of the hands-on code, fake images are passed to D with target label:", o: ["0", "1", "0.5", "No label"], a: 1, x: R`Labelling fakes as real implements the non-saturating loss $-\log D(G(z))$.`, r: 2 },
        { q: "The recommended Adam settings in DCGAN are:", o: [R`$\eta = 0.1$, $\beta_1 = 0.9$`, R`$\eta = 0.0002$, $\beta_1 = 0.5$`, R`$\eta = 0.001$, $\beta_1 = 0.999$`, R`$\eta = 1$, $\beta_1 = 0$`], a: 1, x: R`A lower $\beta_1$ means less momentum, which steadies GAN training.`, r: 0 }
      ]
    }
  ],
  test: [
    { q: R`In a GAN, $D(x)$ is:`, o: [R`The probability that $x$ is fake`, R`The probability that $x$ is real`, R`The latent code of $x$`, R`The reconstruction of $x$`], a: 1, x: "D outputs P(real).", t: "w5t1", r: 1 },
    { q: "The discriminator of a GAN is trained as a yes/no classifier using:", o: ["MSE", "Binary cross-entropy", "Categorical cross-entropy with 10 classes", R`KL divergence to $\mathcal{N}(0, I)$`], a: 1, x: "The GAN objective is built from BCE.", t: "w5t2", r: 0 },
    { q: R`Compute $-\log D(x)$ for $D(x) = 0.5$ (natural log, 3 decimals).`, a: { n: 0.693, tol: 0.002 }, x: R`$-\ln 0.5 = 0.693$.`, t: "w5t2", r: 1 },
    { q: R`The GAN value function is $V(D,G) = \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1 - D(G(z)))]$. The players' goals are:`, o: [R`Both minimise $V$`, R`D minimises $V$, G maximises $V$`, R`D maximises $V$, G minimises $V$`, R`Both maximise $V$`], a: 2, x: R`$\min_G \max_D V$.`, t: "w5t2", r: 2 },
    { q: R`If $p_g = p_{\text{data}}$, the best discriminator outputs:`, a: { n: 0.5, tol: 0.001 }, x: R`$D^* = \frac{p}{p + p} = 0.5$.`, t: "w5t3", r: 1 },
    { q: "Which divergence does the original GAN minimise when the discriminator is at its best?", o: ["KL divergence", "Reverse KL divergence", "Jensen–Shannon divergence", "Wasserstein distance"], a: 2, x: "WGAN switches to the Wasserstein distance.", t: "w5t3", r: 1 },
    { q: "A generator that produces very realistic but nearly identical samples suffers from:", o: ["Vanishing gradients", "Mode collapse", "Over-regularisation", "Exploding KL"], a: 1, x: "Low variety = mode collapse.", t: "w5t3", r: 2 },
    { q: "Which are true about the Nash equilibrium of a GAN? (Select all that apply)", o: ["Neither player can improve by changing only its own weights", R`The discriminator outputs $\frac{1}{2}$ for all inputs`, "The generator distribution equals the data distribution", "The generator loss becomes exactly zero"], a: [0, 1, 2], x: R`At the equilibrium $\log(1 - \frac{1}{2}) = -\log 2$, so the loss is not zero.`, t: "w5t3", r: 0 },
    { q: "DCGAN's discriminator uses which activation in its hidden layers?", o: ["ReLU", "LeakyReLU", "Tanh", "Softmax"], a: 1, x: "LeakyReLU with slope 0.2.", t: "w5t4", r: 0 },
    { q: "Why does a GAN produce sharper images than a VAE trained with pixel-wise MSE?", o: ["GANs have more layers", "GANs use a learned judge instead of averaging pixel-wise errors", "GANs use a KL term", "GANs use larger images"], a: 1, x: "Pixel-wise losses favour the average of plausible outputs, which looks blurry.", t: "w5t1", r: 0 },
    { q: R`Lecture 32: a well-trained discriminator gives $D(x) = 0.9$ and $D(G(z)) = 0.2$. Compute $L_D = -\ln D(x) - \ln(1 - D(G(z)))$ (3 decimals).`, a: { n: 0.328, tol: 0.003 }, x: R`$0.105 + 0.223 = 0.328$.`, t: "w5t1", r: 3 },
    { q: "The main motivation for GANs given in the course is to:", o: [R`Learn an explicit formula for $p(x)$`, "Generate very realistic data without explicitly defining a probability distribution or reconstruction loss", "Compress data", "Speed up VAE training"], a: 1, x: "GANs are implicit models: realism is judged by a learned discriminator.", t: "w5t1", r: 0 }
  ]
});

COURSE.glossary.push(
  ["GAN", R`Generative adversarial network: a generator that makes fakes and a discriminator that judges them, trained against each other.`, ["GANs", "generative adversarial network", "generative adversarial networks"]],
  ["generator", R`The GAN network that turns random noise into fake samples. The “forger”.`],
  ["discriminator", R`The GAN network that outputs the probability that a sample is real. The “detective”.`],
  ["adversarial", R`Set up as opponents with opposite goals, like the generator and discriminator.`],
  ["Nash equilibrium", R`A point in a game where no player can do better by changing only its own strategy. For a GAN: $p_g = p_{\text{data}}$ and $D = \frac{1}{2}$.`],
  ["mode collapse", R`When a GAN's generator produces only a few kinds of output, losing the variety of the real data.`],
  ["Jensen–Shannon divergence", R`A symmetric cousin of KL divergence, between 0 and $\log 2$. The original GAN minimises it.`, ["JSD", "Jensen-Shannon divergence"]],
  ["non-saturating loss", R`The generator loss $-\log D(G(z))$, used instead of $\log(1 - D(G(z)))$ because it gives strong gradients early in training.`, ["non-saturating"]],
  ["minimax", R`A game where one player minimises a value that the other maximises: $\min_G \max_D V$.`, ["min-max"]],
  ["Wasserstein GAN", R`A GAN variant that uses the Earth-Mover (Wasserstein) distance for steadier training. Abbreviated WGAN.`, ["WGAN"]],
  ["DCGAN", R`Deep convolutional GAN: a GAN built from CNNs following a set of stabilising design rules.`],
  ["strided convolution", R`A convolution with stride above 1, which shrinks the image using learned weights.`, ["strided convolutions"]],
  ["batch normalisation", R`A layer that re-centres and re-scales the outputs of the previous layer for each batch, which steadies training.`, ["BatchNorm", "batch normalization"]],
  ["LeakyReLU", R`Like ReLU but with a small slope for negative inputs, e.g. $0.2z$, so neurons never fully switch off.`, ["Leaky ReLU"]]
);
