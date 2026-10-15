COURSE.weeks.push({
  id: "w10", n: 10, title: "Large language models and prompting",
  tagline: "Transformer decoder, BPE/WordPiece, BERT, GPT, prompt engineering.",
  intro: R`From architecture to the models you use every day: the Transformer decoder and subword tokens, the encoder-only BERT, the decoder-only GPT, and how to talk to an LLM with prompts (zero-, one- and few-shot, chain-of-thought, role and structured prompting). Lectures 59–63.`,
  topics: [
    {
      id: "w10t1", title: "The Transformer decoder and subword tokenisation", lec: [59], min: 13,
      hook: R`A word-level vocabulary has never seen the word “unfriendliness”. A letter-by-letter model needs 14 steps to write it. Is there a middle way that never meets an unknown word and still keeps sequences short?`,
      reveal: R`<p><b>Subword tokenisation</b>: common words stay whole, rare words split into known pieces (un + friend + li + ness). <b>Byte-pair encoding</b> builds this vocabulary by repeatedly gluing together the most frequent neighbouring pair.</p>`,
      cards: [
        { h: "One decoder layer, and how it connects to the encoder", b: R`<div class="eq">target so far (shifted right) → masked self-attention → Add &amp; Norm → encoder–decoder (cross) attention → Add &amp; Norm → FFN → Add &amp; Norm → Linear → Softmax</div>
          <ul><li><b>Masked self-attention</b> looks only at the words generated so far (Week 9's causal mask).</li><li><b>Cross-attention</b>: queries from the decoder, keys and values from the encoder's final output. This is how the decoder “reads” the input sentence.</li><li>The final <b>Linear</b> layer turns each position's vector into one score per vocabulary word; <b>Softmax</b> turns those into next-word probabilities.</li></ul>
          <p><b>Why an extra sub-layer?</b> The encoder only has to understand the input. The decoder has two jobs: look at what it has already written (masked self-attention) <i>and</i> look at the input (cross-attention).</p>
          <p>The original Transformer has 6 decoder layers; <b>8 heads</b> (base model) or <b>16 heads</b> (Transformer-Big). Heads run side by side inside one attention sub-layer; they are not separate sub-layers.</p>`, f: ["decoderLayer", "A Transformer decoder layer: masked self-attention, then cross-attention to the encoder, then a feed-forward network."] },
        { h: "Teacher forcing and the original training", b: R`<ul><li><b>Teacher forcing</b>: during training the decoder is fed the <b>true</b> previous words (the target shifted right by one), not its own guesses. With the causal mask, every position can then be trained at once, in parallel.</li><li><b>Original training data</b>: WMT 2014 English–German (about <b>4.5 million</b> sentence pairs, tokenised with <b>BPE</b>) and WMT 2014 English–French (about <b>36 million</b> pairs, <b>WordPiece</b>).</li><li><b>Strengths</b>: parallel computation, good long-range modelling, scales well, state-of-the-art results; the foundation of BERT, GPT, T5 and LLaMA.</li><li><b>Limitations</b>: high memory use, attention cost grows as $O(n^2)$, needs large datasets, expensive to compute.</li></ul>` },
        { h: "Byte-pair encoding (BPE)", b: R`<ol><li>Start from single characters (GPT-2 uses bytes) plus an end-of-word marker.</li><li>Count every pair of neighbouring symbols in the text.</li><li>Glue the most frequent pair into one new symbol and add it to the vocabulary.</li><li>Repeat until the vocabulary is big enough (e.g. 50,000 merges).</li></ol>
          <div class="steps"><ol><li>Corpus: low, lower, lowest, slow, slower. With end markers that is 29 tokens.</li><li>Merge l+o (appears 5 times): each of the 5 words loses one token → $29 - 5 = 24$.</li><li>Merge lo+w (5 times) → 19. Merge low+e → 16.</li></ol></div>
          <p>Each merge adds one word-piece to the vocabulary and makes the tokenised text shorter. Frequent strings become single tokens; rare words split into pieces, so no word is ever “unknown”.</p>`, w: "bpe" },
        { h: "WordPiece and friends", b: R`<div class="tablewrap"><table><tr><th>Tokeniser</th><th>How it picks merges</th><th>Used by</th></tr><tr><td>BPE</td><td>The most frequent pair</td><td>GPT-2/3/4, RoBERTa, LLaMA (byte-level versions)</td></tr><tr><td>WordPiece</td><td>The pair that most improves the likelihood: score $= \frac{\text{freq}(ab)}{\text{freq}(a)\,\text{freq}(b)}$</td><td>BERT; continuation pieces are marked “##” (play ##ing)</td></tr><tr><td>Unigram / SentencePiece</td><td>Starts big and prunes; works on raw text including spaces</td><td>T5, ALBERT, many multilingual models</td></tr></table></div>
          <p>Examples: Cybersecurity = cyber + security; Microscope = micro + scope; Playing → play + ##ing, Played → play + ##ed, Player → play + ##er.</p>
          <p>Rule of thumb: one English token is about 4 characters, about $\frac{3}{4}$ of a word.</p>`,
          ask: { q: "In BERT's WordPiece output “play ##ing”, the ## means:", o: ["A hashtag", "The piece continues the previous token", "A masked token", "End of sentence"], a: 1, x: "## marks a piece that is not the start of a word." } }
      ],
      keys: ["Decoder layer: masked self-attention → cross-attention (Q from decoder, K and V from encoder) → FFN, each with Add & Norm; then Linear → Softmax.", "Teacher forcing: train on the true target shifted right, all positions in parallel.", "BPE: merge the most frequent neighbouring pair again and again; WordPiece: merge by likelihood gain, ## prefix; SentencePiece/Unigram works on raw text.", "Subwords avoid unknown words and keep sequences shorter than characters.", R`Original Transformer: 8 heads (16 in Big); En–De 4.5M pairs with BPE, En–Fr 36M with WordPiece; cost $O(n^2)$.`],
      traps: ["Cross-attention keys and values come from the ENCODER.", "BPE merges by frequency, WordPiece by likelihood.", "Each merge adds one vocabulary entry and shortens the tokenised text."],
      quiz: [
        { q: "In the Transformer decoder's encoder–decoder attention, the keys and values come from:", o: ["The decoder's masked self-attention", "The encoder's final output", "The positional encodings", "The vocabulary embedding"], a: 1, x: "Queries come from the decoder.", r: 0 },
        { q: "BPE chooses the next merge by:", o: ["Maximising likelihood gain", "Picking the most frequent neighbouring pair", "Picking the longest word", "Random selection"], a: 1, x: "Frequency-based merging defines BPE.", r: 2 },
        { q: "For the corpus “low lower lowest slow slower” with end-of-word markers (29 tokens), the first merge (l, o) occurs 5 times. How many tokens remain after this merge?", a: { n: 24, tol: 0 }, x: R`Each of the 5 words loses one token: $29 - 5 = 24$.`, r: 2 },
        { q: "Which tokenisers go with which models? (Select all that apply)", o: ["WordPiece with BERT", "BPE with GPT-2", "SentencePiece with T5", "WordPiece with GPT-3"], a: [0, 1, 2], x: "GPT-3 uses byte-level BPE.", r: 3 },
        { q: "Teacher forcing during Transformer training means:", o: ["The model's own predictions are fed back during training", "The true previous words are fed as decoder input (shifted right)", "A teacher model is distilled", "Gradients are clipped"], a: 1, x: "This allows parallel training with the causal mask.", r: 1 },
        { q: "How many attention heads did the original (base) Transformer use, and Transformer-Big?", o: ["4 and 8", "8 and 16", "12 and 24", "16 and 32"], a: 1, x: "8 heads (base), 16 heads (Big), side by side within one sub-layer.", r: 0 },
        { q: "The original Transformer's WMT 2014 English–German model used which tokenisation?", o: ["WordPiece", "Byte-pair encoding (BPE)", "Character-level", "Whitespace"], a: 1, x: "En–De (4.5M pairs) used BPE; En–Fr (36M pairs) used WordPiece.", r: 1 },
        { q: "Which are limitations of the Transformer listed in the course? (Select all that apply)", o: [R`Attention cost that grows as $O(n^2)$`, "High memory use", "Needs large datasets", "Cannot be parallelised"], a: [0, 1, 2], x: "Parallel computation is its main strength.", r: 1 }
      ]
    },
    {
      id: "w10t2", title: "BERT: the bidirectional encoder", lec: [60], min: 13,
      hook: R`To understand “bank” in “I sat by the bank of the river”, you need the words on its <i>right</i>. A left-to-right model cannot see them. How do you train a model that reads both directions without letting it cheat by seeing the answer?`,
      reveal: R`<p><b>Hide the word</b> and ask the model to guess it from both sides: <b>masked language modelling</b>. Hide 15% of the tokens and the model must use context from left and right, without ever seeing the hidden word.</p>`,
      cards: [
        { h: "Why BERT was needed (Lecture 60)", b: R`<p>BERT (Google, 2018; Devlin et al., NAACL 2019) fixed four limits of earlier models:</p>
          <ul><li><b>Static embeddings</b>: “I deposited money in the bank” and “the bank of the river” got one vector.</li><li><b>Left-to-right only</b>: “The movie was ____.” ignores what comes after.</li><li><b>Weak long-range understanding</b> in RNNs and LSTMs.</li><li><b>One model per task</b>: separate models for sentiment, question answering, named entities…</li></ul>
          <p><b>Why only the encoder?</b> BERT's goal is to <b>understand</b> text, not to write it: question answering (paragraph + question → “Paris”), sentiment (“I absolutely loved this movie” → Positive), named-entity recognition (“Dr. John visited AIIMS Hospital on 1st August 2025” → PER (person), ORG (organisation), DATE), and text classification.</p>` },
        { h: "Architecture and inputs", b: R`<ul><li><b>Encoder-only</b> Transformer, bidirectional self-attention, <b>no</b> causal mask.</li><li><b>BERT-Base</b>: 12 layers, hidden size 768, 12 heads, about 110 million parameters. <b>BERT-Large</b>: 24 layers, 1024, 16 heads, about 340 million.</li><li>WordPiece vocabulary of about 30,000.</li><li>Special tokens: <b>[CLS]</b> at the start (its final vector summarises the whole input, used for classification) and <b>[SEP]</b> between and after sentences.</li><li><b>Input embedding = token + position + segment</b>: the segment embedding says whether a token belongs to sentence A or sentence B.</li></ul>`, f: ["bertInput", "BERT's input: each token's vector is the sum of a token embedding, a segment embedding and a position embedding."] },
        { h: "Pre-training: two self-supervised tasks", b: R`<p>A <b>language model</b> learns how likely sequences of words are. BERT pre-trains on BooksCorpus + Wikipedia with two tasks that need no human labels:</p>
          <ul><li><b>Masked Language Modelling (MLM)</b>: pick 15% of the tokens. Of those, 80% become [MASK], 10% become a random token, 10% stay unchanged. Predict the originals. (“The boy is [MASK] football” → playing.) The 80/10/10 split avoids training only on [MASK], which never appears later.</li><li><b>Next Sentence Prediction (NSP)</b>: given sentences A and B, is B really the next sentence? “Rahul went to the grocery store.” + “He bought some milk.” → IsNext; + “The Eiffel Tower is in Paris.” → NotNext. 50% true, 50% random. Uses the [CLS] output.</li></ul>
          <div class="steps"><ol><li>A text has 200 tokens. 15% are picked: $0.15 \times 200 = 30$.</li><li>Of those 30: $0.8 \times 30 = 24$ become [MASK], 3 random, 3 unchanged.</li></ol></div>`, w: "mlm",
          ask: { q: "Of the 15% of tokens picked for MLM, what share are replaced by [MASK]?", o: ["100%", "80%", "50%", "10%"], a: 1, x: "80% [MASK], 10% random, 10% unchanged." } },
        { h: "Fine-tuning and the BERT family", b: R`<ul><li><b>Pre-train once (self-supervised), fine-tune per task (supervised)</b>: add a small output layer and train the <b>whole</b> BERT plus that layer on labelled data. Classification uses the [CLS] vector; tagging uses each token's vector; extractive question answering predicts the start and end of the answer span.</li><li>BERT is a strong <b>understanding</b> model, not a free-text writer.</li><li><b>RoBERTa</b>: drops NSP, more data, dynamic masking. <b>ALBERT</b>: shares parameters, smaller embeddings, sentence-order prediction. <b>DistilBERT</b>: a compressed, faster BERT keeping about <b>95%</b> of its performance. <b>SpanBERT</b>: masks whole spans. <b>ELECTRA</b> (Efficiently Learning an Encoder that Classifies Token Replacements Accurately): spots replaced tokens instead of predicting masked ones, needing less compute.</li></ul>` }
      ],
      keys: ["BERT = encoder-only, bidirectional; Base 12 layers / 768 / 12 heads / 110M; Large 24 / 1024 / 16 / 340M.", "Input = token + segment + position embeddings; [CLS] and [SEP] tokens.", "MLM: 15% picked → 80% [MASK], 10% random, 10% unchanged. NSP: is B the next sentence? (50/50)", "Pre-training self-supervised; fine-tuning supervised, whole model plus a small head.", "RoBERTa drops NSP; DistilBERT is smaller (~95%); ALBERT shares parameters; ELECTRA detects replaced tokens."],
      traps: ["BERT is bidirectional because it uses the encoder (no causal mask).", "NSP was later found to add little (RoBERTa removed it).", "[CLS] is used for classifying the whole input; [SEP] separates sentences."],
      quiz: [
        { q: "BERT's pre-training tasks are:", o: ["Next-token prediction only", "Masked language modelling and next sentence prediction", "Image captioning", "Machine translation"], a: 1, x: "MLM and NSP.", r: 2 },
        { q: "BERT is best described as:", o: ["A decoder-only model that writes left to right", "An encoder-only bidirectional model", "An encoder–decoder model", "A recurrent model"], a: 1, x: "It stacks Transformer encoders.", r: 1 },
        { q: "A text has 200 tokens. Roughly how many are picked for prediction in MLM?", a: { n: 30, tol: 0 }, x: R`15% of 200 $= 30$.`, r: 2 },
        { q: "Which statements about BERT inputs are true? (Select all that apply)", o: ["A [CLS] token is put at the start", "[SEP] separates the two sentences", "Segment embeddings mark sentence A or B", "A causal mask hides future tokens"], a: [0, 1, 2], x: "BERT has no causal mask.", r: 1 },
        { q: "Which BERT variant removed next sentence prediction and trained on more data with dynamic masking?", o: ["ALBERT", "DistilBERT", "RoBERTa", "GPT-2"], a: 2, x: "RoBERTa: a robustly optimised BERT.", r: 3 },
        { q: "BERT's input embedding for each token is the sum of:", o: ["Token + position embeddings only", "Token + position + segment embeddings", "Token + attention weights", "Character + word embeddings"], a: 1, x: "The segment embedding marks sentence A versus sentence B.", r: 1 },
        { q: "Which statement about BERT's two training stages is correct?", o: ["Both are supervised", "Pre-training is self-supervised; fine-tuning is supervised", "Pre-training is supervised; fine-tuning is unsupervised", "Fine-tuning freezes all BERT weights"], a: 1, x: "In fine-tuning the whole model and the new head are trained on labelled data.", r: 3 },
        { q: "In the example “Dr. John visited AIIMS Hospital on 1st August 2025”, “AIIMS Hospital” is tagged as:", o: ["PER", "ORG", "DATE", "LOC"], a: 1, x: "Organisation.", r: 0 }
      ]
    },
    {
      id: "w10t3", title: "GPT: decoder-only large language models", lec: [61], min: 12,
      hook: R`GPT is trained on one absurdly simple task: predict the next token. Nobody trained it to translate, summarise or write code, yet it does all three. Where do those skills come from?`,
      reveal: R`<p>To predict the next token across trillions of words of web text, books and code, the model has to pick up grammar, facts, reasoning patterns, translations and code structure along the way. Scale turns next-token prediction into general ability, and prompts call those skills up.</p>`,
      cards: [
        { h: "Architecture and objective", b: R`<ul><li><b>Decoder-only</b> Transformer: a stack of masked self-attention + FFN blocks. <b>No encoder and no cross-attention.</b></li><li><b>Causal language modelling</b>: make the real next token as likely as possible:
          $$\max \sum_t \log P(x_t \mid x_{\lt t})$$
          ($x_{\lt t}$ means all tokens before position $t$.)</li><li><b>Autoregressive generation</b>: predict a token, append it, predict again, until an end token or the length limit. “The capital of France is” → Paris → . → It → is → known → for → the → Eiffel → Tower.</li><li>Learned position embeddings; a fixed <b>context window</b> (GPT-1: 512 tokens, GPT-2: 1024, GPT-3: 2048).</li></ul>
          <p><b>Why decoder-only?</b> Writing means predicting the next word from the words already seen. An encoder's two-way attention would let the position predicting “mat” in “The cat sat on the mat” already see “mat”: <b>information leakage</b>. The causal mask prevents it.</p>`, w: "nextword",
          ask: { q: "GPT's training objective is:", o: ["Masked language modelling", "Next-token prediction (causal language modelling)", "Next sentence prediction", "Matching images with captions"], a: 1, x: R`$P(x_t \mid x_{\lt t})$.` } },
        { h: "The GPT family (Lecture 61)", b: R`<p>Timeline: GPT-1 (2018, the same year as BERT) → GPT-2 (2019) → GPT-3 (2020) → GPT-3.5 (2022) → GPT-4 (2023) → GPT-4o (2024) → GPT-5 (2025).</p>
          <p><b>Why GPT-1</b> (Radford et al., OpenAI): labelled data is limited and one model per task is expensive. So pre-train one language model on lots of unlabelled text by next-word prediction, then fine-tune that same model for each task.</p>
          <div class="tablewrap"><table><tr><th></th><th>GPT-1</th><th>GPT-2</th><th>GPT-3</th></tr><tr><td>Year</td><td>2018</td><td>2019</td><td>2020</td></tr><tr><td>Parameters</td><td>117 million</td><td>1.5 billion</td><td>175 billion</td></tr><tr><td>Training data</td><td>BooksCorpus (~5 GB, ~7,000 books)</td><td>WebText (~40 GB of web pages)</td><td>Much larger web + books mix</td></tr><tr><td>Context length</td><td>512</td><td>1024</td><td>2048</td></tr><tr><td>Vocabulary</td><td>40K BPE</td><td>50K BPE</td><td>50K BPE</td></tr><tr><td>Big idea</td><td>Pre-train + fine-tune</td><td>Zero-shot from the prompt alone</td><td>Few-shot learning from examples in the prompt, no weight updates</td></tr></table></div>
          <p>Then InstructGPT / ChatGPT (2022): instruction tuning + RLHF (Week 11) to follow requests and be helpful.</p>
          <p>GPT-1 fine-tuning tasks: classification, question answering, natural language inference (entailment / neutral / contradiction), semantic similarity, using start and end tokens; the end token's final vector is used for the prediction.</p>` },
        { h: "BERT vs GPT, and GPT's limits", b: R`<div class="tablewrap"><table><tr><th></th><th>BERT</th><th>GPT</th></tr><tr><td>Architecture</td><td>Encoder-only</td><td>Decoder-only</td></tr><tr><td>Attention</td><td>Both directions</td><td>Causal (left to right)</td></tr><tr><td>Training task</td><td>MLM + NSP</td><td>Next-token prediction</td></tr><tr><td>Best at</td><td>Understanding: classification, NER, extractive QA</td><td>Writing: text, code, chat, few-shot tasks</td></tr></table></div>
          <p>An <b>LLM</b> (large language model) is a Transformer trained on huge amounts of text with self-supervised next-token prediction, adaptable to many tasks.</p>
          <p><b>Limits</b>: hallucination (fluent but false), a knowledge cutoff (training data stops at a date), a limited context window, biases from training data, high cost, sensitivity to prompt wording, weak exact arithmetic, safety concerns. Weeks 11–12 tackle several of these.</p>
          <p><b>Hands-on (Lecture 63)</b>: a tiny decoder-only Transformer trained from scratch on characters (block size 64, $d_{\text{model}} = 128$, 4 heads, 2 layers, GELU; loss falls from 3.62 to about 0.16 in 400 steps). The causal mask is a lower-triangular matrix; the targets are the inputs shifted by one. DistilGPT-2's byte-level BPE (“transformer” → trans + former) is compared with BERT's WordPiece, and greedy, top-k and nucleus decoding are compared.</p>`, f: ["bertVsGpt", "BERT reads in both directions to fill a blank; GPT reads left to right to guess the next word."] }
      ],
      keys: ["GPT = decoder-only, causal masked self-attention, next-token prediction, generates one token at a time.", R`Objective: $\max \sum_t \log P(x_t \mid x_{\lt t})$.`, "GPT-1 117M (512 context, BooksCorpus) → GPT-2 1.5B (1024, WebText, zero-shot) → GPT-3 175B (2048, few-shot) → InstructGPT/ChatGPT (RLHF).", "BERT: encoder, two-way, understanding. GPT: decoder, causal, writing.", "Limits: hallucination, knowledge cutoff, context limit, bias, cost, prompt sensitivity."],
      traps: ["GPT has no cross-attention: there is no encoder.", "GPT-3's few-shot ability needs no fine-tuning (no weight updates).", "Causal masking is what lets GPT generate one token at a time without cheating."],
      quiz: [
        { q: "GPT models use which Transformer configuration?", o: ["Encoder-only", "Decoder-only", "Encoder–decoder", "No attention"], a: 1, x: "A stack of masked self-attention blocks.", r: 0 },
        { q: "How many parameters does GPT-3 (largest) have?", o: ["117 million", "1.5 billion", "175 billion", "1 trillion"], a: 2, x: "175 billion.", r: 1 },
        { q: "Which are limitations of GPT-style LLMs? (Select all that apply)", o: ["Hallucinating plausible but false facts", "A knowledge cutoff", "A finite context window", "Inability to generate text"], a: [0, 1, 2], x: "Generating text is their core strength.", r: 2 },
        { q: "For extractive question answering or named-entity recognition with a small fine-tuning budget, the classic choice is:", o: ["GPT-2 generation", "BERT fine-tuning", "A GAN", "A diffusion model"], a: 1, x: "Encoder models excel at understanding and labelling.", r: 2 },
        { q: "Autoregressive generation means:", o: ["All tokens are produced at once", "Each new token is predicted from the earlier ones and appended", "Tokens are generated right to left only", "The model predicts continuous values"], a: 1, x: "Generate, append, repeat.", r: 0 },
        { q: "GPT-1 was trained with a context length of:", o: ["128 tokens", "512 tokens", "1024 tokens", "2048 tokens"], a: 1, x: "GPT-1: 512; GPT-2: 1024.", r: 1 },
        { q: "Why can't a two-way (bidirectional) Transformer encoder be used directly for next-word generation?", o: ["It has no attention", "Two-way attention lets a position see the word it should predict (information leakage)", "It cannot process text", "It lacks positional encoding"], a: 1, x: "Generation needs causal masking.", r: 0 },
        { q: "GPT-2 was trained on which dataset?", o: ["BooksCorpus", "WebText (~40 GB)", "Wikipedia only", "ImageNet"], a: 1, x: "GPT-1 used BooksCorpus; GPT-2 used WebText.", r: 1 }
      ]
    },
    {
      id: "w10t4", title: "Prompt engineering", lec: [62, 63], min: 10,
      hook: R`“Explain machine learning.” vs “Explain machine learning to first-year engineering students in 150 words, in simple language, with one real-world example.” Same model, same knowledge. Why is the second answer so much more useful?`,
      reveal: R`<p>The second prompt states the <b>task</b>, the <b>audience</b>, the <b>length and format</b>, and a <b>constraint</b>, which removes guesswork. The model does not know more; it knows more precisely what you want. That is <b>prompt engineering</b>.</p>`,
      cards: [
        { h: "What a prompt is and why it matters", b: R`<p>A <b>prompt</b> is the input that guides an LLM's answer. It can contain <b>instructions</b>, <b>questions</b>, <b>context</b>, <b>constraints</b> and <b>examples</b>. Better prompts lead to better answers.</p>
          <p>Prompts matter because they: define the task (summarise, translate, classify, code), give context, <b>name the audience</b>, control the output format, and reduce ambiguity.</p>
          <ul><li><b>Good prompts</b> are clear, rich in context, unambiguous, goal-oriented and specific.</li><li><b>Avoid</b>: vague instructions, missing context (which invites hallucination), and several unrelated questions in one prompt.</li></ul>`, f: ["promptAnatomy", "The parts of a strong prompt."] },
        { h: "The six techniques", b: R`<div class="tablewrap"><table><tr><th>Technique</th><th>What you give</th><th>Typical uses</th></tr>
          <tr><td>Zero-shot</td><td>Only the instruction; relies on what the model already knows</td><td>Summaries, translation, sentiment, QA, grammar fixes</td></tr>
          <tr><td>One-shot</td><td>Exactly one input → output example</td><td>Showing a format, keeping a style, labelling</td></tr>
          <tr><td>Few-shot</td><td>2–5 examples</td><td>Custom classification, information extraction, specialised and reasoning tasks, intent detection</td></tr>
          <tr><td>Chain-of-thought (CoT)</td><td>Ask for step-by-step reasoning (“Think step by step”) or show worked steps</td><td>Arithmetic, multi-step logic</td></tr>
          <tr><td>Role prompting</td><td>A persona: “You are an experienced physics professor…”</td><td>Controlling tone, depth and expertise</td></tr>
          <tr><td>Structured output</td><td>A required format: JSON, a table, a bullet count</td><td>Extraction, feeding other programs</td></tr></table></div>
          <div class="steps"><ol><li>CoT example from the lecture: notebooks cost ₹5, pens cost ₹2; a customer buys 3 notebooks and 4 pens.</li><li>Notebooks: $3 \times 5 = 15$. Pens: $4 \times 2 = 8$.</li><li>Total: $15 + 8 = 23$. Showing the steps makes the model (and you) less likely to slip.</li></ol></div>
          <p>Few-shot prompting is <b>not</b> fine-tuning: the model's weights do not change; it just copies the pattern from the examples in the prompt (“in-context learning”).</p>`, w: "promptgame" },
        { h: "Hands-on: running an LLM", b: R`<ul><li>Load an instruction-tuned model and its tokenizer (e.g. Hugging Face <code>transformers</code>: <code>AutoTokenizer</code>, <code>AutoModelForCausalLM</code>, or <code>pipeline("text-generation")</code>).</li><li>Apply the chat template (system / user / assistant roles), tokenize, call <code>generate(max_new_tokens=…, do_sample=…, temperature=…, top_p=…)</code>, decode.</li><li>Compare zero-shot, few-shot and CoT prompts on the same task and watch accuracy and format change.</li></ul>`,
          ask: { q: "“Translate to French: Where is the station?” with no examples is:", o: ["Zero-shot", "One-shot", "Few-shot", "Chain-of-thought"], a: 0, x: "Instruction only, no examples." } }
      ],
      keys: ["A prompt can contain instructions, questions, context, constraints and examples.", "Prompts define the task, give context, name the audience, control the format and reduce ambiguity.", "Zero-shot (no examples), one-shot (1), few-shot (2–5), chain-of-thought (step-by-step), role (persona), structured output (JSON, bullets).", "Avoid vague instructions, missing context and several unrelated questions.", "Few-shot is in-context learning: no weights change."],
      traps: ["Few-shot prompting is not fine-tuning: no weights change.", "CoT is defined by the reasoning steps, even when examples are also given (few-shot CoT).", "Missing context is a common cause of hallucination."],
      quiz: [
        { q: "Giving exactly one labelled example before the actual question is called:", o: ["Zero-shot", "One-shot", "Few-shot", "Role prompting"], a: 1, x: "One example.", r: 1 },
        { q: "Adding “Let's think step by step” to an arithmetic word problem is an example of:", o: ["Role prompting", "Chain-of-thought prompting", "Structured output prompting", "Zero-shot classification"], a: 1, x: "It draws out the reasoning steps.", r: 1 },
        { q: "Which are features of a good prompt according to the lecture? (Select all that apply)", o: ["Clear and specific", "Rich in context", "Goal-oriented", "Several unrelated questions combined to save time"], a: [0, 1, 2], x: "Unrelated questions confuse the model.", r: 0 },
        { q: "“You are an experienced nutritionist. Suggest a one-week vegetarian meal plan.” uses:", o: ["Role prompting", "Few-shot prompting", "Retrieval-augmented generation", "Chain-of-thought"], a: 0, x: "It assigns a persona.", r: 1 },
        { q: "A shop sells notebooks at ₹5 and pens at ₹2. A customer buys 3 notebooks and 4 pens. What total should a correct chain-of-thought answer reach?", a: { n: 23, tol: 0 }, x: R`$3 \times 5 + 4 \times 2 = 15 + 8 = 23$.`, r: 1 }
      ]
    }
  ],
  test: [
    { q: "The Transformer decoder contains which attention sub-layers? (Select all that apply)", o: ["Masked self-attention", "Encoder–decoder (cross) attention", "Two-way self-attention over future target tokens", "No attention"], a: [0, 1], x: "The decoder cannot look at future target tokens.", t: "w10t1", r: 0 },
    { q: "Which statement about subword tokenisation is true?", o: ["It produces more unknown words than word-level tokenisation", "Rare words are split into known pieces, avoiding unknown tokens", "It always splits text into single characters", "It is only used for images"], a: 1, x: "That is its main benefit.", t: "w10t1", r: 2 },
    { q: "BERT-Base has how many Transformer layers?", a: { n: 12, tol: 0 }, x: "12 layers, 768 hidden, 12 heads.", t: "w10t2", r: 1 },
    { q: "In BERT's MLM, a picked token is left unchanged in what percentage of cases?", a: { n: 10, tol: 0 }, x: "80% [MASK], 10% random, 10% unchanged.", t: "w10t2", r: 2 },
    { q: "Which model would you fine-tune for sentence classification using the [CLS] token?", o: ["GPT-2", "BERT", "StyleGAN", "DDPM"], a: 1, x: "[CLS] is BERT's whole-input summary.", t: "w10t2", r: 3 },
    { q: "GPT-2 showed that a large language model can do tasks:", o: ["Only after task-specific fine-tuning", "Zero-shot, from the prompt alone", "Only with images", "Only with reinforcement learning"], a: 1, x: "GPT-2's paper: “Language Models are Unsupervised Multitask Learners”.", t: "w10t3", r: 1 },
    { q: "Which objective is used to pre-train GPT?", o: [R`$\sum_t \log P(x_t \mid x_{\lt t})$`, "Masked language modelling", "Contrastive loss", "Reconstruction + KL"], a: 0, x: "Causal language modelling.", t: "w10t3", r: 0 },
    { q: "A prompt contains two labelled examples and then a new input. This is:", o: ["Zero-shot", "One-shot", "Few-shot", "Role prompting"], a: 2, x: "Two to five examples = few-shot.", t: "w10t4", r: 1 },
    { q: "“Extract name, role and company from the text and return valid JSON with keys name, role, company.” is an example of:", o: ["Structured output prompting", "Chain-of-thought", "One-shot prompting", "Role prompting"], a: 0, x: "It fixes the output format.", t: "w10t4", r: 1 },
    { q: "Which prompt flaw most directly invites the model to hallucinate?", o: ["Naming the audience", "Missing context the answer depends on", "Asking for bullet points", "Giving one example"], a: 1, x: "Without context the model fills gaps with plausible guesses.", t: "w10t4", r: 0 },
    { q: "Which BERT variant learns by spotting replaced tokens instead of predicting masked ones?", o: ["RoBERTa", "ALBERT", "DistilBERT", "ELECTRA"], a: 3, x: "Efficiently Learning an Encoder that Classifies Token Replacements Accurately.", t: "w10t2", r: 3 },
    { q: "GPT-2 has a vocabulary of about 50K BPE tokens and context length 1024. GPT-1 had:", o: ["40K BPE, 512 tokens", "30K WordPiece, 512 tokens", "50K BPE, 2048 tokens", "10K characters, 256 tokens"], a: 0, x: "From Lecture 61's comparison table.", t: "w10t3", r: 1 }
  ]
});

