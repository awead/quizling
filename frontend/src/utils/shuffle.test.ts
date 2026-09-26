import { describe, it, expect } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('returns a new array with the same items', () => {
    const items = ['a', 'b', 'c', 'd'];

    const result = shuffle(items);

    expect(result).not.toBe(items);
    expect([...result].sort()).toEqual(items);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('reorders items according to the random source', () => {
    expect(shuffle(['a', 'b', 'c', 'd'], () => 0)).toEqual(['b', 'c', 'd', 'a']);
    expect(shuffle(['a', 'b', 'c', 'd'], () => 0.99)).toEqual(['a', 'b', 'c', 'd']);
  });
});
