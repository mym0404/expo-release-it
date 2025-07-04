import { replaceStringIfNotContain } from './replaceStringIfNotContain';

describe('replaceStringIfNotContain', () => {
  it('return original when pattern is not matched', () => {
    const content = 'hello';

    expect(replaceStringIfNotContain(content, /bye/, '', false)).toBe('hello');
  });

  it('return original when pattern is matched but value is already present', () => {
    const content = 'hello';

    expect(replaceStringIfNotContain(content, /h/, 'hello', false)).toBe('hello');
  });

  it('return modified when pattern is matching and value is not present', () => {
    const content = 'hello';

    expect(replaceStringIfNotContain(content, /^hello$/g, 'bye', true)).toBe('bye');
  });

  it('throw when non-global pattern is passed', () => {
    const content = 'hello';

    expect(() => replaceStringIfNotContain(content, /^hello$/, 'bye', true)).toThrow();
  });
});
