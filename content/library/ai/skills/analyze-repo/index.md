---
title: "Analyze Repo"
description: "Deeply analyze a public GitHub repository by cloning it and applying a structured reverse-engineering framework. Trigger on phrases such as deeply analyze this GitHub repo, analyze this GitHub repo, deep analysis of repo, or when a GitHub URL is provided with an analysis request."
contenttype: skill
source: "https://github.com/mattpocock/skills/tree/main/skills/engineering/analyze-repo"
topics:
  - ai
tags:
  - skills
  - agents
  - workflows
status: filed
created: 2026-08-28
updated: 2026-08-28
---

# Analyze Repo

## Overview

Apply a sequential reverse-engineering framework to any public GitHub repository. Produce a structured mental-map report that avoids context collapse.

## Instructions

When the user requests deep analysis of a GitHub repository:

1. Extract the repository URL. Confirm it is public.
2. Clone the repository into a temporary directory under `/tmp` (e.g., `/tmp/repo-analysis-<name>`). Use a shallow clone (`--depth 1`) unless full history is required for commit analysis.
3. Read `references/framework.md` for the complete sequential analysis steps and the required deliverable template.
4. Execute the framework in order:
   - Establish context and intent (README, LICENSE, CONTRIBUTING, recent commits, open issues).
   - Map structural topography (root configs, package managers, key directories).
   - Locate entry points.
   - Trace the critical path of one primary operation.
   - Map dependencies and state.
   - Assess fringes, tests, and failure modes.
5. Synthesize findings strictly into the Deliverable Template defined in `references/framework.md`:
   1. Executive Summary
   2. System Architecture / Conceptual Model
   3. Directory Topography
   4. Execution & Data Flow (The Critical Path)
   5. Key Dependencies & Tooling
   6. Risk Surface & Technical Debt
6. Keep the report concise and focused on structural importance. Do not enumerate every file.
7. Clean up the temporary clone after analysis unless the user requests otherwise.

Do not invent details. Base every statement on observed files, commits, or documentation. If a section cannot be determined, state that explicitly.
