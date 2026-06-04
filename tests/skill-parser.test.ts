import { describe, it, expect } from 'vitest';
import { parseSkillFile, discoverSkills, validateSkill } from '../src/core/skill-parser.js';
import path from 'node:path';

const FIXTURES = path.resolve(__dirname, 'fixtures');

describe('skill-parser', () => {
  it('parses a valid skill with frontmatter', async () => {
    const p = path.join(FIXTURES, 'good-project', '.grok', 'skills', 'example-auditor', 'SKILL.md');
    const parsed = await parseSkillFile(p);
    expect(parsed.valid).toBe(true);
    expect(parsed.name).toBe('example-auditor');
    expect(parsed.frontmatter.description).toContain('good frontmatter');
  });

  it('reports invalid when frontmatter is missing', async () => {
    // create a temp bad file? use a non-skill
    const p = path.join(FIXTURES, 'minimal-project', 'README.md');
    const parsed = await parseSkillFile(p);
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toMatch(/frontmatter|YAML/i);
  });

  it('discoverSkills finds skills in good-project', async () => {
    const skills = await discoverSkills(path.join(FIXTURES, 'good-project'));
    expect(skills.length).toBeGreaterThanOrEqual(1);
    expect(skills.some(s => s.name === 'example-auditor')).toBe(true);
  });

  it('validateSkill catches short descriptions', async () => {
    const bad = {
      path: 'x',
      name: 'bad',
      description: 'too short',
      frontmatter: { name: 'bad', description: 'too short' },
      body: 'short body',
      valid: true
    } as any;
    const v = validateSkill(bad);
    expect(v.valid).toBe(false);
    expect(v.issues.some(i => i.includes('short'))).toBe(true);
  });
});
