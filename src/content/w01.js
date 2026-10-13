COURSE.weeks.push({
  id: "w1", n: 1, title: "Deep learning foundations",
  tagline: "Generative vs discriminative, activations, losses, optimizers, CNNs.",
  intro: "Every generative model in this course is a neural network trained with a loss and an optimizer, and the image models are built from convolutions. This week installs those parts. Lectures 1–9.",
  topics: [
    {
      id: "w1t1", title: "What makes a model generative?", lec: [0, 1], min: 17,
      hook: "A spam filter and ChatGPT both learn from data. One of them can invent a brand-new email that never existed. What, mathematically, does that model learn that the spam filter never bothers to learn?",
      reveal: "<p>The spam filter learns <b>p(y | x)</b>: given an email, how likely is the label “spam”. It only needs the boundary between classes. A generative model learns <b>p(x)</b> (or <b>p(x | y)</b>, or the joint <b>p(x, y)</b>): how likely the email itself is. Once you have a distribution over x, you can <i>sample</i> from it, and a sample is a new email.</p>",
      cards: [
        { h: "Two ways to learn from the same data", b: `<p>Give a model photos of cats and dogs.</p>
          <ul><li><b>Discriminative learning</b> models the conditional <b>p(y | x)</b> and learns the <i>decision boundary</i> between classes. Examples: logistic regression, SVM, a CNN classifier.</li>
          <li><b>Generative learning</b> models how the data itself is distributed: <b>p(x)</b>, the joint <b>p(x, y)</b>, or the class-conditional <b>p(x | y)</b>. Examples: Naive Bayes, GMMs, autoencoders/VAEs, GANs, diffusion models, GPT.</li></ul>
          <div class="analogy">A discriminative model is an examiner who can grade any essay. A generative model is a writer who can produce new essays.</div>
          <p>Bayes' rule links them: p(y | x) = p(x | y)·p(y) / p(x). A generative model can classify; a discriminative model cannot generate.</p>`,
          ask: { q: "A model trained only to output p(y | x) can generate new images of class y.", o: ["True", "False"], a: 1, x: "It never learned what images look like, only where the boundary between classes lies." } },
        { h: "Three flavours of generation", b: `<div class="tablewrap"><table><tr><th>Setting</th><th>Learns</th><th>Example</th></tr>
          <tr><td>Unsupervised (unconditional) generation</td><td>p(x)</td><td>Generate a random face</td></tr>
          <tr><td>Joint modelling</td><td>p(x, y)</td><td>Generate an image together with its label</td></tr>
          <tr><td>Conditional generation</td><td>p(x | c)</td><td>Text → image, a digit of a requested class, translation, prompt → answer</td></tr></table></div>
          <p>Nearly every product you know is <b>conditional</b>: the condition c is a prompt, a class label, a sketch or another image.</p>` },
        { h: "Generation as density estimation", b: `<p>Formally there is an unknown data distribution <b>p_data(x)</b>. We choose a family <b>p_θ(x)</b> (a neural network with parameters θ) and make it as close as possible to p_data, usually by minimising a <b>divergence</b> such as KL(p_data ‖ p_θ). This is the same as maximum likelihood.</p>
          <p>Then generating = <b>sampling</b> x ~ p_θ. The whole course is about different ways to build a p_θ you can both <i>train</i> and <i>sample from</i>:</p>
          <ul><li><b>Autoencoders / VAEs</b> (Weeks 2–4): compress to a latent z, decode back.</li><li><b>GANs</b> (Weeks 5–6): a generator fools a discriminator.</li><li><b>Diffusion</b> (Weeks 7–8): learn to undo noise step by step.</li><li><b>Autoregressive LLMs</b> (Weeks 9–12): predict the next token.</li></ul>` },
        { h: "Where generative AI shows up", b: `<ul><li>Text: chatbots, summarisation, code generation, translation.</li><li>Images: text-to-image (Stable Diffusion, DALL·E), super-resolution, inpainting, style transfer.</li><li>Audio and video: speech synthesis, music, video generation.</li><li>Science and medicine: synthetic data augmentation for rare diseases, drug and protein design, anomaly detection (a sample with low p(x) is unusual).</li></ul>
          <p>The course runs over 12 weeks: deep-learning basics (W1), autoencoders (W2), VAEs (W3–4), GANs (W5–6), diffusion (W7–8), sequence models and NLP (W9), LLMs and prompting (W10), RAG (W11), and capabilities, multimodality and ethics (W12).</p>` }
      ],
      keys: ["Discriminative = p(y|x), decision boundary. Generative = p(x), p(x,y) or p(x|y), the data distribution.", "A generative model can be turned into a classifier with Bayes' rule; the reverse is not possible.", "Conditional generation p(x|c): the condition is a prompt, label, image or sketch.", "Training a generative model = minimising a divergence between p_data and p_θ; generating = sampling."],
      traps: ["Logistic regression, SVM and CNN classifiers are discriminative even though they are probabilistic.", "Naive Bayes is generative (it models p(x|y)p(y)).", "“Unsupervised generation” means no condition, not no training data."],
      quiz: [
        { q: "Which quantity does a discriminative classifier model directly?", o: ["p(x)", "p(x, y)", "p(y | x)", "p(x | y)"], a: 2, x: "Discriminative models learn the conditional probability of the label given the input, i.e. the decision boundary.", r: 0 },
        { q: "Which of the following are generative models? (Select all that apply)", o: ["Variational autoencoder", "Support vector machine", "Diffusion model", "GPT (autoregressive language model)"], a: [0, 2, 3], x: "VAEs, diffusion models and autoregressive LLMs all model the data distribution and can sample new data. An SVM only learns a boundary.", r: 0 },
        { q: "Generating an image of the digit “7” when asked for a 7 is an example of:", o: ["Unconditional generation", "Conditional generation p(x | y)", "Discriminative learning", "Dimensionality reduction"], a: 1, x: "The class label is the condition, so the model samples from p(x | y = 7).", r: 1 },
        { q: "Training a generative model is usually framed as:", o: ["Maximising the margin between classes", "Minimising a divergence between p_data and p_θ", "Minimising the number of parameters", "Maximising p(y | x) on labelled data"], a: 1, x: "We push the model distribution towards the data distribution, e.g. by minimising KL, which is equivalent to maximum likelihood.", r: 2 },
        { q: "A generative model of p(x) is used for anomaly detection by flagging inputs that…", o: ["have high p(x)", "have low p(x)", "have the highest p(y|x)", "lie exactly on the decision boundary"], a: 1, x: "Inputs the model considers unlikely under the learned data distribution are unusual.", r: 3 }
      ]
    },
    {
      id: "w1t2", title: "Activation functions and loss functions", lec: [2], min: 17, w: "activation",
      hook: "Stack 100 linear layers, each with millions of weights. A single linear layer can represent everything this monster can. Why?",
      reveal: "<p>A composition of linear maps is linear: W₃(W₂(W₁x)) = (W₃W₂W₁)x = W′x. Without a non-linear <b>activation</b> between layers, depth adds nothing. Activations are what let networks bend decision boundaries and approximate any function.</p>",
      cards: [
        { h: "Why activations exist", b: `<p>Each neuron computes <b>z = w·x + b</b>, then an activation <b>a = f(z)</b>. A non-linear f between layers is what gives depth its power (universal approximation). Hidden layers use non-linear activations; the <b>output layer</b> activation is chosen to match the type of target.</p>`, w: "activation" },
        { h: "The hidden-layer line-up", b: `<div class="tablewrap"><table><tr><th>Function</th><th>Formula</th><th>Range</th><th>Notes</th></tr>
          <tr><td>Sigmoid</td><td>1/(1+e^(−z))</td><td>(0, 1)</td><td>Saturates; max gradient 0.25; not zero-centred</td></tr>
          <tr><td>Tanh</td><td>(e^z − e^(−z))/(e^z + e^(−z))</td><td>(−1, 1)</td><td>Zero-centred; still saturates</td></tr>
          <tr><td>ReLU</td><td>max(0, z)</td><td>[0, ∞)</td><td>Default for hidden layers; cheap; can “die” for z &lt; 0</td></tr>
          <tr><td>Leaky ReLU</td><td>z if z&gt;0 else αz</td><td>(−∞, ∞)</td><td>Small slope α keeps negative neurons alive</td></tr></table></div>
          <p><b>Vanishing gradient:</b> backprop multiplies derivatives layer by layer. Sigmoid's derivative is at most 0.25, so after many layers the gradient shrinks towards 0 and early layers stop learning. ReLU's derivative is 1 for z &gt; 0, which is why it took over.</p>` },
        { h: "Match the output layer to the target", b: `<div class="tablewrap"><table><tr><th>Task / target</th><th>Output activation</th><th>Loss</th></tr>
          <tr><td>Regression, continuous values (e.g. reconstructing real-valued features)</td><td>Linear</td><td>Mean squared error (MSE), or MAE</td></tr>
          <tr><td>Binary classification, or targets in [0, 1] (e.g. normalised pixels)</td><td>Sigmoid</td><td>Binary cross-entropy (BCE)</td></tr>
          <tr><td>Multi-class, one label out of K</td><td>Softmax</td><td>Categorical cross-entropy</td></tr>
          <tr><td>Multi-label (several labels can be on)</td><td>Sigmoid per output</td><td>BCE per output</td></tr></table></div>
          <p>This pairing reappears every week. The autoencoder and VAE numerical examples in Weeks 2–3 use a <b>linear output + MSE</b> for continuous data and <b>sigmoid + BCE</b> for binary or [0, 1] data.</p>`,
          ask: { q: "You reconstruct real-valued sensor readings like 5.1, 3.5, 1.4. Which output activation?", o: ["Sigmoid", "Softmax", "Linear", "ReLU only"], a: 2, x: "Continuous, unbounded targets need a linear output, paired with MSE." } },
        { h: "The loss formulas you must be able to compute", b: `<div class="eq">MSE = (1/n) Σ (y_i − ŷ_i)²</div><div class="eq">MAE = (1/n) Σ |y_i − ŷ_i|</div>
          <div class="eq">BCE = −(1/n) Σ [ y·log ŷ + (1 − y)·log(1 − ŷ) ]</div><div class="eq">Categorical CE = − Σ_k y_k · log ŷ_k   (only the true class term survives for one-hot y)</div><div class="eq">Softmax: ŷ_k = e^(z_k) / Σ_j e^(z_j)</div>
          <p>Worked example: y = 1 and ŷ = 0.8 gives BCE = −ln 0.8 = 0.223. If ŷ = 0.1, BCE = −ln 0.1 = 2.303. Confident wrong answers are punished heavily.</p>` }
      ],
      keys: ["Without non-linear activations, any depth collapses to one linear layer.", "ReLU = max(0, z) is the default hidden activation; sigmoid's max gradient is 0.25 → vanishing gradients.", "Pairs: linear + MSE (continuous), sigmoid + BCE (binary / [0,1]), softmax + categorical CE (multi-class).", "BCE with y = 1 reduces to −log ŷ; with y = 0 to −log(1 − ŷ)."],
      traps: ["Softmax outputs sum to 1; independent sigmoids do not (use those for multi-label).", "Tanh is zero-centred, sigmoid is not.", "“Dying ReLU” is a problem of negative inputs, not positive ones."],
      quiz: [
        { q: "What is the maximum value of the derivative of the sigmoid function?", o: ["1", "0.5", "0.25", "0.1"], a: 2, x: "σ′(z) = σ(z)(1 − σ(z)), largest at z = 0 where σ = 0.5, giving 0.25.", r: 1 },
        { q: "An autoencoder reconstructs continuous-valued inputs. The recommended output activation and loss are:", o: ["Sigmoid with BCE", "Linear with MSE", "Softmax with categorical CE", "ReLU with hinge loss"], a: 1, x: "Continuous targets → linear output → MSE. This is exactly the setup in the lecture's AE and VAE numerical examples.", r: 2 },
        { q: "Compute the binary cross-entropy (natural log) for a single example with true label y = 1 and prediction ŷ = 0.8. Round to 3 decimals.", a: { n: 0.223, tol: 0.002 }, x: "BCE = −[1·ln 0.8 + 0·ln 0.2] = −ln 0.8 = 0.223.", r: 3 },
        { q: "Why do deep networks with sigmoid activations in every hidden layer train slowly?", o: ["Sigmoid is not differentiable", "Its small derivative (≤ 0.25) shrinks gradients as they pass back through many layers", "Sigmoid outputs can be negative", "Sigmoid has too many parameters"], a: 1, x: "Multiplying many derivatives ≤ 0.25 makes early-layer gradients vanish.", r: 1 },
        { q: "Which statements about ReLU are true? (Select all that apply)", o: ["ReLU(z) = max(0, z)", "Its gradient is 1 for positive inputs", "It saturates for large positive inputs", "Neurons stuck at negative inputs output 0 and stop learning"], a: [0, 1, 3], x: "ReLU does not saturate for z > 0. The 'dying ReLU' problem happens when z stays negative.", r: 1 }
      ]
    },
    {
      id: "w1t3", title: "How networks learn: optimizers", lec: [3, 4], min: 19, w: "optim",
      hook: "You are blindfolded on a hillside and want to reach the valley floor. You can only feel the slope under your feet. In a long, narrow ravine, which strategy gets you down fastest: tiny careful steps, big steps, or steps that build up speed?",
      reveal: "<p>Tiny steps take forever; big steps bounce from wall to wall. Building up velocity (<b>momentum</b>) averages out the side-to-side bouncing, and adapting the step size per direction (<b>RMSProp, Adam</b>) takes big steps along the flat floor and small steps across the steep walls. That is the whole story of this topic.</p>",
      cards: [
        { h: "Gradient descent and its batch sizes", b: `<p>The optimizer updates parameters to reduce the loss L(θ):</p><div class="eq">θ ← θ − η · ∇_θ L</div><p>η is the <b>learning rate</b>. The variants differ in how much data each gradient uses:</p>
          <div class="tablewrap"><table><tr><th>Variant</th><th>Gradient computed on</th><th>Trade-off</th></tr><tr><td>Batch GD</td><td>Entire dataset</td><td>Smooth, exact, slow and memory-hungry; one update per epoch</td></tr><tr><td>Stochastic GD (SGD)</td><td>One sample</td><td>Very noisy, fast updates; the noise can escape shallow minima</td></tr><tr><td>Mini-batch SGD</td><td>A batch of B samples (32, 64, 128…)</td><td>The practical default: GPU-friendly, moderate noise</td></tr></table></div>
          <p>With N samples and batch size B there are ⌈N/B⌉ updates per epoch.</p>`,
          ask: { q: "N = 10,000 samples, batch size 50. How many parameter updates in one epoch?", o: ["50", "200", "10,000", "1"], a: 1, x: "10,000 / 50 = 200 updates per epoch." } },
        { h: "Learning rate: the most important knob", b: `<ul><li>Too small: painfully slow, may stall on plateaus.</li><li>Too large: overshoots, oscillates or diverges.</li></ul><p>Use the race below to see a narrow valley: plain gradient descent zig-zags across the steep direction, and diverges once the learning rate is too large for the steepest axis.</p>`, w: "optim" },
        { h: "Momentum: give the ball some mass", b: `<div class="eq">v_t = β·v_(t−1) + η·∇L      θ ← θ − v_t      (β ≈ 0.9)</div>
          <p>The velocity is an exponential moving average of past gradients. Components that keep pointing the same way add up (faster along the valley floor); components that flip sign cancel out (less zig-zag). Nesterov momentum evaluates the gradient at the look-ahead point θ − β·v.</p>` },
        { h: "Adaptive learning rates: AdaGrad, RMSProp, Adam", b: `<div class="tablewrap"><table><tr><th>Optimizer</th><th>Idea</th><th>Update</th></tr>
          <tr><td>AdaGrad</td><td>Divide by the root of the <i>sum</i> of all past squared gradients</td><td>G_t = G_(t−1) + g²;  θ ← θ − η·g / (√G_t + ε)</td></tr>
          <tr><td>RMSProp</td><td>Use an exponential moving <i>average</i> of squared gradients instead</td><td>s_t = ρ·s_(t−1) + (1−ρ)·g²;  θ ← θ − η·g / (√s_t + ε)</td></tr>
          <tr><td>Adam</td><td>Momentum (1st moment) + RMSProp (2nd moment) + bias correction</td><td>m_t = β₁m + (1−β₁)g;  v_t = β₂v + (1−β₂)g²;  m̂ = m/(1−β₁ᵗ), v̂ = v/(1−β₂ᵗ);  θ ← θ − η·m̂/(√v̂ + ε)</td></tr></table></div>
          <p><b>AdaGrad's flaw:</b> G only grows, so the effective learning rate decays towards 0 and training stalls. RMSProp fixes this by forgetting old gradients. Adam's defaults: β₁ = 0.9, β₂ = 0.999, ε = 10⁻⁸, η = 10⁻³. Bias correction matters early, because m and v start at 0.</p>` }
      ],
      keys: ["Update rule θ ← θ − η∇L; η is the learning rate.", "Batch GD = full dataset; SGD = 1 sample; mini-batch = B samples (the practical default).", "Momentum: moving average of gradients, β ≈ 0.9, damps oscillation.", "AdaGrad accumulates squared gradients → its learning rate decays to zero. RMSProp uses a moving average instead.", "Adam = momentum + RMSProp + bias correction (β₁ = 0.9, β₂ = 0.999)."],
      traps: ["Adam's bias correction divides by (1 − βᵗ), not multiplies.", "A smaller batch gives noisier gradients, not more accurate ones.", "AdaGrad works well for sparse features; its problem is the ever-growing denominator."],
      quiz: [
        { q: "Which optimizer's effective learning rate keeps shrinking because it sums all past squared gradients?", o: ["Momentum", "AdaGrad", "RMSProp", "Adam"], a: 1, x: "AdaGrad's accumulator G_t only grows, so η/√G_t → 0. RMSProp replaced the sum with a moving average.", r: 3 },
        { q: "Adam combines which two ideas?", o: ["Dropout and batch normalisation", "Momentum (first moment) and RMSProp-style scaling (second moment)", "AdaGrad and Nesterov", "SGD and L2 regularisation"], a: 1, x: "Adam tracks a moving average of gradients (m) and of squared gradients (v), with bias correction.", r: 3 },
        { q: "With momentum β = 0.9, η = 0.1, previous velocity v = 0.5 and current gradient g = 2, what is the new velocity v_t = β·v + η·g?", a: { n: 0.65, tol: 0.001 }, x: "0.9 × 0.5 + 0.1 × 2 = 0.45 + 0.2 = 0.65.", r: 2 },
        { q: "A dataset has 60,000 images and the batch size is 64. How many mini-batch updates are in one epoch (rounding up)?", a: { n: 938, tol: 0 }, x: "60,000 / 64 = 937.5, so 938 batches (the last one is partial).", r: 0 },
        { q: "Which statements are true? (Select all that apply)", o: ["Stochastic GD uses one sample per update", "A very large learning rate can make the loss diverge", "Batch GD performs many updates per epoch", "Momentum reduces oscillations across steep directions"], a: [0, 1, 3], x: "Batch GD makes exactly one update per epoch, using the full dataset.", r: 1 }
      ]
    },
    {
      id: "w1t4", title: "Convolutions: how a CNN sees", lec: [5], min: 19, w: "conv",
      hook: "Flatten a 200×200 colour photo and feed it to a fully connected layer of 1,000 neurons. How many weights is that, and what did flattening throw away?",
      reveal: "<p>200 × 200 × 3 = 120,000 inputs × 1,000 neurons ≈ <b>120 million weights</b> in one layer. Flattening also destroys <b>spatial structure</b>: pixels that were neighbours end up far apart in the vector, and the network must relearn the same edge detector at every position. A convolution reuses one small filter everywhere and keeps neighbourhoods intact.</p>",
      cards: [
        { h: "Why a fully connected network struggles with images", b: `<ul><li>An image is a matrix of pixel intensities (H × W × C, with C = 3 for RGB, 1 for grayscale).</li><li>An MLP needs a flat vector, which <b>destroys spatial relationships</b> and local dependencies (edges, curves).</li><li>It treats every pixel as an independent feature, though meaning comes from groups of nearby pixels.</li><li>The parameter count explodes (28×28×3 = 2,352 inputs; 200×200×3 = 120,000), which slows training and invites overfitting.</li></ul>
          <p>CNNs borrow from the <b>human visual system</b>: early layers detect lines, edges and corners; deeper layers combine them into shapes and objects.</p>` },
        { h: "The convolution operation", b: `<p>A <b>kernel</b> (filter) is a small learnable matrix, usually odd-sized (3×3, 5×5). It slides over the image; at each position you multiply element-wise and sum. The grid of results is a <b>feature map</b>.</p><p>Kernel values are <b>learned by backpropagation</b>, not hand-designed. Using K different kernels gives K feature maps, each detecting a different pattern.</p>`, w: "conv" },
        { h: "Output size: the formula behind half the numericals", b: `<div class="eq">output = ⌊(n + 2p − f) / s⌋ + 1</div>
          <p>n = input size, f = kernel size, p = padding, s = stride. Apply it separately to height and width.</p>
          <ul><li>6×6 input, 3×3 kernel, p = 0, s = 1 → (6 − 3)/1 + 1 = <b>4×4</b>. The output shrinks and border pixels are visited fewer times.</li><li><b>Padding</b> adds a border of zeros. 'same' padding (p = 1 for a 3×3 kernel) keeps 6×6 → 6×6. 'valid' means no padding.</li><li><b>Stride</b> = how far the kernel jumps. 7×7, f = 3, s = 2 → ⌊4/2⌋ + 1 = <b>3×3</b>.</li><li>A non-integer result is floored.</li></ul>
          <p>Keras: <code>Conv2D(32, (3,3), strides=(2,2), padding='same', activation='relu')</code>. The default stride is 1. Strides can differ per axis, e.g. (2, 3).</p>`,
          ask: { q: "Input 32×32, kernel 5×5, padding 0, stride 1. Output size?", o: ["32×32", "28×28", "27×27", "30×30"], a: 1, x: "(32 − 5)/1 + 1 = 28." } },
        { h: "What CNNs are used for", b: `<ul><li><b>Classification</b>: one label per image (benign vs malignant).</li><li><b>Classification + localisation</b>: the label plus one bounding box.</li><li><b>Object detection</b>: several objects, each with a box and a class.</li><li><b>Semantic segmentation</b>: a class for every pixel; all sheep share one colour.</li><li><b>Instance segmentation</b>: per-pixel masks that also separate individuals (sheep 1, sheep 2, …).</li></ul>` }
      ],
      keys: ["Output size = ⌊(n + 2p − f)/s⌋ + 1.", "Kernel = filter; its weights are learned; K kernels → K feature maps.", "'same' padding keeps the spatial size (p = (f−1)/2 for stride 1); 'valid' = no padding.", "MLPs on images: lose spatial structure, treat pixels independently, and explode in parameters.", "Semantic segmentation labels pixels by class; instance segmentation also separates individual objects."],
      traps: ["Padding p appears as 2p in the formula (both sides).", "A 1×1 kernel does not look at neighbours; it only mixes channels.", "Instance vs semantic segmentation: the difference is separating individuals of the same class."],
      quiz: [
        { q: "An input of size 7×7 is convolved with a 3×3 filter, padding 0, stride 2. What is the output size?", o: ["5×5", "3×3", "4×4", "2×2"], a: 1, x: "⌊(7 + 0 − 3)/2⌋ + 1 = 2 + 1 = 3.", r: 2 },
        { q: "A 64×64 input, 3×3 kernel, stride 1. What padding keeps the output at 64×64?", a: { n: 1, tol: 0 }, x: "64 = (64 + 2p − 3) + 1 ⇒ 2p = 2 ⇒ p = 1 ('same' padding).", r: 2 },
        { q: "Why is a fully connected network a poor choice for raw images? (Select all that apply)", o: ["Flattening destroys spatial relationships between neighbouring pixels", "The number of parameters explodes with image size", "It cannot use activation functions", "It treats each pixel as an independent feature"], a: [0, 1, 3], x: "MLPs can use activations. The problems are lost spatial structure, independent pixel treatment and parameter explosion (slow training, overfitting).", r: 0 },
        { q: "Labelling every pixel with a class, without distinguishing two sheep from each other, is called:", o: ["Object detection", "Instance segmentation", "Semantic segmentation", "Classification with localisation"], a: 2, x: "Semantic segmentation assigns classes per pixel. Instance segmentation would also separate sheep 1 and sheep 2.", r: 3 },
        { q: "Applying a 3×3 kernel [[1,0,−1],[1,0,−1],[1,0,−1]] to the patch [[3,0,1],[1,5,8],[2,7,2]] gives:", a: { n: -5, tol: 0 }, x: "(3 + 1 + 2)·1 + (0 + 5 + 7)·0 + (1 + 8 + 2)·(−1) = 6 − 11 = −5. This is the lecture's first worked value.", r: 1 }
      ]
    },
    {
      id: "w1t5", title: "Inside a full CNN: ReLU, pooling, flatten, dense, ensembles", lec: [6, 7, 8, 9], min: 17, w: "cnncalc",
      hook: "A CNN's convolution layers give you a 7×7×64 block of numbers. A classifier needs one probability per class. What has to happen in between, and which of those steps has zero learnable parameters?",
      reveal: "<p>ReLU, then <b>pooling</b> to shrink it, then <b>flatten</b> to a 3,136-long vector, then <b>fully connected (dense)</b> layers ending in softmax. ReLU, pooling and flatten all have <b>zero parameters</b>; only convolution and dense layers learn weights.</p>",
      cards: [
        { h: "The standard pipeline", b: `<div class="eq wrap">Input → [Conv → ReLU → Pool] × N → Flatten → Dense → … → Dense(softmax)</div>
          <ul><li><b>ReLU</b> after each convolution adds non-linearity and zeroes negative responses.</li><li><b>Pooling</b> down-samples each feature map. <b>Max pooling</b> keeps the largest value in each window; <b>average pooling</b> keeps the mean. A 2×2 pool with stride 2 halves height and width and keeps the depth. It adds some translation invariance and has no parameters.</li><li><b>Flatten</b> turns the H×W×C block into a vector.</li><li><b>Dense</b> layers do the final classification. Softmax at the end for multi-class.</li><li>Optional: batch normalisation, dropout (regularisation).</li></ul>`,
          ask: { q: "Max pooling 2×2 (stride 2) on [[1,3],[2,9]] gives:", o: ["3.75", "9", "15", "1"], a: 1, x: "Max pooling keeps the largest value in the window: 9. Average pooling would give 3.75." } },
        { h: "Counting parameters", b: `<div class="eq">Conv params = (f × f × C_in + 1) × K        Dense params = (inputs + 1) × outputs</div>
          <p>Example: a Conv2D with 32 filters of 3×3 on an RGB image → (3·3·3 + 1)·32 = <b>896</b>. A Dense layer from 128 to 10 → (128 + 1)·10 = <b>1,290</b>. The +1 is the bias per filter or per neuron. Weight sharing is why convolutions are so cheap.</p>`, w: "cnncalc" },
        { h: "Hands-on: Colab, Keras and a real dataset", b: `<ul><li><b>Google Colab</b>: a free hosted Jupyter notebook. Switch the runtime to a GPU (Runtime → Change runtime type), mount Google Drive for data, install packages with <code>!pip</code>.</li><li>Typical Keras flow: load and normalise the data (pixels / 255), build a <code>Sequential</code> model, <code>model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])</code>, <code>model.fit(..., validation_split=0.2, epochs=...)</code>, then evaluate on the test set.</li><li>Use <code>sparse_categorical_crossentropy</code> when the labels are integers instead of one-hot vectors.</li><li>Watch the training and validation curves: validation loss rising while training loss falls means overfitting. Fix it with dropout, data augmentation or early stopping.</li><li><b>Transfer learning</b>: reuse a network pre-trained on ImageNet (VGG, ResNet), freeze its convolution base, and train a new classification head on your data.</li></ul>` },
        { h: "Ensembles: many models, one vote", b: `<p>An <b>ensemble</b> combines several models to reduce variance and error. Common forms: <b>majority / hard voting</b> (most common class), <b>soft voting</b> (average the predicted probabilities), <b>bagging</b> (models on bootstrap samples, e.g. random forest), <b>boosting</b> (sequential models fixing earlier errors), and <b>stacking</b> (a meta-model learns from the base models' outputs).</p><p>Ensembles help only when the members make <i>different</i> errors.</p>`, w: "ensemble" }
      ],
      keys: ["Pipeline: Conv → ReLU → Pool (repeat) → Flatten → Dense → Softmax.", "Pooling, ReLU and flatten have 0 parameters; 2×2 pooling with stride 2 halves H and W and keeps the depth.", "Conv params = (f·f·C_in + 1)·K; dense params = (in + 1)·out.", "Ensembles: hard voting, soft voting (average probabilities), bagging, boosting, stacking."],
      traps: ["Pooling reduces height and width, never the number of channels.", "Soft voting averages probabilities; hard voting counts labels.", "sparse_categorical_crossentropy takes integer labels; categorical_crossentropy takes one-hot labels."],
      quiz: [
        { q: "How many learnable parameters does a Conv2D layer with 16 filters of size 3×3 have when applied to a grayscale (1-channel) image?", a: { n: 160, tol: 0 }, x: "(3·3·1 + 1)·16 = 10·16 = 160.", r: 1 },
        { q: "A 28×28×32 feature map passes through 2×2 max pooling with stride 2. The output shape is:", o: ["14×14×16", "14×14×32", "28×28×16", "26×26×32"], a: 1, x: "Height and width halve; the channel count is unchanged.", r: 0 },
        { q: "Which layers have no learnable parameters? (Select all that apply)", o: ["Max pooling", "Flatten", "Dense", "ReLU activation"], a: [0, 1, 3], x: "Only convolution and dense layers (and normalisation layers) learn weights.", r: 0 },
        { q: "Averaging the predicted class probabilities of several models and picking the highest is called:", o: ["Hard voting", "Soft voting", "Boosting", "Dropout"], a: 1, x: "Soft voting averages probabilities; hard voting counts predicted labels.", r: 3 },
        { q: "During training, validation loss starts rising while training loss keeps falling. This indicates:", o: ["Underfitting", "Overfitting", "A learning rate that is too small", "Vanishing gradients"], a: 1, x: "The model is memorising the training set. Dropout, augmentation or early stopping help.", r: 2 }
      ]
    }
  ],
  test: [
    { q: "Naive Bayes classifies by modelling p(x | y)·p(y). It is therefore a:", o: ["Discriminative model", "Generative model", "Reinforcement learning model", "Clustering model"], a: 1, x: "Modelling how data is generated for each class makes it generative.", t: "w1t1", r: 0 },
    { q: "A text-to-image system generates pictures from prompts. It learns:", o: ["p(x)", "p(y | x)", "p(x | c), with c the text prompt", "Only a decision boundary"], a: 2, x: "Conditional generation: the prompt is the condition.", t: "w1t1", r: 1 },
    { q: "For multi-class classification with one correct class out of K, the standard output layer and loss are:", o: ["Sigmoid + MSE", "Softmax + categorical cross-entropy", "Linear + BCE", "ReLU + MAE"], a: 1, x: "Softmax gives a probability distribution over K classes; cross-entropy compares it with the one-hot label.", t: "w1t2", r: 2 },
    { q: "Compute the MSE between y = [1, 2, 3] and ŷ = [1, 3, 5].", a: { n: 1.6667, tol: 0.01 }, x: "Squared errors 0, 1, 4 → mean = 5/3 ≈ 1.667.", t: "w1t2", r: 3 },
    { q: "Which optimizer uses bias-corrected estimates m̂ = m/(1−β₁ᵗ) and v̂ = v/(1−β₂ᵗ)?", o: ["SGD", "AdaGrad", "RMSProp", "Adam"], a: 3, x: "Bias correction compensates for m and v being initialised at zero.", t: "w1t3", r: 3 },
    { q: "Which statements about mini-batch SGD are true? (Select all that apply)", o: ["It computes the gradient on a subset of samples", "It gives noisier updates than full-batch gradient descent", "It always reaches the global minimum", "It makes better use of GPU parallelism than single-sample SGD"], a: [0, 1, 3], x: "No variant of SGD guarantees a global minimum on non-convex losses.", t: "w1t3", r: 0 },
    { q: "Input 6×6, filter 3×3, padding 1, stride 1. Output size?", o: ["4×4", "6×6", "8×8", "5×5"], a: 1, x: "(6 + 2 − 3)/1 + 1 = 6. Padding preserved the size.", t: "w1t4", r: 2 },
    { q: "Input 224×224×3, a Conv2D with 64 filters of 7×7, stride 2, padding 3. What is the output height?", a: { n: 112, tol: 0 }, x: "⌊(224 + 6 − 7)/2⌋ + 1 = ⌊223/2⌋ + 1 = 111 + 1 = 112.", t: "w1t4", r: 2 },
    { q: "Parameters in a Dense layer that maps a flattened vector of 512 values to 10 outputs:", a: { n: 5130, tol: 0 }, x: "(512 + 1) × 10 = 5,130.", t: "w1t5", r: 1 },
    { q: "In transfer learning with a pre-trained ResNet, the usual first step is to:", o: ["Re-initialise all weights randomly", "Freeze the pre-trained convolution base and train a new classification head", "Remove all convolution layers", "Train only the first convolution layer"], a: 1, x: "The pre-trained base already extracts general features; the new head adapts them to your classes.", t: "w1t5", r: 2 }
  ]
});
