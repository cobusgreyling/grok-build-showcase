import { discoverSkills, parseSkillFile, validateSkill } from '../core/skill-parser.js';
import path from 'node:path';
import chalk from 'chalk';

interface SkillsOpts {
  action: 'list' | 'validate' | 'info';
  name?: string;
}

export async function skillsCommand(opts: SkillsOpts) {
  const cwd = process.cwd();
  const skills = await discoverSkills(cwd);

  if (opts.action === 'list') {
    if (skills.length === 0) {
      console.log(chalk.yellow('No skills found in .grok/skills/'));
      return;
    }
    console.log(chalk.bold(`Discovered ${skills.length} project skill(s):\n`));
    for (const s of skills) {
      const v = validateSkill(s);
      const badge = v.valid ? chalk.green('✓') : chalk.red('✗');
      console.log(`${badge} ${chalk.cyan.bold(s.name)}`);
      console.log(`   ${s.description}`);
      if (!v.valid) console.log(chalk.red(`   Issues: ${v.issues.join('; ')}`));
      console.log('');
    }
    return;
  }

  if (opts.action === 'validate') {
    let ok = 0;
    for (const s of skills) {
      const v = validateSkill(s);
      if (v.valid) {
        ok++;
        console.log(chalk.green(`✓ ${s.name}`));
      } else {
        console.log(chalk.red(`✗ ${s.name}`));
        v.issues.forEach(i => console.log(`    - ${i}`));
      }
    }
    console.log(`\n${ok}/${skills.length} skills valid`);
    if (ok < skills.length) process.exitCode = 1;
    return;
  }

  if (opts.action === 'info' && opts.name) {
    const match = skills.find(s => s.name === opts.name);
    if (!match) {
      // Try reading directly (for user skills or by path)
      const direct = await parseSkillFile(path.join(cwd, '.grok', 'skills', opts.name, 'SKILL.md'));
      if (!direct.valid && !direct.body) {
        console.log(chalk.red(`Skill not found: ${opts.name}`));
        process.exitCode = 1;
        return;
      }
      printSkillInfo(direct);
      return;
    }
    printSkillInfo(match);
    return;
  }

  console.log('Usage: gbs skills <list|validate|info <name>>');
}

function printSkillInfo(s: any) {
  console.log(chalk.bold.cyan(s.name));
  console.log(chalk.dim(s.path));
  console.log('');
  console.log(chalk.bold('Description:'));
  console.log(s.description || '(none)');
  if (s.frontmatter['when-to-use']) {
    console.log('\n' + chalk.bold('When to use:'));
    console.log(s.frontmatter['when-to-use']);
  }
  if (s.frontmatter['argument-hint']) {
    console.log('\n' + chalk.bold('Example:'));
    console.log(s.frontmatter['argument-hint']);
  }
  console.log('\n' + chalk.bold('Body preview:'));
  const preview = (s.body || '').slice(0, 600);
  console.log(preview + ((s.body || '').length > 600 ? '\n...' : ''));
}