COURSE.glossary.push(
  ["decoder layer", R`A Transformer block that writes output: masked self-attention, cross-attention to the encoder, then a feed-forward network.`, ["Transformer decoder"]],
  ["teacher forcing", R`Training a decoder by feeding it the true previous words instead of its own guesses.`],
  ["subword", R`A piece of a word, like “un”, “believ” or “able”.`, ["subwords", "subword tokenisation"]],
  ["byte-pair encoding", R`Building a subword vocabulary by repeatedly merging the most frequent neighbouring pair of symbols. Abbreviated BPE.`, ["BPE"]],
  ["WordPiece", R`BERT's subword method: merges the pair that most improves likelihood; continuation pieces start with ##.`],
  ["SentencePiece", R`A subword tokeniser that works directly on raw text, including spaces (used by T5).`, ["Unigram"]],
  ["vocabulary", R`The full list of tokens a model knows.`],
  ["BERT", R`Bidirectional Encoder Representations from Transformers: an encoder-only model pre-trained by filling in masked words.`],
  ["masked language modelling", R`Hiding some tokens and training the model to guess them from both sides. Abbreviated MLM.`, ["MLM", "masked language modeling"]],
  ["next sentence prediction", R`BERT's second pre-training task: is sentence B really the one that follows sentence A? Abbreviated NSP.`, ["NSP"]],
  ["[CLS]", R`BERT's special first token; its final vector summarises the whole input for classification.`],
  ["segment embedding", R`A learned vector added to each token to say whether it belongs to sentence A or B.`, ["segment embeddings"]],
  ["pre-training", R`The first, large training stage on unlabelled text (self-supervised).`, ["pre-train", "pre-trained"]],
  ["fine-tuning", R`Further training a pre-trained model on a smaller, labelled dataset for a specific task.`, ["fine-tune", "fine-tuned"]],
  ["self-supervised", R`Learning from unlabelled data by making up a task from the data itself (like guessing hidden words).`],
  ["named-entity recognition", R`Tagging names of people, organisations, places and dates in text. Abbreviated NER.`, ["NER"]],
  ["GPT", R`Generative Pre-trained Transformer: a decoder-only model trained to predict the next token.`],
  ["LLM", R`Large language model: a big Transformer trained on huge amounts of text by next-token prediction.`, ["LLMs", "large language model", "large language models"]],
  ["causal language modelling", R`Training to predict each token from the ones before it: $P(x_t \mid x_{\lt t})$.`, ["causal LM", "next-token prediction"]],
  ["autoregressive", R`Generating one item at a time, each based on the ones already generated.`],
  ["context window", R`The maximum number of tokens a model can look at at once.`],
  ["hallucination", R`A fluent, confident answer that is false or made up.`, ["hallucinate", "hallucinations"]],
  ["knowledge cutoff", R`The date after which a model's training data stops, so it does not know later events.`],
  ["prompt", R`The input text that tells an LLM what to do.`, ["prompts"]],
  ["prompt engineering", R`Designing prompts carefully (task, context, audience, format, examples) to get better answers.`],
  ["zero-shot", R`Asking a model to do a task with no examples, only instructions.`],
  ["one-shot", R`Giving exactly one example in the prompt.`],
  ["few-shot", R`Giving a few (2–5) examples in the prompt.`],
  ["in-context learning", R`A model picking up a task from examples in the prompt, with no change to its weights.`],
  ["chain-of-thought", R`Asking the model to reason step by step before answering. Abbreviated CoT.`, ["CoT"]],
  ["role prompting", R`Giving the model a persona, like “You are a physics teacher”.`],
  ["structured output", R`Asking for answers in a fixed format such as JSON or a table.`]
);
