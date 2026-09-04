---
title: "Notes on LLM architectures"
description: "From GPT-2's MHA to xLSTM's constant-state recurrence: how KV-cache memory and attention compute drove nearly every major LLM architecture decision."
date: 2026-09-04T12:36:39-07:00
draft: true
authors:
  - name: theblackcat98
    link: https://github.com/theblackcat98
    image: https://github.com/theblackcat98.png
tags:
  - ai
  - llm
  - architecture
---

Ask "what are the different LLM architectures" and it sounds like a taxonomy question. It isn't. Spend an afternoon with [Sebastian Raschka's LLM Architecture Gallery](https://sebastianraschka.com/llm-architecture-gallery/) — a curated set of architecture cards covering everything from GPT-2 to the current frontier — and the real shape of the answer emerges: architectures are a trail of engineering decisions made against two concrete bottlenecks. Almost nothing in modern model design was invented for its own sake.

<!--more-->

## The two bottlenecks

**KV-cache memory.** To generate text efficiently, transformers cache each layer's keys and values for every previous token. That cache grows linearly with context — and "linear" gets brutal fast. The gallery's fact sheets include KV cache per token at bf16: GPT-2's classic MHA stack costs **300 KiB per token**. Do the math at GPT-2's "long" context of 1,024 tokens and it's fine — 300 MB. Stretch that same architecture to 128k tokens of context and a *single sequence* wants ~37.5 GB of cache, for a 1.5B-parameter model. The cache, not the weights, becomes the wall.

**Attention compute.** Self-attention compares every token against every other token — O(n²) in context length. Quadratic hurts twice: at training time on long documents, and at inference when prefilling a long prompt.

Nearly every architecture difference you'll see diagrammed is an attack on one of these two costs, or on training stability.

## The attention variants, each with a reason

- **MHA (multi-head attention)** — the GPT-2 original. Every query head keeps its own keys and values. Maximum quality per head, worst memory. OLMo 2 still ships it (with QK-norm), deliberately trading the 512 KiB/token cost for training stability and full transparency.
- **MQA → GQA (grouped-query attention)** — share one set of KV heads across many query heads. GQA is the quiet workhorse of the 2024+ generation: Llama 3's 8B uses it at 128 KiB/token, a 2.3× cut from GPT-2's recipe at a similar width. Quality loss turned out to be negligible.
- **MLA (multi-head latent attention)** — DeepSeek's move: project keys and values into a small latent space and cache *that*. DeepSeek V3 runs 671B total parameters with 128k context at **68.6 KiB per token** — less per-token cache than Llama 3 8B, in a model two orders of magnitude larger.
- **Sliding-window + global mixes** — Gemma 3's answer: 55 layers of cheap local sliding-window attention plus 11 global layers. Most token interactions only need neighbors; pay full attention only where it counts.
- **Sparse attention** — skip most of the n² comparisons entirely. A family of approaches rather than one trick, all chasing the same quadratic term.

## Leaving attention behind: recurrent state

The most aggressive answer to the KV-cache problem is to not have one. Pure recurrent architectures keep a **constant-size state** instead of a growing cache: memory per sequence is fixed, context is effectively unbounded, and generation cost per token never rises.

The practical example today is [xLSTM-7B from NX-AI](https://huggingface.co/NX-AI/xLSTM-7b) — a pure mLSTM-based model (xLSTM is the modernized LSTM line from NX-AI — Beck et al., 2024, out of the lab of Sepp Hochreiter, co-inventor of the original LSTM), pre-trained on ~2.3T tokens of DCLM-quality data with the `xlstm-jax` framework. Zero growing KV cache. No explicit context limit.

The honest scorecard: it's competitive within the ~7B class (MMLU 5-shot ≈ 0.589 on the card's lighteval numbers), but it does not yet match the stronger local models in the 27–35B range — Qwen3's dense and MoE variants. And nothing larger than 7B has been publicly released. The constant-state dream is real; the scale-up is still in progress.

## Hybrids: the pragmatic middle

Between "attention everywhere" and "attention nowhere" sits the hybrid stack, and 2025–2026's releases suggest it's where the industry is landing. Mix a few full-attention layers (for exact recall over long range) with many cheap recurrent or local layers. A current example from the gallery: a Qwen3.6-27B agent derivative running a 3:1 ratio of Gated DeltaNet (a linear-attention/recurrent form) to gated attention — 16 attention layers against 48 DeltaNet, cutting the cache to **64 KiB/token**. Jamba's attention-plus-Mamba mix made the same bet earlier.

## The orthogonal axis: dense vs. MoE

Worth separating because it solves a different problem. Mixture-of-Experts doesn't touch the attention math at all — it swaps the dense FFN for a router plus many expert FFNs, activating only a few per token. DeepSeek V3: 671B parameters total, 37B active per token (5.5%). You get the capacity of a giant with the per-token compute and cost of a mid-size model. That's why the biggest open models are all MoE now.

## The pattern

Raschka's gallery makes the meta-lesson visible. GPT-2 (2019): MHA, 1k context, 300 KiB/token. DeepSeek V3 (2024): MLA + sparse MoE, 128k context, 68.6 KiB/token — while being 450× larger. Six years of progress, and most of it reads as a changelog against two bottlenecks: cache memory and quadratic attention. The remaining frontier — constant-state recurrence at scale — is the one architecture family trying to delete the bottlenecks rather than ameliorate them.

Further reading: the [gallery itself](https://sebastianraschka.com/llm-architecture-gallery/) (with an architecture diff tool), and the [xLSTM-7B model card](https://huggingface.co/NX-AI/xLSTM-7b).
