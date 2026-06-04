#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { auditCommand } from './commands/audit.js';
import { skillsCommand } from './commands/skills.js';
import { scaffoldCommand } from './commands/scaffold.js';
import { demoCommand } from './commands/demo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const program = new Command();

program
  .name('gbs')
  .description('Grok Build Showcase — a living reference CLI and toolkit for Grok Build best practices')
  .version(pkg.version, '-v, --version', 'output the current version')
  .configureOutput({
    writeErr: (str) => process.stderr.write(chalk.red(str))
  });

program
  .command('audit [target]')
  .description('Audit a directory for Grok Build readiness (AGENTS.md, skills, tests, CI, git, ignores)')
  .option('--json', 'output machine-readable JSON')
  .option('--md', 'output Markdown report')
  .action(auditCommand);

program
  .command('skills')
  .description('Work with discovered skills (list, validate, info)')
  .addCommand(
    new Command('list')
      .description('List all project + user skills with descriptions')
      .action(() => skillsCommand({ action: 'list' }))
  )
  .addCommand(
    new Command('validate')
      .description('Validate all discoverable SKILL.md files')
      .action(() => skillsCommand({ action: 'validate' }))
  )
  .addCommand(
    new Command('info <name>')
      .description('Show details for a specific skill')
      .action((name) => skillsCommand({ action: 'info', name }))
  );

program
  .command('scaffold')
  .description('Generate templates (skill, AGENTS.md)')
  .addCommand(
    new Command('skill <name>')
      .description('Scaffold a new high-quality skill')
      .option('--project', 'write to .grok/skills (default for this repo)')
      .option('--user', 'write to user global ~/.grok/skills')
      .action((name, opts) => scaffoldCommand({ type: 'skill', name, ...opts }))
  )
  .addCommand(
    new Command('agents-md')
      .description('Print (or write) a strong starter AGENTS.md')
      .option('--write', 'write AGENTS.md to current directory')
      .action((opts) => scaffoldCommand({ type: 'agents-md', ...opts }))
  );

program
  .command('demo [scenario]')
  .description('Run a visual simulation of parallel subagent workflows (best-of-n style)')
  .action(demoCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err?.message || err);
  process.exit(1);
});
