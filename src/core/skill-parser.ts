import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

export interface SkillFrontmatter {
  name: string;
  description: string;
  'when-to-use'?: string;
  'argument-hint'?: string;
  metadata?: Record<string, unknown>;
}

export interface ParsedSkill {
  path: string;
  name: string;
  description: string;
  frontmatter: SkillFrontmatter;
  body: string;
  valid: boolean;
  error?: string;
}

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

export async function parseSkillFile(filePath: string): Promise<ParsedSkill> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const match = raw.match(FRONTMATTER_RE);
    if (!match) {
      return {
        path: filePath,
        name: path.basename(path.dirname(filePath)),
        description: '',
        frontmatter: { name: '', description: '' },
        body: raw,
        valid: false,
        error: 'Missing YAML frontmatter (--- ... ---)'
      };
    }

    const [, yamlStr, body] = match;
    let frontmatter: any;
    try {
      frontmatter = YAML.parse(yamlStr) || {};
    } catch (e: any) {
      return {
        path: filePath,
        name: path.basename(path.dirname(filePath)),
        description: '',
        frontmatter: { name: '', description: '' },
        body,
        valid: false,
        error: `YAML parse error: ${e.message}`
      };
    }

    const name = (frontmatter.name || path.basename(path.dirname(filePath))).toString().trim();
    const description = (frontmatter.description || '').toString().trim();

    const valid = Boolean(name && description);

    return {
      path: filePath,
      name,
      description,
      frontmatter: {
        name,
        description,
        'when-to-use': frontmatter['when-to-use'] || frontmatter.whenToUse,
        'argument-hint': frontmatter['argument-hint'] || frontmatter.argumentHint,
        metadata: frontmatter.metadata
      },
      body: body.trim(),
      valid,
      error: valid ? undefined : 'Missing required fields: name and description'
    };
  } catch (e: any) {
    return {
      path: filePath,
      name: path.basename(path.dirname(filePath)),
      description: '',
      frontmatter: { name: '', description: '' },
      body: '',
      valid: false,
      error: e.message
    };
  }
}

export async function discoverSkills(root: string): Promise<ParsedSkill[]> {
  const skillsRoot = path.join(root, '.grok', 'skills');
  try {
    const entries = await readdir(skillsRoot, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

    const results: ParsedSkill[] = [];
    for (const dir of dirs) {
      const skillFile = path.join(skillsRoot, dir, 'SKILL.md');
      const parsed = await parseSkillFile(skillFile);
      results.push(parsed);
    }
    return results.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export function validateSkill(parsed: ParsedSkill): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!parsed.frontmatter.name) issues.push('Missing name in frontmatter');
  if (!parsed.frontmatter.description) issues.push('Missing description in frontmatter');
  if (parsed.frontmatter.description && parsed.frontmatter.description.length < 30) {
    issues.push('Description is very short — make it specific for auto-invocation');
  }
  if (!parsed.body || parsed.body.length < 50) {
    issues.push('Body content is very short');
  }
  return { valid: issues.length === 0 && parsed.valid, issues };
}
