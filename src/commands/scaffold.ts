import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';

interface ScaffoldOpts {
  type: 'skill' | 'agents-md';
  name?: string;
  project?: boolean;
  user?: boolean;
  write?: boolean;
}

const AGENTS_MD_TEMPLATE = `# AGENTS.md — Starter Template

# Coding Standards
- Use TypeScript (strict). Prefer ESM.
- ...

# Build & Test
- Run \`npm test\` and typecheck before committing.
- ...

# Git
- Conventional commits.
- ...

# Agent Workflow
- Use todo_write for tasks with 3+ steps.
- Use Plan Mode for ambiguous architecture work.
- Prefer subagents for parallelizable independent tasks (with worktree isolation when writing).
- Maintain and use project skills in .grok/skills/.
- Self-verify with the check skill or equivalent on non-trivial work.
`;

const SKILL_TEMPLATE = (name: string) => `---
name: ${name}
description: >
  Short but specific description including example trigger phrases the user
  will actually say. This field drives automatic skill invocation.
when-to-use: Use when the user asks to "${name}" or describes the workflow.
argument-hint: "<example arguments>"
---

# ${name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}

Brief intro.

## Steps

1. First concrete step. Mention tools by name (read_file, grep, spawn_subagent, run_terminal_command, write, etc.).
2. Second step.
3. ...

## Important Principles

- Keep it focused.
- Reference other skills or AGENTS.md when useful.
`;

export async function scaffoldCommand(opts: ScaffoldOpts) {
  const cwd = process.cwd();

  if (opts.type === 'agents-md') {
    const content = AGENTS_MD_TEMPLATE;
    if (opts.write) {
      const out = path.join(cwd, 'AGENTS.md');
      await writeFile(out, content, 'utf8');
      console.log(chalk.green(`Wrote ${out}`));
    } else {
      console.log(content);
      console.log(chalk.dim('\n(Re-run with --write to create the file)'));
    }
    return;
  }

  if (opts.type === 'skill' && opts.name) {
    const skillName = opts.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const isUser = !!opts.user;
    const base = isUser
      ? path.join(process.env.HOME || process.env.USERPROFILE || '~', '.grok', 'skills', skillName)
      : path.join(cwd, '.grok', 'skills', skillName);

    const skillFile = path.join(base, 'SKILL.md');
    await mkdir(base, { recursive: true });
    await writeFile(skillFile, SKILL_TEMPLATE(skillName), 'utf8');

    console.log(chalk.green(`Scaffolded skill at ${skillFile}`));
    console.log(chalk.dim('Edit the description and steps to match the real workflow.'));
    console.log(chalk.dim('Test with: /skills ' + skillName + '  or  gbs skills info ' + skillName));
    return;
  }

  console.log('Usage: gbs scaffold <skill <name> | agents-md [--write]>');
}
