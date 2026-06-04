# AGENTS.md — Grok Build Rules for grok-build-showcase

This file encodes project-specific instructions for Grok (and compatible agents). It is automatically discovered and appended to the system prompt when working in this repository (or any subdirectory).

**Purpose**: Make every Grok Build session in this repo maximally productive, safe, and consistent with the showcase's own best practices.

---

## Coding Standards

- **Language**: TypeScript (strict mode). All new code must be `.ts`.
- **Module system**: ESM only (`"type": "module"` in package.json). Use `import` / `export`.
- **Style**:
  - Prefer `const`, use `let` only when reassignment is required.
  - Use functional patterns and pure functions in `core/`.
  - Command handlers in `commands/` should be thin (parse args → call core → report).
  - 100 character line length soft limit.
  - Meaningful names. Avoid abbreviations except well-known ones (e.g. `cli`, `fs`).
- **Error handling**: Validate at system boundaries (CLI input, file reads, external data). Fail fast with clear messages.
- **No `any`**: Use `unknown` + type guards or proper interfaces.

---

## Build, Test & Verification

**Mandatory before claiming work complete** (on any non-trivial change):

1. `npm run typecheck`
2. `npm test`
3. Manual smoke test of the affected command(s) (`npm run dev -- <command> ...`)

For complex or risky work:
- Use the `check` skill (`/check` or by following its verifier subagent pattern) or manually spawn a verification subagent.
- Re-run the full test suite after fixes.
- A broken build or failing tests = automatic FAIL. Fix before proceeding.

**Test guidelines**:
- Place tests in `tests/`.
- Use real fixtures under `tests/fixtures/` (good-project vs minimal-project) rather than heavy mocking.
- Cover core logic (auditor, skill-parser, ignore handling) thoroughly.
- CLI integration can be lighter (focus on happy + error paths).

---

## Git & Version Control

- Branch names: `feature/`, `fix/`, `chore/`, `docs/` prefixes preferred.
- Commit messages: conventional commits style (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- Never commit directly to `main`. Use branches + PRs for anything non-trivial.
- Keep commits focused and atomic. Update tests/docs in the same commit when behavior changes.
- Run verification steps locally before pushing.

---

## Architecture Notes

```
src/
  cli.ts                 # Entry, commander setup, top-level routing
  commands/*.ts          # One file per top-level command (audit, skills, scaffold, demo)
  core/
    auditor.ts           # Main scanning + scoring logic
    skill-parser.ts      # Frontmatter + SKILL.md validation
    ignore.ts            # .grokignore + .gitignore loader + matcher
    reporter.ts          # Human + JSON output formatting
  utils/                 # Small pure helpers (fs wrappers, git helpers, etc.)
tests/fixtures/          # Self-contained mini-projects used by tests
.grok/skills/            # Project skills (highest priority). Version controlled.
```

- Keep core logic testable and free of side effects where possible.
- The CLI is the primary interface; a tiny HTTP demo server (if added later) must be optional.
- Skills and AGENTS.md are first-class deliverables — changes to them are as important as code changes.

---

## Agent Workflow Rules (Grok Build Specific)

### 1. Todo Tracking (Mandatory for 3+ step tasks)
- Open with `todo_write` (merge: false) defining the full list of distinct actions.
- Keep **exactly one** item `in_progress` at a time.
- Mark items `completed` **immediately** when done — never batch at the end of a turn.
- If a compaction occurs, reseed the todo list from the pre-compaction snapshot using `todo_write` (merge: false) as your *first* action.
- Do not end a turn with pending/in-progress todos unless a background subagent, monitor, or long-running command is legitimately driving the next step.

### 2. Plan Mode
Use `enter_plan_mode` (and eventually `exit_plan_mode`) for tasks with genuine ambiguity:
- Adding a new major command or changing the audit scoring model
- Significant refactoring or architecture shifts
- Introducing new subagent isolation or demo scenarios
- Any change where multiple reasonable approaches exist and user feedback early prevents rework

Do **not** use Plan Mode for obvious bug fixes, adding a test case, or simple doc updates.

### 3. Subagents & Parallelism
- Use `spawn_subagent` (the `task` tool) for independent work that can run in parallel:
  - One subagent per command implementation
  - Separate explorer vs implementer vs reviewer for larger features
  - Test writing while core logic is implemented
- Prefer `isolation: "worktree"` when the subagent will modify files.
- Use personas where appropriate (`implementer`, `reviewer`, `test-writer`).
- For "best of N" style exploration, follow patterns from the `best-of-n` skill (parallel candidates in worktrees, evaluate, pick winner, apply).
- Always save the returned `subagent_id` for `resume_from` when continuing.
- Parent must wait for children (`get_command_or_subagent_output` / `wait_commands_or_subagents`) and incorporate their results.

### 4. Skills
- Project skills live in `.grok/skills/<name>/SKILL.md` (highest priority).
- Write skills with the exact frontmatter format: `name`, `description` (specific trigger phrases), optional `when-to-use` / `argument-hint`.
- Include concrete, numbered steps and explicit tool references.
- Version control them. Update when the workflow evolves.
- The three skills in this repo (`project-auditor`, `skill-crafter`, `readiness-scorer`) are both documentation and active tools.

### 5. Verification & Self-Check
- Never declare a task "done" solely because code was written.
- For non-trivial work, run the verification workflow described in the `check` skill (or equivalent): trace review + code review + build/test + explicit `VERDICT: PASS/FAIL`.
- Fix all issues found before moving on. Iterate up to 3 times; escalate if needed.
- When using subagents for implementation, have a reviewer subagent or the `check` pattern review the result.

### 6. General Discipline
- Explore first (list, read, grep) before editing.
- Make the smallest change that solves the stated request. Avoid gold-plating.
- Update README, AGENTS.md, or skills when adding conventions or major features.
- If something is unclear, use `ask_user_question` rather than guessing.
- Prefer the dedicated file tools (`write`, `search_replace`, `read_file`, `list_dir`, `grep`) over raw shell for file operations.

---

## .grok/ Directory Layout

```
.grok/
├── AGENTS.md                 # This file (and any subdirectory variants)
├── .grokignore               # (optional at root) — patterns the agent should skip
└── skills/
    ├── <name>/
    │   └── SKILL.md
    └── ...
```

Skills and rules in `.grok/` take precedence over user-global ones.

---

## When in Doubt

- Re-read this file.
- Look at the shipped skills for concrete step-by-step examples.
- Run `gbs audit .` on this repo itself — it should score very high.
- Ask the user for clarification on requirements or trade-offs.

This AGENTS.md exists so that Grok (and future agents) can work in this repository with the same high-quality, self-reinforcing process that created it.

**Update this file when the project's conventions or agent expectations evolve.**
