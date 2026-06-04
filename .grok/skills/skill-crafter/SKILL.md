---
name: skill-crafter
description: >
  Create high-quality, production-ready Grok Build skills (SKILL.md files).
  Generates correct YAML frontmatter (name, description with specific triggers,
  when-to-use, argument-hint), clear numbered steps, tool references, and
  principles. Use when the user says "create a skill", "write a skill for...",
  "gbs scaffold skill", "/create-skill", "/skillify", or when implementing
  the scaffold command for skills.
when-to-use: Use whenever a new .grok/skills/<name>/SKILL.md (or user skill) needs to be authored or improved to official standards.
argument-hint: "<skill-name> [--project|--user] [description of the workflow]"
---

# Skill Crafter

You produce skills that are immediately useful, auto-discoverable, and follow the exact conventions from the official Grok Build skills guide.

## Required Output Format

Every skill you create must contain:

```markdown
---
name: kebab-case-name
description: >
  One or two sentence description that is specific enough for automatic
  invocation. Include example trigger phrases the user might say.
when-to-use: Optional but recommended — explicit trigger phrases.
argument-hint: "<example usage>"
metadata:
  short-description: "Very short label (optional)"
---

# Human Friendly Title

Intro paragraph.

## Steps (or Usage / Workflow)

1. Numbered, concrete actions.
2. Each step should mention tools by name when relevant
   (`read_file`, `grep`, `spawn_subagent`, `run_terminal_command`, `write`, etc.).
3. Include success criteria or "what good looks like".

## Principles / Important Notes (recommended)

- Anti-hallucination, safety, or verification rules.
- References to other skills or AGENTS.md sections when useful.
```

## Creation Process

1. Clarify the workflow the skill should capture.
   - Ask for (or infer) the exact trigger phrases users will say.
   - Identify the primary tools the skill will use.

2. Write excellent `description` text.
   - It must be specific. Bad: "Helps with commits". Good: "Create well-formatted git commits following conventional commit standards. Use when the user wants to commit changes or asks for /commit."

3. Structure the body:
   - Start with a short purpose.
   - Use numbered steps (the agent loves ordered procedures).
   - Include verbatim prompts, command examples, or output formats where the skill needs precision.
   - Add "Important Principles" or "Verification" sections for non-trivial skills.

4. Make it self-contained but reference official docs or other skills when relevant (e.g. "follow the todo discipline in AGENTS.md").

5. After writing the file, suggest how the user can test it:
   - `/skills <new-name>`
   - Run a small task that should trigger it automatically.

## Quality Checklist (run this mentally before finishing)

- [ ] Frontmatter has `name` (lowercase, hyphens) and a rich `description`
- [ ] Description contains realistic user phrases that would cause auto-invocation
- [ ] Steps are numbered and reference concrete tool names
- [ ] No vague advice ("be careful") — specific rules instead
- [ ] Under 4000 characters when possible (skills should be focused)
- [ ] Includes at least one realistic example in the body or description

## Scope

- `--project` (default for this repo) → write into `.grok/skills/<name>/`
- `--user` → write into the user's global `~/.grok/skills/<name>/`

This skill was used conceptually while creating the other skills in this repository (`project-auditor`, `readiness-scorer`).

Ship skills that make future Grok sessions dramatically better.
