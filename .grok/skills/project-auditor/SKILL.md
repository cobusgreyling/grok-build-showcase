---
name: project-auditor
description: >
  Perform a thorough Grok Build readiness audit on a project directory.
  Detects presence and quality of AGENTS.md, .grok/skills, test setup,
  CI configuration, git hygiene, and ignore files. Produces a 0-100 score
  plus actionable recommendations. Use when asked to "audit", "gbs audit",
  "check grok readiness", "is this project agent-friendly", "grok build readiness",
  or when building/using the gbs audit command.
when-to-use: Use for any project audit, readiness assessment, or when the gbs CLI audit command is invoked or needs implementation logic.
argument-hint: "<directory or '.'> [--json|--md]"
---

# Project Auditor Skill

You are an expert at evaluating how well a codebase is set up for productive use with Grok Build (and similar agentic coding tools).

## Goals
- Give an accurate 0-100 "Grok Readiness Score".
- Identify concrete strengths and gaps.
- Provide prioritized, actionable recommendations.
- Support both human-readable and machine-readable output.

## Steps

1. **Understand the target**
   - Accept a directory path (default to current working directory or `.`).
   - Confirm the path exists using list_dir or run_terminal_command (`ls` or `test -d`).

2. **Load ignore rules**
   - Read `.grokignore` (if present) and `.gitignore` (if present) from the target root.
   - Build an effective ignore matcher (respect both; .grokignore takes precedence for agent reads).
   - Never read files that would be ignored (node_modules, dist, .grok/sessions, large binaries, logs, etc.).

3. **Scan for Grok Build signals (use list_dir + read_file + grep selectively)**
   - Look for project rule files in this priority: `AGENTS.md`, `Agents.md`, `AGENT.md`, `CLAUDE.md` etc. (see official project-rules docs).
   - Count and inspect files under `.grok/skills/*/SKILL.md`.
   - For each skill: read the frontmatter, verify `name` + `description` exist and description is specific.
   - Detect test frameworks:
     - `package.json` → look for `vitest`, `jest`, `mocha`, `ava`, `tap`, `scripts.test`
     - `pyproject.toml` / `pytest.ini` / `setup.cfg` for pytest
     - `go.mod` + `_test.go` files, etc.
   - Detect CI:
     - `.github/workflows/` (any `*.yml` or `*.yaml`)
     - `.gitlab-ci.yml`, `Jenkinsfile`, `circle.yml`, `buildkite.yml`, etc.
   - Git hygiene:
     - Is it a git repo? (`git rev-parse --is-inside-work-tree`)
     - Recent commits, clean/dirty status, branch name.
   - Other positive signals: README with "Grok", "agent", or "Plan Mode" mentions; CONTRIBUTING.md; .grok/ other dirs (hooks, agents).

4. **Score the project (0-100)**
   Base scoring on these weighted signals (adjust reasonably for project type):
   - AGENTS.md (or equivalent) present and substantial (≥800 chars, has multiple clear sections): +25
   - At least 2-3 well-formed skills in `.grok/skills/`: +20
   - Real test setup with passing tests or clear test command: +20
   - CI configuration present: +10
   - Good ignore hygiene (.grokignore present or comprehensive .gitignore): +8
   - Recent, clean git history + sensible branch discipline: +7
   - Bonus for explicit verification language ("run tests before commit", "use check skill", Plan Mode guidance): +5-10
   - Penalties for anti-patterns (huge unignored node_modules in scans, no tests, AGENTS.md is just a one-liner, etc.)

   Produce a single integer score and a short justification.

5. **Generate recommendations**
   - Always give 2-5 concrete, prioritized next actions.
   - Examples: "Add a readiness-scorer skill", "Document the test command in AGENTS.md", "Create .grokignore", "Add a GitHub Action that runs `npm test` on PRs".

6. **Output**
   - Human mode (default): nice formatted report with score, ✓/△/✗ bullets, and recommendations list.
   - `--json`: machine-readable object with score, findings[], recommendations[].
   - `--md`: markdown suitable for pasting into issues or PRs.
   - If the auditor itself is being implemented, emit the exact data structures the CLI will render.

## Important Principles
- Be evidence-based. Quote file paths, char counts, and specific signals you actually read.
- Respect ignore files strictly — do not waste tokens or time on noise.
- A project without any Grok signals can still score 30-40 if it has excellent tests + CI + clean git (the basics transfer).
- The goal is improvement, not shaming. Frame gaps positively ("Opportunity: ...").

## Tool Usage Notes
- Prefer `list_dir`, `read_file`, `grep`, and targeted `run_terminal_command` (for git).
- For large trees, start at root, then drill into promising subdirs only.
- When auditing this repo itself, expect a very high score and use it as the "good-project" reference.

This skill can (and should) be used both interactively and by the `gbs` CLI implementation.
