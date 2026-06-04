# grok-build-showcase

> **A living, executable showcase and practical toolkit for Grok Build (xAI).**

This repository was **created from scratch** using Grok 4.3 and the Grok Build CLI. It is designed to be the clearest possible reference for:

- How to set up a project for maximum agent productivity
- High-quality, reusable skills that encode repeatable workflows
- Strong verification culture (tests + CI + self-check loops)
- Demonstrations of Plan Mode, subagent patterns, and todo-driven work

[![Made with Grok Build](https://img.shields.io/badge/Made%20with-Grok%20Build-000000?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkwxMy41IDguNUwyMCAxMEwxMy41IDExLjVMMTEuNSAxOEwxMCAxMS41TDMuNSAxMEw5LjUgOC41TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==)](https://x.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

**→ https://github.com/cobusgreyling/grok-build-showcase**

---

## Why This Project?

Grok Build excels at long-horizon, tool-heavy tasks when the project gives it clear rules, tests, and reusable procedures (skills). This repo is intentionally **meta**:

- It ships the exact configuration and skills that make agent work reliable.
- The main artifact (`gbs` CLI) is a useful tool in its own right (project auditor + skill manager + scaffolder).
- The `demo` command visually explains subagent + best-of-n patterns without requiring a live Grok session.
- Everything is tested and CI'd so an agent (or human) can iterate safely.

Good project types for Grok Build (from research):
- Full-stack apps, libraries/SDKs, refactoring projects, monorepos, security/compliance work, and **tooling + docs + examples** repos like this one.

## Features

| Command                  | Description |
|--------------------------|-------------|
| `gbs audit [path]`       | Scans a directory for Grok Build readiness. Produces a 0-100 score + detailed findings for AGENTS.md, `.grok/skills/`, tests, CI, git hygiene, ignore files. Supports `--json` and `--md`. Respects `.grokignore`. |
| `gbs skills list`        | Lists all discoverable skills (project + user scope) with descriptions. |
| `gbs skills validate`    | Parses every `SKILL.md`, checks frontmatter, reports problems. |
| `gbs skills info <name>` | Shows full details for a specific skill. |
| `gbs scaffold skill <name>` | Generates a production-grade skill directory + `SKILL.md` following official best practices (name, description, steps, tool references). |
| `gbs scaffold agents-md [--write]` | Prints (or writes) a comprehensive starter `AGENTS.md` tailored for TypeScript/Node projects. |
| `gbs demo [scenario]`    | Runs an engaging, self-contained simulation of parallel subagent execution (inspired by `best-of-n` and real worktree isolation). Shows explorer, implementer, reviewer, and aggregator phases with a final "winner" selection. |

Example audit output (text):

```
Grok Readiness Score: 87/100  (excellent)

✓ AGENTS.md present (root) — 2.1k chars, good sections
✓ .grok/skills/ — 3 skills found, all valid frontmatter
✓ Tests: vitest configured + 12 tests passing
✓ CI: .github/workflows/ci.yml present
△ Git: clean working tree, 3 recent conventional commits
△ Recommendations:
  - Add "Run `npm test` before committing" explicitly in AGENTS.md
  - Consider a readiness-scorer skill (already shipping one!)
```

## Installation & Usage

```bash
# From source (during development)
git clone https://github.com/cobusgreyling/grok-build-showcase.git
cd grok-build-showcase
npm install
npm run build
npm link   # or use npx tsx src/cli.ts ...

# Global (after publish)
npm install -g grok-build-showcase
gbs --help
gbs audit ~/my-project
gbs demo subagents
```

## The .grok/ Directory — The Heart of the Showcase

This is what a **well-configured Grok Build project** looks like:

```
AGENTS.md                     # Project rules (loaded automatically — root level)
.grok/
└── skills/
    ├── project-auditor/      # Encodes how to perform deep project audits
    ├── skill-crafter/        # High-quality skill generator (used to create the others)
    └── readiness-scorer/     # Scores and explains Grok-friendliness
```

See [`AGENTS.md`](AGENTS.md) (repo root) for the full rule set (coding standards, mandatory verification, git discipline, when to use Plan Mode, subagent delegation strategy, etc.). The `.grok/skills/` directory holds the version-controlled, reusable skills.

The skills are real, version-controlled, and load with highest priority when you run Grok inside this repo.

## How This Repository Was Built with Grok Build

1. **Research phase** — Used web searches, page fetches, and local `.grok/` inspection to study the best existing examples (awesome-grok-build, PasteLocal, Kilo's webhook service case study, Morgan Linton's work, official user-guide docs on Plan Mode / subagents / skills / project rules).

2. **Explicit planning** — Opened with a structured todo list (12 distinct phases). One in-progress item at a time. Reseeded after any compaction (none occurred here).

3. **Scaffold & git discipline** — Clean `git init`, logical commits, `.gitignore` + `.grokignore`.

4. **Project rules & skills first** — Wrote a comprehensive `AGENTS.md` modeled directly on the official guidance (and improved for this TS + CLI domain). Created three focused skills using the exact frontmatter + step format recommended in the docs.

5. **Implementation with verification** — Core auditor, parser, CLI, demo, tests. Ran `npm test` frequently. The `check` skill pattern (and manual verification) was used at the end.

6. **Meta demonstration** — The `demo` command and the shipped skills are themselves small showcases of the parallelism and skill-crafting techniques the agent used while building the repo.

7. **Polish** — CI, excellent README telling the story, fixtures for tests, publish-ready package.json.

The process deliberately exercised the strengths that make Grok Build special: long context for research, tool use for exploration + code + shell, subagent concepts (simulated + real patterns in skills), mandatory verification before claiming done, and todo tracking for complex multi-step work.

## Project Structure

```
grok-build-showcase/
├── .grok/
│   ├── AGENTS.md
│   └── skills/...
├── .grokignore
├── .github/workflows/ci.yml
├── src/
│   ├── cli.ts
│   ├── commands/          # audit, skills, scaffold, demo
│   ├── core/              # auditor, skill-parser, reporter, ignore-loader
│   └── utils/
├── tests/
│   ├── fixtures/
│   │   ├── good-project/   # realistic ready project
│   │   └── minimal-project/
│   └── *.test.ts
├── package.json
├── README.md
└── ...
```

## Development

```bash
npm install
npm run dev -- --help
npm test
npm run build
```

The project uses Vitest, strict TypeScript, and ESM.

**Before committing (enforced by AGENTS.md + culture):**
- `npm run typecheck`
- `npm test`
- Manual smoke test of changed commands

## Contributing

PRs that improve the auditor heuristics, add new high-quality skills, or make the demo clearer are especially welcome.

When contributing, please:

- Follow the rules in `.grok/AGENTS.md`
- Add or update tests
- Run the full verification flow

This repo is intended to be forked and used as a **template** for new Grok Build projects.

## Related / Inspiration

- [awesome-grok-build](https://github.com/DominikTobureto/awesome-grok-build) — the canonical collection of skills and templates
- Kilo case study (webhook service built end-to-end with Grok Build 0.1)
- PasteLocal (real shipped OSS with explicit "Made with Grok Build" credits)
- Official docs (Plan Mode, subagents, skills, project rules)

## License

MIT — see [LICENSE](LICENSE).

---

**Made with Grok Build.** If you use this repo as a starting point or reference, consider adding a similar "Made with Grok Build" note and linking back — it helps grow the ecosystem of great agentic examples.
