COURSE.weeks.push({
  id: "w0", n: 0, title: "Math toolkit",
  tagline: "The five pieces of school-plus maths the whole course leans on.",
  intro: R`This course is taught to engineering students, so the lectures assume some maths you may not have met in Class 10. This week fills those gaps in about 70 minutes: probability with a condition, exponents and logs, vectors and matrices, slopes, and the bell curve. Every later week builds on these five ideas, so do not skip it.`,
  topics: [
    {
      id: "w0t1", title: "Probability, the language of chance", lec: [], min: 16,
      hook: R`In a class, 40 of 100 emails are spam. 30 of the spam emails contain the word “WIN”, but only 6 of the 60 normal emails do. An email arrives with “WIN” in it. Is it more likely spam or normal?`,
      reveal: R`<p>Count only the emails that contain “WIN”: $30 + 6 = 36$. Of these, 30 are spam. So the chance it is spam, <i>given</i> that it says WIN, is $\frac{30}{36} \approx 0.83$. Spam is far more likely. This “given that” idea is called <b>conditional probability</b>, and it is the heart of this course.</p>`,
      cards: [
        { h: "Probability is a number from 0 to 1", b: R`<p>You already know this from Class 10: probability is $\dfrac{\text{favourable outcomes}}{\text{all outcomes}}$. It is always between 0 (impossible) and 1 (certain).</p>
          <p>In this course we write it as $p(\ldots)$. So $p(\text{spam}) = 0.4$ means “40% of emails are spam”.</p>
          <div class="plain">$p(x)$ just means “how likely is $x$?”. The letter $x$ is whatever we are talking about: an email, an image, a word.</div>
          <p>All the probabilities of every possible outcome add up to exactly 1. If $p(\text{spam}) = 0.4$ then $p(\text{normal}) = 0.6$.</p>`, f: ["probScale", "Every probability sits somewhere on this line."] },
        { h: "“Given that”: conditional probability", b: R`<p>The vertical bar “$\mid$” is read <b>“given”</b>. It means: <i>first shrink the world to only the cases where the thing after the bar is true, then count.</i></p>
          <div class="eq">$$p(\text{spam} \mid \text{WIN}) = \frac{\text{emails that are spam AND say WIN}}{\text{emails that say WIN}} = \frac{30}{36}$$</div>
          <p>Notice that $p(\text{WIN} \mid \text{spam}) = \frac{30}{40} = 0.75$ is a different number. Swapping the two sides of the bar changes the question.</p>
          <div class="analogy">“Given it is raining, how likely are umbrellas?” is very different from “given there are umbrellas, how likely is rain?”.</div>`, w: "probgrid",
          ask: { q: R`In the hook, what is $p(\text{WIN} \mid \text{normal})$?`, o: [R`$\frac{6}{60} = 0.1$`, R`$\frac{6}{36}$`, R`$\frac{6}{100}$`, R`$\frac{30}{36}$`], a: 0, x: R`Shrink the world to the 60 normal emails; 6 of them say WIN.` } },
        { h: "Joint probability and the multiplication rule", b: R`<p><b>Joint</b> probability is “both things together”. We write it with a comma: $p(\text{spam}, \text{WIN}) = \frac{30}{100} = 0.3$.</p>
          <p>There is a neat rule linking joint and conditional:</p>
          <div class="eq">$$p(x, y) = p(y \mid x)\, p(x)$$</div>
          <p>Check it: $p(\text{WIN} \mid \text{spam})\,p(\text{spam}) = 0.75 \times 0.4 = 0.3$. ✓</p>
          <div class="plain">Chance of both = (chance of the first) $\times$ (chance of the second once the first has happened).</div>` },
        { h: "Bayes' rule: flipping the bar", b: R`<p>Write the multiplication rule both ways round and divide. You get <b>Bayes' rule</b>, which lets you swap what is on each side of the bar:</p>
          <div class="eq">$$p(y \mid x) = \frac{p(x \mid y)\, p(y)}{p(x)}$$</div>
          <div class="steps"><ol><li>$p(\text{WIN} \mid \text{spam}) = 0.75$, $p(\text{spam}) = 0.4$.</li><li>$p(\text{WIN}) = \frac{36}{100} = 0.36$.</li><li>$p(\text{spam} \mid \text{WIN}) = \frac{0.75 \times 0.4}{0.36} = 0.83$. Same answer as counting.</li></ol></div>
          <p>Why you care: in Week 1 you will see that a model which knows $p(x \mid y)$ (“what do cat photos look like?”) can use Bayes' rule to answer $p(y \mid x)$ (“is this photo a cat?”).</p>` },
        { h: "Distributions and sampling", b: R`<p>A <b>distribution</b> is the full list of outcomes with their probabilities, like a table or a bar chart. For a fair die, each face has probability $\frac{1}{6}$.</p>
          <p><b>Sampling</b> means drawing one outcome at random <i>according to</i> those probabilities. Rolling the die is sampling. We write $x \sim p$, read “$x$ is drawn from $p$”.</p>
          <div class="plain">A generative AI model is a machine that has learned a distribution (of faces, sentences, songs) and then samples from it. Each sample is a brand-new face or sentence.</div>
          <p>The <b>expected value</b> $\mathbb{E}[x]$ is the long-run average of samples. For a die, $\mathbb{E}[x] = \frac{1+2+3+4+5+6}{6} = 3.5$.</p>`,
          ask: { q: R`What does $x \sim p$ mean?`, o: ["x is approximately p", "x is drawn at random from the distribution p", "x is less than p", "x equals the average of p"], a: 1, x: R`The tilde $\sim$ means “is sampled from”.` } }
      ],
      keys: [R`$p(x)$ = how likely $x$ is; all probabilities add to 1.`, R`$p(y \mid x)$ = probability of $y$ <i>given</i> $x$: shrink to cases where $x$ is true, then count.`, R`Joint: $p(x, y) = p(y \mid x)\,p(x)$.`, R`Bayes: $p(y \mid x) = \dfrac{p(x \mid y)\,p(y)}{p(x)}$.`, R`$x \sim p$ means “$x$ is sampled from $p$”; $\mathbb{E}[x]$ is the average of many samples.`],
      traps: [R`$p(y \mid x)$ and $p(x \mid y)$ are different numbers.`, R`The comma means AND (joint); the bar means GIVEN (conditional).`],
      quiz: [
        { q: R`A bag has 3 red and 7 blue balls. What is $p(\text{red})$?`, a: { n: 0.3, tol: 0.001 }, x: R`$\frac{3}{10} = 0.3$.`, r: 0 },
        { q: R`Of 50 students, 20 play cricket. 15 of the cricket players also play football. What is $p(\text{football} \mid \text{cricket})$?`, a: { n: 0.75, tol: 0.001 }, x: R`Shrink to the 20 cricket players: $\frac{15}{20} = 0.75$.`, r: 1 },
        { q: R`In the symbol $p(y \mid x)$, the vertical bar is read as:`, o: ["divided by", "given", "or", "not"], a: 1, x: R`“Probability of $y$ given $x$.”`, r: 1 },
        { q: R`If $p(\text{rain}) = 0.5$ and $p(\text{umbrella} \mid \text{rain}) = 0.8$, then $p(\text{rain}, \text{umbrella})$ is:`, a: { n: 0.4, tol: 0.001 }, x: R`$p(x, y) = p(y \mid x)\,p(x) = 0.8 \times 0.5 = 0.4$.`, r: 2 },
        { q: R`Bayes' rule lets you compute $p(y \mid x)$ from:`, o: [R`$p(x \mid y)$, $p(y)$ and $p(x)$`, R`$p(x)$ only`, R`$p(y)$ only`, "Nothing; it must be counted directly"], a: 0, x: R`$p(y \mid x) = \frac{p(x \mid y)\,p(y)}{p(x)}$.`, r: 3 },
        { q: "Which statements are true? (Select all that apply)", o: [R`$x \sim p$ means $x$ is drawn from distribution $p$`, "A generative model samples new data from a learned distribution", "Probabilities can be larger than 1", R`$\mathbb{E}[x]$ for a fair die is 3.5`], a: [0, 1, 3], x: "Probabilities never exceed 1.", r: 4 }
      ]
    },
    {
      id: "w0t2", title: "Exponents, logs and the sigma sign", lec: [], min: 16,
      hook: R`Multiply 0.9 by itself 200 times and your calculator shows 0.0000000007. Computers multiplying thousands of small probabilities run out of digits and get exactly 0. What trick lets them avoid this?`,
      reveal: R`<p>They take <b>logs</b>. A log turns multiplication into addition: $\log(a \times b) = \log a + \log b$. So instead of multiplying 200 tiny numbers, add 200 ordinary numbers: $200 \times \log 0.9 \approx -21$. That is why almost every loss in this course has a $\log$ in it.</p>`,
      cards: [
        { h: "Exponents and the special number e", b: R`<p>You know $2^3 = 2 \times 2 \times 2 = 8$. Two rules from Class 9 matter here: $a^m \times a^n = a^{m+n}$ and $a^{-n} = \frac{1}{a^n}$, so $2^{-1} = 0.5$ and $a^0 = 1$.</p>
          <p>Scientists love one particular base, the number $e \approx 2.718$. The function $e^x$ (also written $\exp(x)$) has two properties you will use:</p>
          <ul><li>$e^x$ is <b>always positive</b>, even when $x$ is negative: $e^{-3} \approx 0.05$.</li><li>It grows very fast for positive $x$: $e^{5} \approx 148$.</li></ul>
          <div class="plain">Whenever an AI model needs to turn any number (even a negative one) into something positive, it uses $e^x$.</div>`, f: ["expCurve", "The curve of e to the x: it never touches zero and shoots up on the right."] },
        { h: "The log undoes the exponent", b: R`<p>A <b>logarithm</b> answers: “what power gives me this number?”. $\log_2 8 = 3$ because $2^3 = 8$.</p>
          <p>The <b>natural log</b> $\ln x$ (often just written $\log x$ in AI papers) uses base $e$: $\ln e = 1$, $\ln 1 = 0$.</p>
          <div class="tablewrap"><table><tr><th>Rule</th><th>Example</th></tr>
          <tr><td>$\log(a b) = \log a + \log b$</td><td>products become sums</td></tr>
          <tr><td>$\log\left(\frac{a}{b}\right) = \log a - \log b$</td><td>divisions become differences</td></tr>
          <tr><td>$\log(a^n) = n \log a$</td><td>powers come down in front</td></tr>
          <tr><td>$\log 1 = 0$, and $\log x \lt 0$ when $0 \lt x \lt 1$</td><td>logs of probabilities are negative</td></tr></table></div>
          <p>Useful values: $\ln 2 \approx 0.693$, $\ln 0.5 \approx -0.693$, $\ln 0.1 \approx -2.303$.</p>`, w: "logexp",
          ask: { q: R`What is $\ln(1)$?`, o: ["1", "0", R`$e$`, "Undefined"], a: 1, x: R`$e^0 = 1$, so $\ln 1 = 0$.` } },
        { h: "Why a minus log measures “surprise”", b: R`<p>If an event has probability $p$, the quantity $-\log p$ is small when $p$ is close to 1 and huge when $p$ is close to 0:</p>
          <div class="tablewrap"><table><tr><th>$p$</th><th>1</th><th>0.9</th><th>0.5</th><th>0.1</th><th>0.01</th></tr><tr><td>$-\ln p$</td><td>0</td><td>0.105</td><td>0.693</td><td>2.303</td><td>4.605</td></tr></table></div>
          <div class="plain">If a model gave the correct answer a probability of 0.9, it is barely “surprised” (penalty 0.1). If it gave only 0.01, the penalty is 4.6. That penalty is exactly the <b>cross-entropy loss</b> you will meet in Week 1.</div>` },
        { h: "The sigma sign is a short way to write a sum", b: R`<p>The Greek capital letter sigma, $\Sigma$, means “add up”.</p>
          <div class="eq">$$\sum_{i=1}^{4} x_i = x_1 + x_2 + x_3 + x_4$$</div>
          <p>Read it as: “for $i$ going from 1 to 4, add up $x_i$”. The small $i$ under the letter is called an <b>index</b>; it just counts.</p>
          <div class="steps"><ol><li>Marks $x = [6, 8, 7, 9]$.</li><li>$\sum_{i=1}^{4} x_i = 30$.</li><li>The mean is $\frac{1}{4}\sum_{i=1}^{4} x_i = 7.5$. In this course you will see the mean written as $\frac{1}{n}\sum_{i=1}^{n} x_i$ all the time.</li></ol></div>
          <p>Its cousin $\prod$ (capital pi) means “multiply all of them”. Taking the log turns $\prod$ into $\Sigma$.</p>`,
          ask: { q: R`What is $\sum_{i=1}^{3} i^2$?`, o: ["6", "9", "14", "36"], a: 2, x: R`$1 + 4 + 9 = 14$.` } }
      ],
      keys: [R`$e \approx 2.718$; $e^x$ is always positive.`, R`$\ln$ undoes $e^x$: $\ln e = 1$, $\ln 1 = 0$.`, R`$\log(ab) = \log a + \log b$; $\log(a^n) = n \log a$.`, R`$-\log p$ is a penalty: 0 when $p = 1$, large when $p$ is tiny.`, R`$\sum_{i=1}^{n} x_i$ = add them all; mean = $\frac{1}{n}\sum x_i$.`],
      traps: [R`The log of a number between 0 and 1 is negative, so losses use $-\log$ to make them positive.`, R`$\log$ in AI papers usually means natural log $\ln$ (base $e$).`],
      quiz: [
        { q: R`Which is true for every real number $x$?`, o: [R`$e^x > 0$`, R`$e^x > 1$`, R`$e^x \lt 0$ when $x \lt 0$`, R`$e^x = 0$ when $x = 0$`], a: 0, x: R`$e^x$ is always positive; $e^0 = 1$.`, r: 0 },
        { q: R`Simplify $\log(a) + \log(b)$:`, o: [R`$\log(a + b)$`, R`$\log(ab)$`, R`$\log a \cdot \log b$`, R`$\log\left(\frac{a}{b}\right)$`], a: 1, x: "Logs turn products into sums.", r: 1 },
        { q: R`What is $-\ln(1)$?`, a: { n: 0, tol: 0.001 }, x: R`$\ln 1 = 0$. A model that is 100% sure of the right answer has zero loss.`, r: 2 },
        { q: R`Using $\ln 0.5 \approx -0.693$, what is $-\ln(0.5)$?`, a: { n: 0.693, tol: 0.01 }, x: "The minus sign flips it positive.", r: 2 },
        { q: R`What is $\sum_{i=1}^{4} 2i$?`, a: { n: 20, tol: 0 }, x: R`$2 + 4 + 6 + 8 = 20$.`, r: 3 },
        { q: R`Why do AI models add up $\log$ probabilities instead of multiplying probabilities? (Select all that apply)`, o: ["Multiplying many small numbers underflows to 0 on a computer", "Logs turn products into sums", "Logs make every probability bigger than 1", "Sums are easier to work with when training"], a: [0, 1, 3], x: "Logs of probabilities are negative, never bigger than 1.", r: 1 }
      ]
    },
    {
      id: "w0t3", title: "Vectors, dot products and matrices", lec: [], min: 16,
      hook: R`A computer cannot “see” a photo or “read” a word. It only handles numbers. How can the word “king” be closer in meaning to “queen” than to “banana”, if all the computer has is numbers?`,
      reveal: R`<p>Each word becomes a <b>vector</b>, a list of numbers such as $[0.8, 0.1, 0.6]$. Words with similar meanings get similar lists, so their arrows point in nearly the same direction. The <b>dot product</b> measures how much two arrows agree. This is how Week 9's word embeddings and Week 10's attention work.</p>`,
      cards: [
        { h: "A vector is a list of numbers", b: R`<p>A <b>vector</b> is an ordered list: $\mathbf{x} = [3, 4]$. With 2 numbers you can draw it as an arrow from $(0,0)$ to $(3,4)$, exactly like coordinate geometry.</p>
          <p>AI uses long vectors: a $28 \times 28$ grey photo becomes a vector of $784$ pixel brightnesses; a word might become a vector of 300 numbers. The count of numbers is the vector's <b>dimension</b>.</p>
          <p>The <b>length</b> of a vector comes from Pythagoras: $\|\mathbf{x}\| = \sqrt{3^2 + 4^2} = 5$.</p>`, f: ["vectorArrow", "The vector [3, 4] drawn as an arrow. Its length is 5 by Pythagoras."] },
        { h: "The dot product: multiply pairs, then add", b: R`<p>For two vectors of the same size, multiply matching entries and add:</p>
          <div class="eq">$$\mathbf{a} \cdot \mathbf{b} = \sum_i a_i b_i$$</div>
          <div class="steps"><ol><li>$\mathbf{a} = [1, 2, 3]$, $\mathbf{b} = [4, 0, -1]$.</li><li>Pairs: $1 \times 4 = 4$, $2 \times 0 = 0$, $3 \times (-1) = -3$.</li><li>Sum: $4 + 0 - 3 = 1$.</li></ol></div>
          <div class="plain">A big positive dot product means the arrows point the same way. Zero means they are at right angles (unrelated). Negative means they point in opposite directions.</div>
          <p><b>Cosine similarity</b> divides by the lengths so only direction counts: $\cos\theta = \dfrac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\|\,\|\mathbf{b}\|}$, a number between $-1$ and $1$.</p>`, w: "vectors",
          ask: { q: R`What is $[2, 3] \cdot [4, -1]$?`, o: ["5", "11", "8", R`$-3$`], a: 0, x: R`$2 \times 4 + 3 \times (-1) = 8 - 3 = 5$.` } },
        { h: "A neuron is a dot product plus a number", b: R`<p>The basic unit of a neural network, a <b>neuron</b>, does just this:</p>
          <div class="eq">$$z = \mathbf{w} \cdot \mathbf{x} + b$$</div>
          <p>$\mathbf{x}$ is the input, $\mathbf{w}$ is a list of <b>weights</b> (how much each input matters) and $b$ is the <b>bias</b> (a starting offset). Training a network means finding good $\mathbf{w}$ and $b$.</p>
          <div class="steps"><ol><li>Inputs $\mathbf{x} = [2, 1]$, weights $\mathbf{w} = [0.5, -1]$, bias $b = 0.5$.</li><li>$z = 0.5 \times 2 + (-1) \times 1 + 0.5 = 0.5$.</li></ol></div>` },
        { h: "A matrix is a table of numbers that does many dot products at once", b: R`<p>A <b>matrix</b> is a grid of numbers. Its <b>shape</b> is written rows $\times$ columns: a $2 \times 3$ matrix has 2 rows and 3 columns.</p>
          <p>Multiplying a matrix by a vector means: take the dot product of <b>each row</b> with the vector.</p>
          <div class="eq">$$\begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} \begin{bmatrix} 5 \\ 6 \end{bmatrix} = \begin{bmatrix} 1\cdot5 + 2\cdot6 \\ 3\cdot5 + 4\cdot6 \end{bmatrix} = \begin{bmatrix} 17 \\ 39 \end{bmatrix}$$</div>
          <div class="plain">A layer of many neurons is one matrix: each row holds one neuron's weights. So a whole layer is $\mathbf{z} = W\mathbf{x} + \mathbf{b}$.</div>
          <p>Counting is a common exam question: a layer taking 4 inputs to 3 neurons has a $3 \times 4$ weight matrix (12 weights) plus 3 biases = <b>15 parameters</b>.</p>`, f: ["layerMatrix", "Each neuron (row) dots its weights with the inputs."],
          ask: { q: "A layer maps 10 inputs to 5 neurons. How many parameters (weights + biases)?", o: ["50", "55", "15", "60"], a: 1, x: R`$10 \times 5 = 50$ weights + 5 biases = 55.` } }
      ],
      keys: [R`Vector = ordered list of numbers; dimension = how many numbers.`, R`Length $\|\mathbf{x}\| = \sqrt{\sum x_i^2}$.`, R`Dot product $\mathbf{a}\cdot\mathbf{b} = \sum a_i b_i$: large = same direction, 0 = unrelated.`, R`Cosine similarity $= \frac{\mathbf{a}\cdot\mathbf{b}}{\|\mathbf{a}\|\|\mathbf{b}\|} \in [-1, 1]$.`, R`Neuron: $z = \mathbf{w}\cdot\mathbf{x} + b$. Layer: $\mathbf{z} = W\mathbf{x} + \mathbf{b}$; parameters = inputs $\times$ outputs + outputs.`],
      traps: [R`Dot products need vectors of the same length.`, R`Do not forget the biases when counting parameters.`],
      quiz: [
        { q: R`What is the length of the vector $[6, 8]$?`, a: { n: 10, tol: 0 }, x: R`$\sqrt{36 + 64} = \sqrt{100} = 10$.`, r: 0 },
        { q: R`Compute $[1, 0, 2] \cdot [3, 5, 1]$.`, a: { n: 5, tol: 0 }, x: R`$3 + 0 + 2 = 5$.`, r: 1 },
        { q: R`Two word vectors have cosine similarity close to 1. This means the words are:`, o: ["Unrelated", "Similar in meaning", "Opposite in meaning", "Of equal length"], a: 1, x: "Cosine near 1 means the arrows point the same way.", r: 1 },
        { q: R`A neuron has weights $[1, 2]$, bias $-1$ and input $[3, 1]$. What is $z$?`, a: { n: 4, tol: 0 }, x: R`$1 \times 3 + 2 \times 1 - 1 = 4$.`, r: 2 },
        { q: R`What is the shape of the weight matrix for a layer taking 8 inputs to 4 neurons?`, o: [R`$4 \times 8$`, R`$8 \times 8$`, R`$4 \times 4$`, R`$12 \times 1$`], a: 0, x: "One row per neuron, one column per input.", r: 3 },
        { q: "A fully connected layer maps 784 inputs to 100 neurons. How many parameters?", a: { n: 78500, tol: 0 }, x: R`$784 \times 100 + 100 = 78{,}500$.`, r: 3 }
      ]
    },
    {
      id: "w0t4", title: "Slopes, gradients and learning by small steps", lec: [], min: 14,
      hook: R`You are blindfolded on a hillside and must reach the lowest point of the valley. You can only feel the ground under your feet. What is your strategy?`,
      reveal: R`<p>Feel which way the ground slopes down and take a small step that way. Repeat. That is <b>gradient descent</b>, the algorithm that trains every neural network in this course. The “ground” is the error (loss) and your position is the model's weights.</p>`,
      cards: [
        { h: "Slope tells you which way is downhill", b: R`<p>From coordinate geometry, the slope of a straight line is $\frac{\text{rise}}{\text{run}}$. For a curve, the slope changes from point to point; the slope at one point is called the <b>derivative</b>, written $\frac{dL}{dw}$ (“how much $L$ changes when $w$ changes a tiny bit”).</p>
          <p>For $L(w) = w^2$ the slope at any point is $2w$. At $w = 3$ the slope is $6$ (uphill to the right), at $w = -1$ it is $-2$ (uphill to the left), and at $w = 0$ it is $0$: the bottom.</p>
          <div class="plain">Positive slope: go left to go down. Negative slope: go right to go down. Zero slope: you are at a flat spot.</div>`, f: ["slopeCurve", "On the curve of w squared, the tangent line shows the slope at each point."] },
        { h: "The gradient descent rule", b: R`<p>Training repeats one simple update:</p>
          <div class="eq">$$w_{\text{new}} = w_{\text{old}} - \eta \times \text{slope}$$</div>
          <p>$\eta$ (Greek “eta”) is the <b>learning rate</b>, the size of each step. The minus sign means “go opposite to the slope”, i.e. downhill.</p>
          <div class="steps"><ol><li>$L(w) = w^2$, start at $w = 3$, $\eta = 0.1$.</li><li>Slope $= 2 \times 3 = 6$.</li><li>$w_{\text{new}} = 3 - 0.1 \times 6 = 2.4$. Closer to 0. Repeat and it keeps shrinking.</li></ol></div>`,
          ask: { q: R`With $L(w) = w^2$, $w = 2$ and $\eta = 0.25$, what is $w_{\text{new}}$?`, o: ["1", "1.5", "0", "2.5"], a: 0, x: R`Slope $= 4$; $2 - 0.25 \times 4 = 1$.` } },
        { h: "Too big or too small a step", b: R`<ul><li><b>Too small</b> $\eta$: you crawl, and training takes forever.</li><li><b>Too large</b> $\eta$: you jump over the valley and can bounce higher and higher (training “diverges”).</li><li><b>Just right</b>: you settle into the bottom in a few dozen steps.</li></ul>
          <p>Try all three in the model below. Week 1 then shows smarter step rules (momentum, Adam) that adapt the step size automatically.</p>
          <p>Real models have millions of weights, so the slope becomes a list of slopes, one per weight. That list is called the <b>gradient</b>, written $\nabla L$. The rule is the same for every weight.</p>`, w: "slope" },
        { h: "The chain rule: how blame flows backwards", b: R`<p>A network is a chain of steps: input → layer 1 → layer 2 → loss. To know how a weight in layer 1 affects the loss, multiply the slopes along the chain:</p>
          <div class="eq">$$\frac{dL}{dw} = \frac{dL}{dz_2} \times \frac{dz_2}{dz_1} \times \frac{dz_1}{dw}$$</div>
          <div class="analogy">If the price of petrol rises ₹2 per day and each rupee adds 3 rupees to a bus ticket, the ticket rises by $2 \times 3 = 6$ rupees per day.</div>
          <p>Computing these products from the loss back to the first layer is called <b>backpropagation</b>. One consequence you will meet in Week 1: if many of those slopes are small (less than 1), their product becomes tiny and early layers barely learn. That is the <b>vanishing gradient</b> problem.</p>`,
          ask: { q: R`Ten slopes of 0.25 are multiplied along a chain. The result is about:`, o: ["2.5", "0.000001", "0.25", "1"], a: 1, x: R`$0.25^{10} \approx 9.5 \times 10^{-7}$: the gradient has vanished.` } }
      ],
      keys: [R`Derivative $\frac{dL}{dw}$ = slope of the loss at the current weight.`, R`Gradient descent: $w \leftarrow w - \eta \cdot \text{slope}$.`, R`$\eta$ too small = slow; too large = overshoot or diverge.`, R`Gradient $\nabla L$ = list of slopes, one per weight.`, R`Chain rule multiplies slopes; backpropagation applies it from the loss backwards.`],
      traps: [R`We subtract the gradient (go downhill), we do not add it.`, R`A slope of zero means a flat spot, which might not be the lowest point overall.`],
      quiz: [
        { q: R`For $L(w) = w^2$, what is the slope at $w = 5$?`, a: { n: 10, tol: 0 }, x: R`Slope $= 2w = 10$.`, r: 0 },
        { q: R`Gradient descent updates a weight by:`, o: ["Adding the learning rate times the slope", "Subtracting the learning rate times the slope", "Setting it to zero", "Multiplying it by the slope"], a: 1, x: R`$w \leftarrow w - \eta \cdot \text{slope}$ moves downhill.`, r: 1 },
        { q: R`$L(w) = w^2$, $w = 4$, $\eta = 0.1$. What is the new $w$ after one step?`, a: { n: 3.2, tol: 0.001 }, x: R`Slope 8; $4 - 0.8 = 3.2$.`, r: 1 },
        { q: "The loss bounces up and grows larger after each step. The most likely cause:", o: ["Learning rate too large", "Learning rate too small", "Too much data", "The slope is zero"], a: 0, x: "Big steps overshoot the valley.", r: 2 },
        { q: "Backpropagation is:", o: ["Running the network on new data", "Using the chain rule to compute every weight's slope, from the loss backwards", "Adding more layers", "Randomly changing weights"], a: 1, x: "It is the chain rule applied layer by layer.", r: 3 },
        { q: "Which statements are true? (Select all that apply)", o: [R`The gradient $\nabla L$ holds one slope per weight`, "Multiplying many slopes smaller than 1 makes a tiny number", "A slope of 0 always means the global minimum", R`The learning rate is written $\eta$`], a: [0, 1, 3], x: "Zero slope only means a flat spot; it may be a local minimum or a saddle.", r: 3 }
      ]
    },
    {
      id: "w0t5", title: "Averages, spread and the bell curve", lec: [], min: 16,
      hook: R`Measure the heights of 1,000 Class 10 students and draw a bar chart. Whatever the school, the chart comes out the same shape. What shape, and why does every image-generating AI start from it?`,
      reveal: R`<p>A <b>bell curve</b>, also called the <b>normal</b> or <b>Gaussian</b> distribution: most values sit near the average and fewer and fewer lie far away. It is so easy to sample from that image generators (VAEs, GANs, diffusion) all begin by drawing random numbers from a bell curve and then reshaping them into a picture.</p>`,
      cards: [
        { h: "Mean, variance and standard deviation", b: R`<p>The <b>mean</b> $\mu$ (Greek “mu”) is the average: $\mu = \frac{1}{n}\sum x_i$.</p>
          <p>The <b>variance</b> $\sigma^2$ measures spread: the average squared distance from the mean, $\sigma^2 = \frac{1}{n}\sum (x_i - \mu)^2$. Its square root $\sigma$ (“sigma”) is the <b>standard deviation</b>, in the same units as the data.</p>
          <div class="steps"><ol><li>Data $[2, 4, 6]$: mean $\mu = 4$.</li><li>Squared distances: $4, 0, 4$. Variance $\sigma^2 = \frac{8}{3} \approx 2.67$.</li><li>$\sigma = \sqrt{2.67} \approx 1.63$.</li></ol></div>
          <div class="plain">Small $\sigma$: values huddle close to the mean. Large $\sigma$: they spread out.</div>`,
          ask: { q: R`Data $[5, 5, 5, 5]$ has variance:`, o: ["5", "0", "1", "25"], a: 1, x: "Every value equals the mean, so there is no spread." } },
        { h: "The Gaussian (normal) distribution", b: R`<p>The bell curve is fixed by just two numbers, its centre $\mu$ and its spread $\sigma$. We write it $\mathcal{N}(\mu, \sigma^2)$. Its formula is</p>
          <div class="eq">$$p(x) = \frac{1}{\sqrt{2\pi\sigma^2}}\, e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$</div>
          <p>You will not need to compute it by hand. What you need to remember:</p>
          <ul><li>About 68% of samples fall within $\mu \pm \sigma$, and about 95% within $\mu \pm 2\sigma$.</li><li>The <b>standard normal</b> is $\mathcal{N}(0, 1)$: centre 0, spread 1.</li></ul>`, f: ["bellBands", "The 68% and 95% bands of a bell curve."], w: "bell" },
        { h: "Reshaping a standard bell curve", b: R`<p>Here is a trick used in every VAE (Week 3). Draw $\varepsilon$ (“epsilon”) from the standard normal $\mathcal{N}(0, 1)$. Then</p>
          <div class="eq">$$z = \mu + \sigma \varepsilon$$</div>
          <p>is a sample from $\mathcal{N}(\mu, \sigma^2)$. Multiplying by $\sigma$ stretches the bell; adding $\mu$ slides it.</p>
          <div class="steps"><ol><li>Want $\mathcal{N}(10, 2^2)$. Draw $\varepsilon = 0.5$.</li><li>$z = 10 + 2 \times 0.5 = 11$.</li></ol></div>
          <p>Often models predict $\log\sigma^2$ instead of $\sigma$ (because it can be any number, even negative). Then $\sigma = e^{\frac{1}{2}\log\sigma^2}$.</p>`,
          ask: { q: R`$\mu = 3$, $\sigma = 0.5$, $\varepsilon = -2$. What is $z = \mu + \sigma\varepsilon$?`, o: ["2", "4", "1", R`$-1$`], a: 0, x: R`$3 + 0.5 \times (-2) = 2$.` } },
        { h: "Comparing two distributions", b: R`<p>Much of this course asks: “how different is the model's distribution $q$ from the real data's distribution $p$?”. If they match, the model generates realistic data.</p>
          <p>One common measure is the <b>KL divergence</b> (Week 3), built from logs of probability ratios:</p>
          <div class="eq">$$D_{\mathrm{KL}}(p \,\|\, q) = \sum_x p(x)\,\log\frac{p(x)}{q(x)}$$</div>
          <div class="plain">If $p$ and $q$ are identical, every ratio is 1, every $\log 1 = 0$, and the KL divergence is 0. The more they differ, the bigger it gets. It is never negative.</div>` }
      ],
      keys: [R`Mean $\mu = \frac{1}{n}\sum x_i$; variance $\sigma^2 = \frac{1}{n}\sum (x_i - \mu)^2$; standard deviation $\sigma$.`, R`Gaussian $\mathcal{N}(\mu, \sigma^2)$: about 68% within $\pm\sigma$, 95% within $\pm 2\sigma$.`, R`Standard normal $\mathcal{N}(0,1)$; $z = \mu + \sigma\varepsilon$ reshapes it.`, R`$\sigma = e^{\frac{1}{2}\log\sigma^2}$.`, R`KL divergence $\ge 0$ and is 0 only when the two distributions match.`],
      traps: [R`Variance is $\sigma^2$; standard deviation is $\sigma$. Read which one a question gives.`, R`$\mathcal{N}(0, 1)$ has variance 1, so its standard deviation is also 1.`],
      quiz: [
        { q: R`Mean of $[3, 7, 8]$?`, a: { n: 6, tol: 0 }, x: R`$\frac{18}{3} = 6$.`, r: 0 },
        { q: R`Variance of $[1, 3]$ (divide by $n$)?`, a: { n: 1, tol: 0.001 }, x: R`Mean 2; squared distances 1 and 1; $\frac{2}{2} = 1$.`, r: 0 },
        { q: R`In $\mathcal{N}(\mu, \sigma^2)$, about what fraction of samples lie within $\mu \pm \sigma$?`, o: ["50%", "68%", "95%", "100%"], a: 1, x: "The 68–95 rule.", r: 1 },
        { q: R`$\mu = 1$, $\sigma = 2$, $\varepsilon = 1.5$. Compute $z = \mu + \sigma\varepsilon$.`, a: { n: 4, tol: 0.001 }, x: R`$1 + 2 \times 1.5 = 4$.`, r: 2 },
        { q: R`A model outputs $\log\sigma^2 = 0$. What is $\sigma$?`, a: { n: 1, tol: 0.001 }, x: R`$\sigma = e^{0} = 1$.`, r: 2 },
        { q: R`The KL divergence between two identical distributions is:`, o: ["1", "0", "Negative", "Infinite"], a: 1, x: R`Every ratio is 1 and $\log 1 = 0$.`, r: 3 }
      ]
    }
  ],
  test: [
    { q: R`Of 200 photos, 80 show cats. 60 of the cat photos are indoors. What is $p(\text{indoors} \mid \text{cat})$?`, a: { n: 0.75, tol: 0.001 }, x: R`$\frac{60}{80} = 0.75$.`, t: "w0t1", r: 1 },
    { q: R`Which expression is Bayes' rule?`, o: [R`$p(y \mid x) = \frac{p(x \mid y)\,p(y)}{p(x)}$`, R`$p(y \mid x) = p(x)\,p(y)$`, R`$p(y \mid x) = p(x \mid y)$`, R`$p(y \mid x) = p(x) + p(y)$`], a: 0, x: "Swap the sides of the bar using the prior and the evidence.", t: "w0t1", r: 3 },
    { q: R`What is $\log(8)$ in base 2?`, a: { n: 3, tol: 0 }, x: R`$2^3 = 8$.`, t: "w0t2", r: 1 },
    { q: R`Which number is largest?`, o: [R`$-\ln 0.9$`, R`$-\ln 0.5$`, R`$-\ln 0.1$`, R`$-\ln 1$`], a: 2, x: R`The smaller the probability, the bigger the penalty $-\ln p$: $-\ln 0.1 \approx 2.30$.`, t: "w0t2", r: 2 },
    { q: R`Compute $\frac{1}{3}\sum_{i=1}^{3} x_i$ for $x = [4, 5, 9]$.`, a: { n: 6, tol: 0 }, x: "That is the mean: 18 / 3.", t: "w0t2", r: 3 },
    { q: R`Compute the dot product $[2, -1, 3] \cdot [1, 4, 2]$.`, a: { n: 4, tol: 0 }, x: R`$2 - 4 + 6 = 4$.`, t: "w0t3", r: 1 },
    { q: "A layer maps 3 inputs to 2 neurons. Which statements are true? (Select all that apply)", o: [R`The weight matrix is $2 \times 3$`, "It has 2 biases", "It has 8 parameters in total", "It has 6 parameters in total"], a: [0, 1, 2], x: R`$6$ weights + 2 biases = 8.`, t: "w0t3", r: 3 },
    { q: R`$L(w) = w^2$. Starting from $w = 1$ with $\eta = 0.5$, what is $w$ after one step?`, a: { n: 0, tol: 0.001 }, x: R`Slope 2; $1 - 0.5 \times 2 = 0$. You landed exactly on the minimum.`, t: "w0t4", r: 1 },
    { q: "Why can a very deep network suffer from vanishing gradients?", o: ["The chain rule multiplies many slopes; if they are below 1 the product becomes tiny", "There is too much training data", "The learning rate is always zero", "Biases cancel the weights"], a: 0, x: "Multiplying many small slopes shrinks the signal reaching early layers.", t: "w0t4", r: 3 },
    { q: R`To sample from $\mathcal{N}(5, 3^2)$ using $\varepsilon \sim \mathcal{N}(0,1)$, you compute:`, o: [R`$z = 5 + 3\varepsilon$`, R`$z = 3 + 5\varepsilon$`, R`$z = 5 + 9\varepsilon$`, R`$z = 5\varepsilon$`], a: 0, x: R`$z = \mu + \sigma\varepsilon$ with $\sigma = 3$ (the standard deviation, not the variance 9).`, t: "w0t5", r: 2 },
    { q: "Which statements about the KL divergence are true? (Select all that apply)", o: ["It is never negative", "It is 0 when the two distributions are identical", "It is built from logs of probability ratios", "It is always exactly 1"], a: [0, 1, 2], x: "KL measures mismatch: zero only for a perfect match.", t: "w0t5", r: 3 }
  ]
});
