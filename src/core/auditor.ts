import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { IgnoreMatcher } from '../utils/ignore.js';
import { discoverSkills, parseSkillFile, validateSkill } from './skill-parser.js';
import { AuditReport, AuditFinding } from './reporter.js';

export interface AuditOptions {
  target: string;
  format?: 'human' | 'json' | 'md';
}

export interface AuditSignals {
  agentsMd: { present: boolean; path?: string; size?: number; hasWorkflowSection?: boolean };
  skills: { count: number; validCount: number; names: string[] };
  tests: { hasTestScript: boolean; frameworks: string[] };
  ci: { present: boolean; files: string[] };
  git: { isRepo: boolean; clean?: boolean; recentCommits?: number };
  ignores: { hasGrokIgnore: boolean; hasGitIgnore: boolean };
}

export async function auditProject(opts: AuditOptions): Promise<AuditReport> {
  const root = path.resolve(opts.target);
  const matcher = await IgnoreMatcher.fromFiles(root);

  const signals: AuditSignals = {
    agentsMd: { present: false },
    skills: { count: 0, validCount: 0, names: [] },
    tests: { hasTestScript: false, frameworks: [] },
    ci: { present: false, files: [] },
    git: { isRepo: false },
    ignores: { hasGrokIgnore: false, hasGitIgnore: false }
  };

  const findings: AuditFinding[] = [];
  const recommendations: string[] = [];

  // 1. AGENTS.md (or variants)
  const ruleFiles = ['AGENTS.md', 'Agents.md', 'AGENT.md', 'CLAUDE.md', 'Claude.md'];
  for (const f of ruleFiles) {
    const p = path.join(root, f);
    try {
      const st = await stat(p);
      if (st.isFile()) {
        const content = await readFile(p, 'utf8');
        signals.agentsMd = {
          present: true,
          path: f,
          size: content.length,
          hasWorkflowSection: /Plan Mode|subagent|todo_write|verification|AGENTS|skills/i.test(content)
        };
        break;
      }
    } catch {}
  }

  // 2. Skills
  const skills = await discoverSkills(root);
  signals.skills.count = skills.length;
  signals.skills.validCount = skills.filter(s => s.valid).length;
  signals.skills.names = skills.map(s => s.name);

  for (const s of skills) {
    const v = validateSkill(s);
    if (v.valid) {
      findings.push({ type: 'strength', signal: `Skill: ${s.name}`, detail: s.description.slice(0, 80) + (s.description.length > 80 ? '...' : '') });
    } else {
      findings.push({ type: 'gap', signal: `Skill: ${s.name}`, detail: v.issues.join('; ') });
    }
  }

  // 3. package.json tests
  try {
    const pkgRaw = await readFile(path.join(root, 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgRaw);
    if (pkg.scripts?.test) signals.tests.hasTestScript = true;
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.vitest) signals.tests.frameworks.push('vitest');
    if (deps.jest) signals.tests.frameworks.push('jest');
    if (deps.mocha) signals.tests.frameworks.push('mocha');
  } catch {}

  // 4. CI
  const ciDir = path.join(root, '.github', 'workflows');
  try {
    const files = await readdir(ciDir);
    const yml = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    if (yml.length > 0) {
      signals.ci.present = true;
      signals.ci.files = yml;
    }
  } catch {}

  // 5. Ignores
  try { await stat(path.join(root, '.grokignore')); signals.ignores.hasGrokIgnore = true; } catch {}
  try { await stat(path.join(root, '.gitignore')); signals.ignores.hasGitIgnore = true; } catch {}

  // 6. Git (best effort)
  try {
    const { execSync } = await import('node:child_process');
    const isRepo = execSync('git rev-parse --is-inside-work-tree', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() === 'true';
    signals.git.isRepo = isRepo;
    if (isRepo) {
      const status = execSync('git status --porcelain', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      signals.git.clean = status.length === 0;
      const log = execSync('git log --oneline -5', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      signals.git.recentCommits = log ? log.split('\n').length : 0;
    }
  } catch {
    signals.git.isRepo = false;
  }

  // Build findings from signals
  if (signals.agentsMd.present) {
    const sz = signals.agentsMd.size || 0;
    const detail = `${sz} chars${signals.agentsMd.hasWorkflowSection ? ', includes agent workflow guidance' : ''}`;
    findings.push({ type: sz > 600 ? 'strength' : 'opportunity', signal: `AGENTS.md (${signals.agentsMd.path})`, detail });
  } else {
    findings.push({ type: 'gap', signal: 'AGENTS.md', detail: 'No project rules file found at root' });
    recommendations.push('Add a root AGENTS.md with coding standards, verification rules, and agent workflow guidance');
  }

  if (signals.skills.validCount >= 2) {
    findings.push({ type: 'strength', signal: '.grok/skills/', detail: `${signals.skills.validCount} valid skills (${signals.skills.names.join(', ')})` });
  } else if (signals.skills.count > 0) {
    findings.push({ type: 'opportunity', signal: '.grok/skills/', detail: `${signals.skills.count} skills found but some invalid` });
  } else {
    findings.push({ type: 'gap', signal: '.grok/skills/', detail: 'No project skills discovered' });
    recommendations.push('Create 2-3 focused skills in .grok/skills/ (e.g. project-auditor, skill-crafter)');
  }

  if (signals.tests.hasTestScript || signals.tests.frameworks.length > 0) {
    findings.push({ type: 'strength', signal: 'Tests', detail: `Test script + ${signals.tests.frameworks.join('/') || 'framework(s)'} present` });
  } else {
    findings.push({ type: 'gap', signal: 'Tests', detail: 'No test script or known framework detected' });
    recommendations.push('Add a test framework (vitest/jest/pytest) and a `test` script');
  }

  if (signals.ci.present) {
    findings.push({ type: 'strength', signal: 'CI', detail: `${signals.ci.files.length} workflow file(s)` });
  } else {
    findings.push({ type: 'opportunity', signal: 'CI', detail: 'No GitHub Actions or other CI config found' });
    recommendations.push('Add .github/workflows/ci.yml that runs typecheck + test on PRs');
  }

  if (signals.ignores.hasGrokIgnore) {
    findings.push({ type: 'strength', signal: '.grokignore', detail: 'Dedicated agent ignore file present (great for context hygiene)' });
  } else if (signals.ignores.hasGitIgnore) {
    findings.push({ type: 'opportunity', signal: 'Ignores', detail: 'Has .gitignore but no .grokignore — consider adding one for agent-specific skips' });
  }

  if (signals.git.isRepo) {
    const d = signals.git.clean ? 'clean working tree' : 'dirty tree';
    findings.push({ type: signals.git.clean ? 'strength' : 'opportunity', signal: 'Git', detail: `${d}, ${signals.git.recentCommits || 0} recent commits` });
  } else {
    findings.push({ type: 'gap', signal: 'Git', detail: 'Not a git repository' });
  }

  // Score (use readiness-scorer style logic)
  let score = 30;
  if (signals.agentsMd.present) score += (signals.agentsMd.size || 0) > 800 ? 22 : 12;
  if (signals.skills.validCount >= 2) score += 18;
  else if (signals.skills.validCount === 1) score += 8;
  if (signals.tests.hasTestScript || signals.tests.frameworks.length) score += 18;
  if (signals.ci.present) score += 9;
  if (signals.ignores.hasGrokIgnore || signals.ignores.hasGitIgnore) score += 6;
  if (signals.git.isRepo && signals.git.clean) score += 7;
  if (signals.agentsMd.hasWorkflowSection) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const assessment =
    score >= 85 ? 'Excellent — this project was built to be worked on by agents.' :
    score >= 70 ? 'Very good — solid foundation for Grok Build.' :
    score >= 50 ? 'Decent — several quick wins available.' :
    'Early stage — high leverage improvements possible.';

  // Default recommendations if none added
  if (recommendations.length === 0) {
    if (score < 90) recommendations.push('Run `gbs audit .` regularly and act on the gaps');
    recommendations.push('Keep AGENTS.md and skills up to date as conventions evolve');
  }

  const report: AuditReport = {
    target: root,
    score,
    assessment,
    findings,
    recommendations: recommendations.slice(0, 6),
    signals: signals as any,
    generatedAt: new Date().toISOString()
  };

  return report;
}
