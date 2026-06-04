# Contributing to grok-build-showcase

Thank you for helping improve this living reference for Grok Build!

## Development

- `npm install`
- `npm run dev -- <command>` for quick iteration (tsx)
- `npm run build`
- `npm test`
- `npm run typecheck`

**Before any commit** (see `AGENTS.md`):

- Typecheck + tests must pass
- Manual smoke of changed commands
- For larger changes, consider the `check` skill pattern or a reviewer subagent

## Adding or Improving Skills

The skills in `.grok/skills/` are first-class deliverables.

Use the `skill-crafter` skill (or `gbs scaffold skill <name>`) when creating new ones.

Make sure:
- `description` is specific enough for auto-invocation
- Steps are numbered and reference real tools
- The skill is tested (add a small example in its body or in the auditor tests)

## Project Rules

All agentic work in this repo should follow `AGENTS.md` (root) — todo tracking for 3+ steps, Plan Mode for ambiguous work, subagents for parallel tasks, verification loops, etc.

## Pull Requests

- Keep scope focused.
- Update tests and docs.
- If you change conventions, update `AGENTS.md` and/or the shipped skills.
- The CI matrix runs on Node 20 & 22.

This repo is meant to be forked as a template. Improvements that make the patterns clearer or more copyable are especially valuable.

## Questions?

Open an issue or use the skills/auditor on your own projects and report back what worked.

Thanks for growing the ecosystem of great Grok Build examples!
