import { describe, it, expect } from 'vitest';
import { IgnoreMatcher } from '../src/utils/ignore.js';

describe('ignore', () => {
  it('parses simple rules and matches paths', () => {
    const content = `
# comment
node_modules/
dist/
*.log
.env*
.grok/sessions/
!important.log
`;
    const rules = IgnoreMatcher.parse(content);
    expect(rules.length).toBeGreaterThan(0);

    const m = new IgnoreMatcher(rules);
    expect(m.ignores('node_modules/foo')).toBe(true);
    expect(m.ignores('dist/bundle.js')).toBe(true);
    expect(m.ignores('app.log')).toBe(true);
    expect(m.ignores('important.log')).toBe(false); // negated
    expect(m.ignores('src/index.ts')).toBe(false);
  });

  it('handles .grokignore style paths', () => {
    const content = `.grok/sessions/\n*.tmp\n`;
    const m = new IgnoreMatcher(IgnoreMatcher.parse(content));
    expect(m.ignores('.grok/sessions/123/log.json')).toBe(true);
    expect(m.ignores('foo.tmp')).toBe(true);
  });
});
