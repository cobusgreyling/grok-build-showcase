---
name: readiness-scorer
description: >
  Calculate and explain a "Grok Readiness Score" (0-100) for a project based
  on concrete signals: quality of AGENTS.md / project rules, quantity and
  validity of skills, test/CI presence, git hygiene, ignore configuration,
  and verification culture. Use when asked to "score", "readiness score",
  "grok score", "how agent friendly is this", or as part of an audit workflow
  or the gbs audit implementation.
when-to-use: Use for scoring projects, generating the numeric score + justification in audits, or when the auditor needs the scoring logic extracted.
argument-hint: "<audit findings object or key signals>"
---

# Readiness Scorer

You are the specialist that turns raw signals into a defensible, explainable 0-100 score plus clear rationale.

## Core Signals & Weights (guideline — adjust for project type)

| Signal | Weight | Good Example | Weak Example |
|--------|--------|--------------|--------------|
| Root AGENTS.md (or equiv) present + substantial | 25 | 2k+ chars, multiple sections, agent workflow rules | 3-line file or missing |
| .grok/skills/ with 2+ valid skills | 20 | Skills have rich descriptions + numbered steps + tool refs | 0-1 skills or broken frontmatter |
| Test framework + tests exist | 20 | vitest/jest/pytest + actual *.test.* files that run | No tests or only example tests |
| CI configuration | 10 | .github/workflows/ci.yml that runs test + build | No CI |
| Ignore hygiene (.grokignore or strong .gitignore) | 8 | Explicit .grokignore + node_modules/dist ignored | Everything unignored |
| Git discipline (clean history, recent activity) | 7 | Main branch, conventional commits, clean status | Dirty tree, no commits, huge binary blobs |
| Explicit verification language | 5-10 | "run tests before commit", "use /check", "Plan Mode for ambiguous work" | None |

Base score starts at 30 (a clean, tested repo with git is already decent for agents). Add/subtract per the table.

## Process

1. Receive either:
   - A set of pre-collected findings (preferred when called from auditor), or
   - A target directory — in which case you may perform a lightweight scan yourself (respect ignores).

2. Evaluate each signal with evidence (file paths, sizes, excerpts).

3. Compute the integer score (0-100). Be consistent; do not inflate.

4. Produce:
   - The numeric score
   - A one-sentence overall assessment ("Excellent — this project was built to be worked on by agents.")
   - 3-6 bullet findings (✓ strengths, △ opportunities, ✗ gaps)
   - 2-5 prioritized recommendations (the most leveraged improvements first)

5. For JSON consumers, return a structured object:
   ```json
   {
     "score": 87,
     "assessment": "...",
     "findings": [{"type": "strength"|"opportunity"|"gap", "signal": "...", "detail": "..."}],
     "recommendations": ["..."]
   }
   ```

## Principles

- Evidence over vibes. Always cite the concrete file or output you saw.
- Be fair across languages (a well-set-up Python project with pytest + AGENTS.md should score comparably to a TS one with vitest).
- A brand new project can legitimately score 55-65 if it has a great AGENTS.md + tests + CI from day one.
- Never give 100 unless every major signal is strong *and* the project has been used successfully with agents (self-referential proof).

## When Used by the Auditor

The auditor collects raw signals and calls you (or implements equivalent logic) for the final score and explanation. Keep the heuristic in this skill so it can be improved independently and reused by humans or other tools.

This skill ships with the grok-build-showcase as both an example of focused skill design and a live component of the audit feature.
