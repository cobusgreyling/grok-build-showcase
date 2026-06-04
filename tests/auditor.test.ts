import { describe, it, expect } from 'vitest';
import { auditProject } from '../src/core/auditor.js';
import path from 'node:path';

const FIXTURES = path.resolve(__dirname, 'fixtures');

describe('auditor', () => {
  it('scores the good-project fixture highly', async () => {
    const report = await auditProject({ target: path.join(FIXTURES, 'good-project') });
    expect(report.score).toBeGreaterThanOrEqual(75);
    expect(report.assessment).toMatch(/Excellent|Very good|solid/i);
    expect(report.findings.some(f => f.signal.includes('AGENTS.md'))).toBe(true);
    expect(report.findings.some(f => f.signal.includes('skills') || f.signal.includes('Skill'))).toBe(true);
  });

  it('scores the minimal-project fixture low', async () => {
    const report = await auditProject({ target: path.join(FIXTURES, 'minimal-project') });
    expect(report.score).toBeLessThan(55);
    expect(report.findings.some(f => /AGENTS|skills|Tests|CI/i.test(f.signal))).toBe(true);
  });

  it('produces json and md formats without crashing', async () => {
    const r = await auditProject({ target: path.join(FIXTURES, 'good-project') });
    const json = JSON.stringify(r);
    expect(json).toContain('"score"');
    expect(r.recommendations.length).toBeGreaterThan(0);
  });

  it('auditing the real showcase root produces a high score (self test)', async () => {
    const root = path.resolve(__dirname, '..');
    const report = await auditProject({ target: root });
    // We just built a very complete .grok/ setup
    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.signals.skills.count).toBeGreaterThanOrEqual(3);
  });
});
