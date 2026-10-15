# How the app borrows from Duolingo

The app now opens on a **learning path**, a single winding road of levels like Duolingo's. This note lists the Duolingo mechanics used, what each one does here, and what "finish every level and you pass" actually means.

## Duolingo's ideas, and how each is used here

| Duolingo mechanic | Why it works | In this app |
|---|---|---|
| **Learning path** (the old "skill tree"): one ordered road of small levels, the next one unlocked when you finish the last | Removes the "what do I study now?" decision and shows progress at a glance | Units 0–12 plus a final exam unit. Each topic has a **Lesson** level and a **Practice** level, each unit ends in a **Checkpoint**, and the path ends with **three mocks**. Locked levels cannot be opened. |
| **Bite-sized lessons**, one item per screen | Small steps keep working memory free, and a progress bar gives a constant sense of momentum | Lessons show one idea per screen: the puzzle first, then each card, then "Remember for the exam". Each card's quick check must be answered before you continue. |
| **Immediate feedback**: Check → green or red sheet → Continue | You learn the right answer while the question is still fresh | Every answer gets a green or red bottom sheet with the explanation, plus a link back to the exact card or lecture. |
| **Mistakes come back** within the lesson | A practice session ends only when you have got everything right | In Practice, a wrong question returns at the end of the queue. The level finishes only when every question has been answered correctly. |
| **Hearts** (lives) | Makes you think before tapping and discourages guessing | 5 hearts. You lose one for the first miss of each question (getting a repeated question wrong again costs nothing), and at 0 the session ends. They refill each day, by reviewing (each right answer gives one back) or with gems. |
| **XP and a daily goal** | A small, achievable target every day | XP for lessons (10), practice (15, +5 if perfect), checkpoints (30) and mocks (60). Daily goal choices are Casual 20, Regular 50, Serious 100 and Intense 150 XP. About 120 XP is one focused hour. |
| **Streak** (+ streak freeze) | Rewards coming back every day; daily exposure is what builds retention | The streak counts days in a row you met your daily goal. A streak freeze (bought with gems) covers one missed day. |
| **Gems and a shop** | A currency that rewards effort and gives you safety nets | Gems come from finishing levels and quests. They buy streak freezes (50) and heart refills (40). |
| **Daily quests** | Varied short-term goals | Three each day: earn your goal's XP, complete 2 levels, and get 8 answers right in a row. Each pays 10 gems. |
| **Combo, stars and celebrations** | Small rewards at the moment of success | A combo counter appears from 3 right in a row. Levels earn 1–3 stars for first-try accuracy. Finishing a level shows XP, accuracy, combo and gem tiles with confetti and a short sound (which you can mute). |
| **Spaced repetition** (Duolingo's half-life regression model) | Reviewing just before you would forget makes memory last | Every question you answer goes into a Leitner box and comes back after 1, 2, 4, 8 or 16 days. A miss sends it back to the start. The **Practice hub** serves the due questions. |
| **Checkpoints / unit tests** | Prove a whole unit before moving on | Each unit's section test is a checkpoint. It needs **80% on the first try**. If you miss, you are sent to practise the topics you missed, then retry. |

## Mechanics left out, on purpose

- **Leagues and leaderboards.** These need other real learners. Simulated rivals would be fake, and research on gamification misuse found that competition can push learners toward chasing points instead of learning ([Arxiv 2203.16175](https://arxiv.org/pdf/2203.16175)).
- **Ads and paywalls.** Duolingo's business mechanics; they have no learning value.

## "If I complete all the levels, I will pass"

Finishing the path means you have:

1. read every lesson (one idea per screen, every quick check answered);
2. answered **every** practice question correctly: 368 questions across 53 topics, with missed ones repeated until you get them right;
3. scored **≥ 80% on the first try** in all 13 unit checkpoints (159 questions);
4. scored **≥ 70% on each of three full, timed NPTEL-style mocks** (54–55 questions each) made of questions that appear nowhere else.

70% on a mock is about **52 of the 75 exam marks**. NPTEL needs at least **30/75** in the exam, and at least 40/100 overall. Passing three mocks of unseen questions at that level leaves a wide margin.

Honest limits:

- **Assignments are separate.** You must still score at least 10/25 on the weekly assignments on the NPTEL portal; this app cannot submit them.
- **Mock retakes repeat questions.** A retake reuses the same questions, so a second attempt is a weaker signal than the first. Treat your first score as the true one, and if you fail, repair the weeks it flags before retaking.
- **The real paper may differ** in wording and emphasis from these mocks. The mocks are written from the course's lectures, slides and tutorials, but they are not the official paper.

## Sources

- Duolingo's spaced-repetition model: B. Settles and B. Meeder, *A Trainable Spaced Repetition Model for Language Learning*, ACL 2016, [aclanthology.org/P16-1174](https://aclanthology.org/P16-1174/).
- Risks of gamification: *When Gamification Spoils Your Learning: A Qualitative Case Study of Gamification Misuse in a Language-Learning App*, [arxiv.org/pdf/2203.16175](https://arxiv.org/pdf/2203.16175).
- How streaks, XP and gems affect motivation (the effect differs between users): Lund University student thesis, [lup.lub.lu.se/student-papers/record/9229036](https://lup.lub.lu.se/student-papers/record/9229036).
- Streaks seen by learners as the most useful feature, a self-report study: [repositori.ukwms.ac.id/47113/6/BAB 5.pdf](https://repositori.ukwms.ac.id/47113/6/BAB%205.pdf).
