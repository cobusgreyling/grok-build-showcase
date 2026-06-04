import { auditProject } from '../core/auditor.js';
import { formatHuman, formatJson, formatMarkdown } from '../core/reporter.js';
import chalk from 'chalk';

export async function auditCommand(target: string = '.', opts: { json?: boolean; md?: boolean }) {
  const t = target || '.';
  console.log(chalk.dim(`Auditing ${t} ...`));

  try {
    const report = await auditProject({ target: t });

    if (opts.json) {
      console.log(formatJson(report));
    } else if (opts.md) {
      console.log(formatMarkdown(report));
    } else {
      console.log(formatHuman(report));
    }

    // Non-zero exit if score is poor (useful for CI)
    if (report.score < 40) {
      process.exitCode = 2;
    }
  } catch (err: any) {
    console.error(chalk.red('Audit failed:'), err.message);
    process.exitCode = 1;
  }
}
