import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Simple .gitignore / .grokignore matcher.
 * Supports:
 *  - comments (#)
 *  - blank lines
 *  - negation with leading !
 *  - directory hints with trailing /
 *  - * (non-slash) and ** (any)
 * Not a full gitignore spec, but good enough for agent context filtering.
 */

export interface IgnoreRule {
  negated: boolean;
  pattern: string;
}

export class IgnoreMatcher {
  private rules: IgnoreRule[] = [];

  constructor(rules: IgnoreRule[] = []) {
    this.rules = rules;
  }

  static async fromFiles(root: string, files: string[] = ['.grokignore', '.gitignore']): Promise<IgnoreMatcher> {
    const rules: IgnoreRule[] = [];
    for (const file of files) {
      try {
        const content = await readFile(path.join(root, file), 'utf8');
        const parsed = IgnoreMatcher.parse(content);
        rules.push(...parsed);
      } catch {
        // file may not exist — that's fine
      }
    }
    return new IgnoreMatcher(rules);
  }

  static parse(content: string): IgnoreRule[] {
    const lines = content.split(/\r?\n/);
    const rules: IgnoreRule[] = [];
    for (let raw of lines) {
      let line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      let negated = false;
      if (line.startsWith('!')) {
        negated = true;
        line = line.slice(1).trim();
      }
      if (!line) continue;
      rules.push({ negated, pattern: line });
    }
    return rules;
  }

  ignores(relPath: string): boolean {
    // Normalize to forward slashes and strip leading ./
    let p = relPath.replace(/\\/g, '/').replace(/^\.\//, '');
    let ignored = false;

    for (const rule of this.rules) {
      if (this.matchesPattern(p, rule.pattern)) {
        ignored = !rule.negated;
      }
    }
    return ignored;
  }

  private matchesPattern(p: string, pat: string): boolean {
    // Directory match (trailing /)
    if (pat.endsWith('/')) {
      const dir = pat.slice(0, -1);
      if (p === dir || p.startsWith(dir + '/')) return true;
      return false;
    }

    // Convert simple gitignore glob to regex
    const regexStr = this.globToRegex(pat);
    try {
      const re = new RegExp(regexStr);
      return re.test(p) || re.test(p.split('/').pop() || '');
    } catch {
      // fallback to simple includes
      return p.includes(pat.replace(/\*/g, ''));
    }
  }

  private globToRegex(glob: string): string {
    // Escape regex special chars except * and **
    let re = glob
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '::DOUBLESTAR::')
      .replace(/\*/g, '[^/]*')
      .replace(/::DOUBLESTAR::/g, '.*');

    // Anchor: match whole path or basename for files
    return `^(${re}|.*/${re})$`;
  }
}
