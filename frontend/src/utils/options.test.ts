import { describe, it, expect } from 'vitest';
import { optionLetter } from './options';

describe('optionLetter', () => {
  it('letters options top to bottom from A', () => {
    expect([0, 1, 2, 3].map(optionLetter)).toEqual(['A', 'B', 'C', 'D']);
  });
});
