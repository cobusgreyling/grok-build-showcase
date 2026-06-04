import chalk from 'chalk';

export interface AuditFinding {
  type: 'strength' | 'opportunity' | 'gap';
  signal: string;
  detail: string;
}

export interface AuditReport {
  target: string;
  score: number;
  assessment: string;
  findings: AuditFinding[];
  recommendations: string[];
  signals: Record<string, unknown>;
  generatedAt: string;
}

export function formatHuman(report: AuditReport): string {
  const lines: string[] = [];

  const scoreColor = report.score >= 80 ? chalk.green : report.score >= 60 ? chalk.yellow : chalk.red;
  lines.push(chalk.bold('Grok Build Readiness Audit'));
  lines.push(`Target: ${chalk.cyan(report.target)}`);
  lines.push(`Score:  ${scoreColor.bold(String(report.score))}/100   ${scoreColor(report.assessment)}`);
  lines.push('');

  const grouped = {
    strength: report.findings.filter(f => f.type === 'strength'),
    opportunity: report.findings.filter(f => f.type === 'opportunity'),
    gap: report.findings.filter(f => f.type === 'gap')
  };

  if (grouped.strength.length) {
    lines.push(chalk.green.bold('✓ Strengths'));
    for (const f of grouped.strength) {
      lines.push(`  ${chalk.green('✓')} ${chalk.bold(f.signal)} — ${f.detail}`);
    }
    lines.push('');
  }

  if (grouped.opportunity.length) {
    lines.push(chalk.yellow.bold('△ Opportunities'));
    for (const f of grouped.opportunity) {
      lines.push(`  ${chalk.yellow('△')} ${chalk.bold(f.signal)} — ${f.detail}`);
    }
    lines.push('');
  }

  if (grouped.gap.length) {
    lines.push(chalk.red.bold('✗ Gaps'));
    for (const f of grouped.gap) {
      lines.push(`  ${chalk.red('✗')} ${chalk.bold(f.signal)} — ${f.detail}`);
    }
    lines.push('');
  }

  if (report.recommendations.length) {
    lines.push(chalk.bold('Recommendations (prioritized)'));
    report.recommendations.forEach((rec, i) => {
      lines.push(`  ${i + 1}. ${rec}`);
    });
    lines.push('');
  }

  lines.push(chalk.dim(`Generated at ${report.generatedAt}`));
  return lines.join('\n');
}

export function formatJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatMarkdown(report: AuditReport): string {
  const lines: string[] = [];
  lines.push(`# Grok Build Readiness Audit — ${report.target}`);
  lines.push('');
  lines.push(`**Score:** ${report.score}/100 — ${report.assessment}`);
  lines.push('');

  const strengths = report.findings.filter(f => f.type === 'strength');
  const opps = report.findings.filter(f => f.type === 'opportunity');
  const gaps = report.findings.filter(f => f.type === 'gap');

  if (strengths.length) {
    lines.push('## ✓ Strengths');
    strengths.forEach(f => lines.push(`- **${f.signal}**: ${f.detail}`));
    lines.push('');
  }
  if (opps.length) {
    lines.push('## △ Opportunities');
    opps.forEach(f => lines.push(`- **${f.signal}**: ${f.detail}`));
    lines.push('');
  }
  if (gaps.length) {
    lines.push('## ✗ Gaps');
    gaps.forEach(f => lines.push(`- **${f.signal}**: ${f.detail}`));
    lines.push('');
  }

  if (report.recommendations.length) {
    lines.push('## Recommendations');
    report.recommendations.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    lines.push('');
  }

  lines.push(`*Generated ${report.generatedAt}*`);
  return lines.join('\n');
}
