---
title: "Greek & Hebrew Word Study"
description: "Rigorous linguistic and lexical analysis framework for biblical Greek (Koine) and biblical Hebrew/Aramaic words, integrating Strong's concordance, morphological parsing, semantic ranges, Septuagint (LXX) mapping, and fallacy prevention."
type: skill
source: "local://inbox/bible-study/greek-hebrew-word-study/SKILL.md"
topics:
  - ai
tags:
  - skills
  - agents
  - workflows
  - bible-study
status: filed
created: 2026-08-28
updated: 2026-08-30
---

# Greek & Hebrew Word Study Skill

Perform scholarly, context-grounded original language word studies for biblical Hebrew, Aramaic, and Koine Greek terms without committing common lexical fallacies.

## Triggers
- User asks for original Greek or Hebrew word analysis (e.g., "What does *Logos* mean in John 1?", "Analyze *elohim* in Psalm 82", "Explain *kephalē* in 1 Corinthians 11", "Examine *agapē* vs *phileō*").
- User requests lexical depth, Strong's number lookups, verb morphology, or semantic range definitions.
- User seeks Septuagint (LXX) translation equivalents for Old Testament terms in the New Testament.

## Standard Lexical Investigation Protocol

Follow this 6-step procedure for every target term:

```
[1. Identify & Parse] ➔ [2. Lexical & Strong's Mapping] ➔ [3. Corpus Distribution & LXX] 
        ➔ [4. Semantic Range Analysis] ➔ [5. Fallacy Audit] ➔ [6. Contextual Synthesis]
```

### Step 1: Identification and Morphological Parsing
1. **Identify the Manuscript Token**: Extract the exact inflected form from the underlying critical text (Nestle-Aland 28th / UBS 5th edition for Greek NT; Biblia Hebraica Stuttgartensia / MT for Hebrew OT).
2. **Root Lemma & Transliteration**: Provide the lexical headword in its standard dictionary form with standard academic transliteration.
3. **Strong's Number**: Provide Strong's Hebrew (H####) or Greek (G####) reference number.
4. **Full Morphological Parsing**:
   - **For Greek**: Part of speech, Tense, Voice, Mood, Case, Number, Gender, Degree (e.g., *Verb, Aorist Active Subjunctive, 3rd Person Singular* or *Noun, Dative Feminine Singular*).
   - **For Hebrew**: Part of speech, Stem (Qal, Niphal, Piel, Pual, Hiphil, Hophal, Hithpael), Aspect/Form (Perfect, Imperfect, Imperative, Infinitive Construct/Absolute, Participle), Person, Gender, Number, Pronominal Suffixes.

### Step 2: Lexicon & Authoritative Definitions
Consult standard scholarly lexicons:
- **Greek NT**: BDAG (*Bauer-Danker-Arndt-Gingrich*), Thayer, Louw-Nida (Semantic Domains), TDNT (*Kittel*).
- **Hebrew/Aramaic OT**: HALOT (*Koehler-Baumgartner*), BDB (*Brown-Driver-Briggs*), DCH (*Dictionary of Classical Hebrew*), TDOT.
- State the broad lexical semantic range (the full spectrum of possible meanings attested in ancient literature).

### Step 3: Corpus Distribution & Septuagint (LXX) Alignment
1. **Usage Frequency**: Note total occurrences in:
   - The immediate book/author (e.g., Johannine corpus, Pauline corpus, Lucan writings).
   - The entire Testament (Old Testament or New Testament).
2. **Septuagint (LXX) Mapping**:
   - For NT Greek terms: Identify which Hebrew word(s) the LXX translators commonly translated using this Greek term (e.g., *dikaiosynē* translating *tsedeq* / *tsedaqah*).
   - For OT Hebrew terms: Identify the Greek word chosen by the LXX translators.

### Step 4: Semantic Range vs. Immediate Contextual Meaning
Crucial distinction: A word carries a *range of possible meanings* (semantic domain), but in any given occurrence, the author intends **one specific meaning** determined by syntax, immediate sentence structure, and literary context.
- Outline the options within the semantic range.
- Provide syntactic and textual evidence for the specific meaning required by the immediate passage.

### Step 5: Lexical Fallacy Audit (MANDATORY CHECK)
Verify that the analysis does NOT commit any of James Barr's classic exegetical fallacies:
1. **Root Fallacy (Etymological Fallacy)**: Assuming the original or historical root of a word dictates its current meaning (e.g., claiming *dynamis* means "dynamite", or *monogenēs* means "only begotten" based on *gennaō* rather than *genos* / "unique, one-of-a-kind").
2. **Illegitimate Totality Transfer**: Reading all possible meanings from the entire semantic range into a single verse (e.g., applying all 8 definitions of *charis* into one use).
3. **Anachronism**: Reading later theological developments or modern English meanings back into the first-century ancient text.
4. **Word-Concept Fallacy**: Equating a single word with an entire theological concept (e.g., assuming biblical teaching on "fellowship" is exhausted by studying *koinōnia*).

### Step 6: Comparative Translation & Synthesis
1. Display a mini-matrix comparing how major modern translations render the term in this specific verse (ESV, NASB, NIV, KJV, NLT, CSB).
2. Conclude with a clear, concise theological synthesis explaining how this original language nuance clarifies the author's message.

---

## Concrete Corpus Examples

### Example 1: Greek Word Study — **λόγος** (*Logos*) in John 1:1, 14
- **Lemma**: λόγος (*logos*), Strong's **G3056**
- **Grammar in John 1:1**: Noun, Nominative Masculine Singular
- **Syntactic Function**: Subject of the equative clause *kai theos ēn ho logos* ("and the Word was God").
- **Semantic Range**: Word, speech, message, statement, reason, divine cosmic principle (Stoicism), divine creative agent (*Memra* in Jewish Targums).
- **Contextual Nuance**: John does not borrow from Stoic philosophy; he grounds *Logos* in Genesis 1 ("And God said...") and Jewish Second Temple *Memra* (the personified Word/Wisdom of Yahweh through whom creation and revelation occur). John 1:14 (*ho logos sarx egeneto* - "the Word became flesh") shatters Greek philosophical dualism where the ideal *logos* could never unite with material flesh.

### Example 2: Hebrew Word Study — **אֱלֹהִים** (*'Elohim*) in Psalm 82:1, 6
- **Lemma**: אֱלֹהִים (*'elohim*), Strong's **H430**
- **Grammar in Psalm 82:1**: 
  - Occurrence 1: *'Elohim nitsav ba'adat-'el* ("God takes his place in the divine council") — Noun, Plural in form, but governing a Singular Verb (*nitsav* = Niphal Participle Masculine Singular), referring to Yahweh, the singular Supreme Creator God.
  - Occurrence 2: *beqerev 'elohim yishpot* ("in the midst of the gods he holds judgment") — Noun, Plural in form and meaning, governing plural referents, denoting created spiritual beings (the Divine Council members/sons of God, *bene 'elohim*) appointed over nations (Deut 32:8–9) who are condemned to die like mortals (*ke'adam*) for ruling unjustly.
- **Fallacy Prevention**: Avoid assuming *'elohim* is a proper name or strictly monotheistic singular noun in every context; in Hebrew, *'elohim* is a category of existence ("spiritual being belonging to the heavenly realm"), of whom Yahweh is the uncreated, species-unique Lord.
