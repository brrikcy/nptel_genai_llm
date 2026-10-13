COURSE.weeks.push({
  id: "w10", n: 10, title: "Large language models and prompting",
  tagline: "Transformer decoder, BPE/WordPiece, BERT, GPT, prompt engineering.",
  intro: "From architecture to the models you use every day: the Transformer decoder and subword tokenisation, encoder-only BERT, decoder-only GPT, and how to talk to an LLM with prompts (zero-, one- and few-shot, chain-of-thought, role and structured prompting). Lectures 59–63.",
  topics: [
    {
      id: "w10t1", title: "The Transformer decoder and subword tokenisation", lec: [59], min: 18, w: "bpe",
      hook: "A word-level vocabulary has never seen the word “unfriendliness”. A character-level model would need 14 steps to write it. Is there a middle ground that never meets an unknown word and still keeps sequences short?",
      reveal: "<p><b>Subword tokenisation</b>: frequent words stay whole, rare words split into known pieces (un + friend + li + ness). Byte-pair encoding builds this vocabulary by repeatedly merging the most frequent adjacent pair.</p>",
      cards: [
        { h: "Decoder layer, and how it connects to the encoder", b: `<div class="eq">y (shifted right) → Masked multi-head self-attention → Add&Norm → Encoder–decoder (cross) attention → Add&Norm → FFN → Add&Norm → Linear → Softmax</div>
          <ul><li><b>Masked self-attention</b> over the tokens generated so far.</li><li><b>Cross-attention</b>: queries from the decoder, keys and values from the final encoder output. This is the encoder–decoder connection.</li><li>The final linear layer maps to vocabulary size; softmax gives next-token probabilities.</li><li><b>Teacher forcing</b> in training: the decoder input is the true target shifted right by one, so all positions train in parallel under the mask.</li></ul>` },
        { h: "Byte-pair encoding (BPE)", b: `<ol><li>Start with characters (in GPT-2, bytes) plus an end-of-word marker.</li><li>Count all adjacent symbol pairs in the corpus.</li><li>Merge the most frequent pair into a new symbol and add it to the vocabulary.</li><li>Repeat until the target vocabulary size (e.g. 50k merges) is reached.</li></ol>
          <p>Lecture example: low, lower, lowest, slow, slower = 29 tokens (with end markers). Merge l+o (5×) → 24 → merge lo+w (5×) → 19 → merge low+e → 16. The vocabulary grows by one each step while the corpus gets shorter.</p>`, w: "bpe" },
        { h: "WordPiece and friends", b: `<div class="tablewrap"><table><tr><th>Tokeniser</th><th>Merge rule</th><th>Used by</th></tr><tr><td>BPE</td><td>Most frequent pair</td><td>GPT-2/3/4, RoBERTa, LLaMA (byte-level variants)</td></tr><tr><td>WordPiece</td><td>Pair that most increases the training-data likelihood (score = freq(ab) / (freq(a)·freq(b)))</td><td>BERT; continuation pieces are marked “##” (play ##ing)</td></tr><tr><td>Unigram / SentencePiece</td><td>Starts large and prunes by likelihood; works on raw text including spaces</td><td>T5, ALBERT, many multilingual models</td></tr></table></div>
          <p>Rule of thumb: an English token is about 4 characters, about ¾ of a word.</p>`,
          ask: { q: "In BERT's WordPiece output “play ##ing”, the ## means:", o: ["A hashtag", "The piece continues the previous token", "A masked token", "End of sentence"], a: 1, x: "## marks a non-initial subword piece." } }
      ],
      keys: ["Decoder layer: masked self-attention → cross-attention (Q from decoder, K,V from encoder) → FFN, each with Add&Norm.", "Teacher forcing: train on the shifted-right target in parallel.", "BPE: merge the most frequent adjacent pair repeatedly; WordPiece: merge by likelihood gain, ## prefix; SentencePiece/Unigram for raw text.", "Subwords avoid out-of-vocabulary words and keep sequences shorter than characters."],
      traps: ["Cross-attention keys and values come from the ENCODER.", "BPE merges by frequency, WordPiece by likelihood.", "Each merge adds one vocabulary entry and shortens the tokenised corpus."],
      quiz: [
        { q: "In the Transformer decoder's encoder–decoder attention, the keys and values come from:", o: ["The decoder's masked self-attention", "The encoder's final output", "The positional encodings", "The vocabulary embedding"], a: 1, x: "Queries come from the decoder.", r: 0 },
        { q: "BPE chooses the next merge by:", o: ["Maximising likelihood gain", "Picking the most frequent adjacent symbol pair", "Picking the longest word", "Random selection"], a: 1, x: "Frequency-based merging defines BPE.", r: 1 },
        { q: "For the corpus 'low lower lowest slow slower' with end-of-word markers (29 tokens), the first merge (l, o) occurs 5 times. How many tokens remain after this merge?", a: { n: 24, tol: 0 }, x: "Each of the 5 words loses one token: 29 − 5 = 24.", r: 1 },
        { q: "Which tokenisers are associated with which models? (Select all that apply)", o: ["WordPiece with BERT", "BPE with GPT-2", "SentencePiece with T5", "WordPiece with GPT-3"], a: [0, 1, 2], x: "GPT-3 uses byte-level BPE.", r: 2 },
        { q: "Teacher forcing during Transformer training means:", o: ["The model's own predictions are fed back during training", "The ground-truth previous tokens are fed as decoder input (shifted right)", "The teacher model is distilled", "Gradients are clipped"], a: 1, x: "This enables parallel training with the causal mask.", r: 0 }
      ]
    },
    {
      id: "w10t2", title: "BERT: the bidirectional encoder", lec: [60], min: 16,
      hook: "To understand “bank” in “I sat by the bank of the river”, you need the words on its right. A left-to-right language model can't see them. How do you pre-train a model that reads both directions without letting it cheat by seeing the answer?",
      reveal: "<p><b>Mask the word</b> and ask the model to predict it from both sides: masked language modelling. Hide 15% of the tokens and the model must use full bidirectional context, without ever seeing the hidden word.</p>",
      cards: [
        { h: "Architecture", b: `<ul><li><b>Encoder-only</b> Transformer stack, bidirectional self-attention, no causal mask.</li><li>BERT-Base: 12 layers, hidden size 768, 12 heads, ≈ 110M parameters. BERT-Large: 24 layers, 1024 hidden, 16 heads, ≈ 340M.</li><li>Input = token embeddings + <b>segment</b> embeddings (sentence A/B) + learned <b>position</b> embeddings. Special tokens: [CLS] at the start (its output summarises the sequence), [SEP] between and after sentences.</li><li>WordPiece vocabulary of about 30k.</li></ul>` },
        { h: "Pre-training objectives", b: `<ul><li><b>Masked Language Modelling (MLM)</b>: choose 15% of the tokens; of these, 80% are replaced by [MASK], 10% by a random token, and 10% left unchanged. Predict the originals. (The 80/10/10 split reduces the mismatch with fine-tuning, where [MASK] never appears.)</li><li><b>Next Sentence Prediction (NSP)</b>: given A and B, is B the actual next sentence? 50% true, 50% random. Uses the [CLS] output.</li></ul>`,
          ask: { q: "Of the 15% of tokens selected for MLM, what fraction are replaced by [MASK]?", o: ["100%", "80%", "50%", "10%"], a: 1, x: "80% [MASK], 10% random, 10% unchanged." } },
        { h: "Fine-tuning and variants", b: `<ul><li><b>Pre-train once, fine-tune per task</b> with a small task head: classification (on [CLS]), token tagging (NER), extractive QA (predict start and end positions), sentence-pair tasks.</li><li>BERT is a strong <b>understanding</b> model, not a free-text generator.</li><li>Variants: <b>RoBERTa</b> (drops NSP, more data, dynamic masking), <b>ALBERT</b> (parameter sharing, factorised embeddings, sentence-order prediction), <b>DistilBERT</b> (distilled, ~40% smaller and ~60% faster, ~97% of the performance), <b>SpanBERT</b>, <b>ELECTRA</b> (replaced-token detection).</li></ul>` }
      ],
      keys: ["BERT = encoder-only, bidirectional; Base 12 layers/768/12 heads/110M; Large 24/1024/16/340M.", "Inputs: token + segment + position embeddings; [CLS] and [SEP] tokens.", "MLM: 15% selected → 80% [MASK], 10% random, 10% unchanged. NSP: is B the next sentence?", "Fine-tune with small task heads; good for understanding, not open generation.", "RoBERTa drops NSP; DistilBERT is distilled and smaller; ALBERT shares parameters."],
      traps: ["BERT is bidirectional because it uses the encoder (no causal mask).", "NSP was later found to be of little use (RoBERTa removed it).", "[CLS] is used for sequence classification, [SEP] separates sentences."],
      quiz: [
        { q: "BERT's pre-training tasks are:", o: ["Next-token prediction only", "Masked language modelling and next sentence prediction", "Image captioning", "Machine translation"], a: 1, x: "MLM and NSP.", r: 1 },
        { q: "BERT is best described as:", o: ["A decoder-only autoregressive model", "An encoder-only bidirectional model", "An encoder–decoder model", "A recurrent model"], a: 1, x: "It stacks Transformer encoders.", r: 0 },
        { q: "A sentence has 200 tokens. Roughly how many tokens are selected for prediction in MLM?", a: { n: 30, tol: 0 }, x: "15% of 200 = 30.", r: 1 },
        { q: "Which statements about BERT inputs are true? (Select all that apply)", o: ["A [CLS] token is prepended", "[SEP] separates the two sentences", "Segment embeddings indicate sentence A or B", "A causal mask hides future tokens"], a: [0, 1, 2], x: "BERT has no causal mask.", r: 0 },
        { q: "Which BERT variant removed next sentence prediction and trained on more data with dynamic masking?", o: ["ALBERT", "DistilBERT", "RoBERTa", "GPT-2"], a: 2, x: "RoBERTa: a robustly optimised BERT.", r: 2 }
      ]
    },
    {
      id: "w10t3", title: "GPT: decoder-only large language models", lec: [61], min: 16,
      hook: "GPT is trained on one absurdly simple task: predict the next token. Nobody trained it to translate, summarise or write code, yet it does all three. Where do those skills come from?",
      reveal: "<p>To predict the next token across trillions of tokens of web text, books and code, the model must implicitly learn grammar, facts, reasoning patterns, translation pairs and code structure. Scale turns next-token prediction into general-purpose ability, and those skills can be invoked through prompts.</p>",
      cards: [
        { h: "Architecture and objective", b: `<ul><li><b>Decoder-only</b> Transformer: a stack of masked self-attention + FFN blocks, with <b>no encoder and no cross-attention</b>.</li><li><b>Causal language modelling</b>: maximise Σ_t log P(x_t | x_<t).</li><li><b>Autoregressive generation</b>: predict a token, append it, repeat until an end token or the length limit.</li><li>Learned positional embeddings (GPT-1/2/3); a fixed <b>context window</b> (GPT-2: 1024, GPT-3: 2048 tokens).</li></ul>`,
          ask: { q: "GPT's training objective is:", o: ["Masked language modelling", "Next-token prediction (causal LM)", "Next sentence prediction", "Contrastive image–text matching"], a: 1, x: "P(x_t | x_<t)." } },
        { h: "The GPT family", b: `<div class="tablewrap"><table><tr><th>Model</th><th>Year</th><th>Size</th><th>Key idea</th></tr><tr><td>GPT-1</td><td>2018</td><td>117M</td><td>Generative pre-training + supervised fine-tuning</td></tr><tr><td>GPT-2</td><td>2019</td><td>1.5B</td><td>Zero-shot task transfer from pure LM</td></tr><tr><td>GPT-3</td><td>2020</td><td>175B</td><td>In-context (few-shot) learning without gradient updates</td></tr><tr><td>InstructGPT / ChatGPT</td><td>2022</td><td>—</td><td>Instruction tuning + RLHF for alignment</td></tr></table></div>` },
        { h: "BERT vs GPT, and GPT's limitations", b: `<div class="tablewrap"><table><tr><th></th><th>BERT</th><th>GPT</th></tr><tr><td>Architecture</td><td>Encoder-only</td><td>Decoder-only</td></tr><tr><td>Attention</td><td>Bidirectional</td><td>Causal (left-to-right)</td></tr><tr><td>Objective</td><td>MLM + NSP</td><td>Next-token prediction</td></tr><tr><td>Best at</td><td>Understanding: classification, NER, extractive QA</td><td>Generation: text, code, chat, few-shot tasks</td></tr></table></div>
          <p><b>Limitations</b>: hallucination (fluent but false), a knowledge cutoff (static training data), a limited context window, biases from training data, cost, sensitivity to prompt wording, and weak exact arithmetic. Weeks 11–12 address several of these (RAG, evaluation, safety).</p>` }
      ],
      keys: ["GPT = decoder-only, causal masked self-attention, next-token prediction, autoregressive generation.", "GPT-1 117M → GPT-2 1.5B (zero-shot) → GPT-3 175B (few-shot in-context learning) → InstructGPT/ChatGPT (RLHF).", "BERT: encoder, bidirectional, understanding. GPT: decoder, causal, generation.", "Limitations: hallucination, knowledge cutoff, context limit, bias, cost."],
      traps: ["GPT has no cross-attention: there is no encoder.", "GPT-3's few-shot ability needs no fine-tuning (no weight updates).", "Causal masking is what makes GPT autoregressive."],
      quiz: [
        { q: "GPT models use which Transformer configuration?", o: ["Encoder-only", "Decoder-only", "Encoder–decoder", "No attention"], a: 1, x: "A stack of masked self-attention blocks.", r: 0 },
        { q: "How many parameters does GPT-3 (largest) have?", o: ["117 million", "1.5 billion", "175 billion", "1 trillion"], a: 2, x: "175B.", r: 1 },
        { q: "Which are limitations of GPT-style LLMs? (Select all that apply)", o: ["Hallucination of plausible but false facts", "A knowledge cutoff", "A finite context window", "Inability to generate text"], a: [0, 1, 2], x: "Generation is their core strength.", r: 2 },
        { q: "For extractive QA or named-entity recognition with a small fine-tuning budget, the classic choice is:", o: ["GPT-2 generation", "BERT fine-tuning", "A GAN", "A diffusion model"], a: 1, x: "Encoder models excel at understanding and labelling tasks.", r: 2 },
        { q: "Autoregressive generation means:", o: ["All tokens are produced at once", "Each new token is predicted from the previously generated ones and appended", "Tokens are generated right-to-left only", "The model regresses continuous values"], a: 1, x: "Generate, append, repeat.", r: 0 }
      ]
    },
    {
      id: "w10t4", title: "Prompt engineering", lec: [62, 63], min: 18, w: "promptgame",
      hook: "“Explain machine learning.” vs “Explain machine learning to first-year engineering students in 150 words, in simple language, with one real-world example.” Same model, same knowledge. Why is the second answer so much more useful?",
      reveal: "<p>The second prompt defines the <b>task</b>, the <b>audience</b>, the <b>length and format</b> and a <b>constraint</b>, which removes ambiguity. The model doesn't know more; it knows more precisely what you want. That is prompt engineering.</p>",
      cards: [
        { h: "What a prompt is and why it matters", b: `<p>A <b>prompt</b> is the input that guides an LLM's response. It may contain <b>instructions</b>, <b>questions</b>, <b>context</b>, <b>constraints</b> and <b>examples</b>. Better prompts lead to better responses.</p>
          <p>Prompts matter because they: define the task (summarise, translate, classify, code), provide context, <b>specify the audience</b>, control the output format, and reduce ambiguity.</p>
          <ul><li><b>Good prompts</b>: clear, context-rich, unambiguous, goal-oriented, specific.</li><li><b>Avoid</b>: vague instructions, missing context (invites hallucination), several unrelated questions in one prompt.</li></ul>` },
        { h: "The six techniques", b: `<div class="tablewrap"><table><tr><th>Technique</th><th>What you give</th><th>Typical uses</th></tr>
          <tr><td>Zero-shot</td><td>Only the instruction; relies on pre-trained knowledge</td><td>Summarisation, translation, sentiment, QA, grammar correction</td></tr>
          <tr><td>One-shot</td><td>Exactly one input→output example</td><td>Teaching a response format, keeping a writing style, labelling</td></tr>
          <tr><td>Few-shot</td><td>2–5 examples</td><td>Custom text classification, information extraction, domain-specific and reasoning tasks, intent detection</td></tr>
          <tr><td>Chain-of-thought (CoT)</td><td>Ask for step-by-step reasoning (“Think step by step”) or show worked steps</td><td>Arithmetic, multi-step logic</td></tr>
          <tr><td>Role prompting</td><td>A persona: “You are an experienced physics professor…”</td><td>Tone, depth and expertise control</td></tr>
          <tr><td>Structured output</td><td>A required format: JSON, table, bullet count</td><td>Extraction, downstream parsing</td></tr></table></div>
          <p>Lecture CoT example: notebooks $5, pens $2; 3 notebooks + 4 pens → 15 + 8 = <b>$23</b>, reasoning shown step by step.</p>`, w: "promptgame" },
        { h: "Hands-on: running an LLM", b: `<ul><li>Load an instruction-tuned model and tokenizer (e.g. with Hugging Face <code>transformers</code>: <code>AutoTokenizer</code>, <code>AutoModelForCausalLM</code>, or a <code>pipeline("text-generation")</code>).</li><li>Apply the chat template (system / user / assistant roles), tokenize, call <code>generate(max_new_tokens=…, do_sample=…, temperature=…, top_p=…)</code>, decode.</li><li>Compare zero-shot, few-shot and CoT prompts on the same task and observe the changes in accuracy and format.</li></ul>`,
          ask: { q: "“Translate to French: Where is the station?” with no examples is:", o: ["Zero-shot", "One-shot", "Few-shot", "Chain-of-thought"], a: 0, x: "Instruction only, no examples." } }
      ],
      keys: ["A prompt can contain instructions, questions, context, constraints and examples.", "Prompts define the task, give context, specify the audience, control the format and reduce ambiguity.", "Zero-shot (no examples), one-shot (1), few-shot (2–5), chain-of-thought (step-by-step reasoning), role (persona), structured output (JSON, bullets).", "Avoid vague instructions, missing context and multiple unrelated questions."],
      traps: ["Few-shot prompting is not fine-tuning: no weights change.", "CoT is defined by the reasoning steps, even when examples are also given (few-shot CoT).", "Missing context is a common cause of hallucination."],
      quiz: [
        { q: "Providing exactly one labelled example before the actual query is called:", o: ["Zero-shot", "One-shot", "Few-shot", "Role prompting"], a: 1, x: "One example.", r: 1 },
        { q: "Adding “Let's think step by step” to an arithmetic word problem is an example of:", o: ["Role prompting", "Chain-of-thought prompting", "Structured output prompting", "Zero-shot classification"], a: 1, x: "It elicits intermediate reasoning steps.", r: 1 },
        { q: "Which are characteristics of a good prompt according to the lecture? (Select all that apply)", o: ["Clear and specific", "Context-rich", "Goal-oriented", "Several unrelated questions combined to save time"], a: [0, 1, 2], x: "Unrelated questions confuse the model.", r: 0 },
        { q: "“You are an experienced nutritionist. Suggest a one-week vegetarian meal plan.” uses:", o: ["Role prompting", "Few-shot prompting", "Retrieval-augmented generation", "Chain-of-thought"], a: 0, x: "It assigns a persona.", r: 1 },
        { q: "A shop sells notebooks at $5 and pens at $2. A customer buys 3 notebooks and 4 pens. What total should a correct chain-of-thought response reach?", a: { n: 23, tol: 0 }, x: "3·5 + 4·2 = 15 + 8 = 23.", r: 1 }
      ]
    }
  ],
  test: [
    { q: "The Transformer decoder contains which attention sub-layers? (Select all that apply)", o: ["Masked self-attention", "Encoder–decoder (cross) attention", "Bidirectional self-attention over future target tokens", "No attention"], a: [0, 1], x: "The decoder cannot attend to future target tokens.", t: "w10t1", r: 0 },
    { q: "Which statement about subword tokenisation is true?", o: ["It produces more out-of-vocabulary words than word-level tokenisation", "Rare words are split into known pieces, avoiding unknown tokens", "It always splits text into single characters", "It is only used for images"], a: 1, x: "That is its main benefit.", t: "w10t1", r: 1 },
    { q: "BERT-Base has how many Transformer layers?", a: { n: 12, tol: 0 }, x: "12 layers, 768 hidden, 12 heads.", t: "w10t2", r: 0 },
    { q: "In BERT's MLM, a selected token is left unchanged in what percentage of cases?", a: { n: 10, tol: 0 }, x: "80% [MASK], 10% random, 10% unchanged.", t: "w10t2", r: 1 },
    { q: "Which model would you fine-tune for sentence classification using the [CLS] token?", o: ["GPT-2", "BERT", "StyleGAN", "DDPM"], a: 1, x: "[CLS] is BERT's sequence representation.", t: "w10t2", r: 2 },
    { q: "GPT-2 demonstrated that a large language model can perform tasks:", o: ["Only after task-specific fine-tuning", "Zero-shot, from the prompt alone", "Only with images", "Only with reinforcement learning"], a: 1, x: "GPT-2's paper: “Language Models are Unsupervised Multitask Learners”.", t: "w10t3", r: 1 },
    { q: "Which objective is used to pre-train GPT?", o: ["Σ log P(x_t | x_<t)", "Masked language modelling", "Contrastive loss", "Reconstruction + KL"], a: 0, x: "Causal language modelling.", t: "w10t3", r: 0 },
    { q: "A prompt contains two labelled examples and then a new input. This is:", o: ["Zero-shot", "One-shot", "Few-shot", "Role prompting"], a: 2, x: "Two to five examples = few-shot.", t: "w10t4", r: 1 },
    { q: "“Extract name, role and company from the text and return valid JSON with keys name, role, company.” is an example of:", o: ["Structured output prompting", "Chain-of-thought", "One-shot prompting", "Role prompting"], a: 0, x: "It fixes the output format.", t: "w10t4", r: 1 },
    { q: "Which prompt flaw most directly invites the model to hallucinate?", o: ["Specifying the audience", "Missing context the answer depends on", "Asking for bullet points", "Giving one example"], a: 1, x: "Without context the model fills gaps with plausible guesses.", t: "w10t4", r: 0 }
  ]
});
