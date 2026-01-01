import { describe, it, expect } from 'vitest';
import type { Term, AtomTerm, VariableTerm, CompoundTerm, ListTerm } from '@cogitator-ai/types';
import {
  unify,
  applySubstitution,
  composeSubstitutions,
  getVariables,
  renameVariables,
  termsEqual,
  occursIn,
  termToString,
  substitutionToString,
  isAtom,
  isVariable,
  isNumber,
  isCompound,
  isList,
} from '../logic/unification';

const atom = (value: string): AtomTerm => ({ type: 'atom', value });
const variable = (name: string): VariableTerm => ({ type: 'variable', name });
const compound = (functor: string, ...args: Term[]): CompoundTerm => ({
  type: 'compound',
  functor,
  args,
});
const list = (elements: Term[], tail?: Term): ListTerm => ({
  type: 'list',
  elements,
  tail,
});

describe('Type guards', () => {
  it('isAtom correctly identifies atoms', () => {
    expect(isAtom(atom('foo'))).toBe(true);
    expect(isAtom(variable('X'))).toBe(false);
  });

  it('isVariable correctly identifies variables', () => {
    expect(isVariable(variable('X'))).toBe(true);
    expect(isVariable(atom('foo'))).toBe(false);
  });

  it('isNumber correctly identifies numbers', () => {
    expect(isNumber({ type: 'number', value: 42 })).toBe(true);
    expect(isNumber(atom('42'))).toBe(false);
  });

  it('isCompound correctly identifies compound terms', () => {
    expect(isCompound(compound('foo', atom('bar')))).toBe(true);
    expect(isCompound(atom('foo'))).toBe(false);
  });

  it('isList correctly identifies lists', () => {
    expect(isList(list([atom('a'), atom('b')]))).toBe(true);
    expect(isList(atom('[]'))).toBe(false);
  });
});

describe('termsEqual', () => {
  it('compares atoms correctly', () => {
    expect(termsEqual(atom('foo'), atom('foo'))).toBe(true);
    expect(termsEqual(atom('foo'), atom('bar'))).toBe(false);
  });

  it('compares variables correctly', () => {
    expect(termsEqual(variable('X'), variable('X'))).toBe(true);
    expect(termsEqual(variable('X'), variable('Y'))).toBe(false);
  });

  it('compares compound terms correctly', () => {
    const t1 = compound('foo', atom('a'), atom('b'));
    const t2 = compound('foo', atom('a'), atom('b'));
    const t3 = compound('foo', atom('a'), atom('c'));
    const t4 = compound('bar', atom('a'), atom('b'));

    expect(termsEqual(t1, t2)).toBe(true);
    expect(termsEqual(t1, t3)).toBe(false);
    expect(termsEqual(t1, t4)).toBe(false);
  });

  it('compares lists correctly', () => {
    const l1 = list([atom('a'), atom('b')]);
    const l2 = list([atom('a'), atom('b')]);
    const l3 = list([atom('a'), atom('c')]);

    expect(termsEqual(l1, l2)).toBe(true);
    expect(termsEqual(l1, l3)).toBe(false);
  });

  it('compares different types as not equal', () => {
    expect(termsEqual(atom('foo'), variable('foo'))).toBe(false);
  });
});

describe('occursIn', () => {
  it('detects variable in simple term', () => {
    expect(occursIn(variable('X'), variable('X'))).toBe(true);
    expect(occursIn(variable('X'), variable('Y'))).toBe(false);
  });

  it('detects variable in compound term', () => {
    const term = compound('foo', variable('X'), atom('a'));
    expect(occursIn(variable('X'), term)).toBe(true);
    expect(occursIn(variable('Y'), term)).toBe(false);
  });

  it('detects variable in list', () => {
    const term = list([atom('a'), variable('X')]);
    expect(occursIn(variable('X'), term)).toBe(true);
    expect(occursIn(variable('Y'), term)).toBe(false);
  });

  it('detects variable in list tail', () => {
    const term = list([atom('a')], variable('Tail'));
    expect(occursIn(variable('Tail'), term)).toBe(true);
  });
});

describe('unify', () => {
  it('unifies identical atoms', () => {
    const result = unify(atom('foo'), atom('foo'));
    expect(result).not.toBeNull();
    expect(result?.size).toBe(0);
  });

  it('fails to unify different atoms', () => {
    const result = unify(atom('foo'), atom('bar'));
    expect(result).toBeNull();
  });

  it('unifies variable with atom', () => {
    const result = unify(variable('X'), atom('foo'));
    expect(result).not.toBeNull();
    expect(result?.get('X')).toEqual(atom('foo'));
  });

  it('unifies atom with variable', () => {
    const result = unify(atom('foo'), variable('X'));
    expect(result).not.toBeNull();
    expect(result?.get('X')).toEqual(atom('foo'));
  });

  it('unifies two variables', () => {
    const result = unify(variable('X'), variable('Y'));
    expect(result).not.toBeNull();
    expect(result?.size).toBe(1);
  });

  it('unifies compound terms with same functor and arity', () => {
    const t1 = compound('foo', variable('X'), atom('b'));
    const t2 = compound('foo', atom('a'), variable('Y'));
    const result = unify(t1, t2);

    expect(result).not.toBeNull();
    expect(result?.get('X')).toEqual(atom('a'));
    expect(result?.get('Y')).toEqual(atom('b'));
  });

  it('fails to unify compound terms with different functors', () => {
    const t1 = compound('foo', atom('a'));
    const t2 = compound('bar', atom('a'));
    expect(unify(t1, t2)).toBeNull();
  });

  it('fails to unify compound terms with different arities', () => {
    const t1 = compound('foo', atom('a'));
    const t2 = compound('foo', atom('a'), atom('b'));
    expect(unify(t1, t2)).toBeNull();
  });

  it('unifies nested compound terms', () => {
    const t1 = compound('foo', compound('bar', variable('X')));
    const t2 = compound('foo', compound('bar', atom('a')));
    const result = unify(t1, t2);

    expect(result).not.toBeNull();
    expect(result?.get('X')).toEqual(atom('a'));
  });

  it('handles occurs check', () => {
    const t1 = variable('X');
    const t2 = compound('foo', variable('X'));
    expect(unify(t1, t2)).toBeNull();
  });

  it('unifies lists', () => {
    const l1 = list([variable('X'), atom('b')]);
    const l2 = list([atom('a'), variable('Y')]);
    const result = unify(l1, l2);

    expect(result).not.toBeNull();
    expect(result?.get('X')).toEqual(atom('a'));
    expect(result?.get('Y')).toEqual(atom('b'));
  });

  it('unifies list with tail pattern', () => {
    const l1 = list([atom('a')], variable('Tail'));
    const l2 = list([atom('a'), atom('b'), atom('c')]);
    const result = unify(l1, l2);

    expect(result).not.toBeNull();
    const tail = result?.get('Tail');
    expect(tail).toBeDefined();
    expect(isList(tail!)).toBe(true);
  });

  it('uses existing substitutions', () => {
    const existing = new Map<string, Term>();
    existing.set('X', atom('foo'));

    const result = unify(variable('X'), variable('Y'), existing);
    expect(result).not.toBeNull();
    expect(result?.get('Y')).toEqual(atom('foo'));
  });
});

describe('applySubstitution', () => {
  it('replaces variable with bound term', () => {
    const subst = new Map<string, Term>();
    subst.set('X', atom('foo'));

    const result = applySubstitution(variable('X'), subst);
    expect(result).toEqual(atom('foo'));
  });

  it('leaves unbound variables unchanged', () => {
    const subst = new Map<string, Term>();
    const result = applySubstitution(variable('X'), subst);
    expect(result).toEqual(variable('X'));
  });

  it('applies substitution to compound terms', () => {
    const subst = new Map<string, Term>();
    subst.set('X', atom('foo'));

    const term = compound('bar', variable('X'), atom('baz'));
    const result = applySubstitution(term, subst);

    expect(result).toEqual(compound('bar', atom('foo'), atom('baz')));
  });

  it('applies substitution to lists', () => {
    const subst = new Map<string, Term>();
    subst.set('X', atom('foo'));

    const term = list([variable('X'), atom('bar')]);
    const result = applySubstitution(term, subst);

    expect(result).toEqual(list([atom('foo'), atom('bar')]));
  });

  it('applies substitution recursively', () => {
    const subst = new Map<string, Term>();
    subst.set('X', variable('Y'));
    subst.set('Y', atom('foo'));

    const result = applySubstitution(variable('X'), subst);
    expect(result).toEqual(atom('foo'));
  });
});

describe('composeSubstitutions', () => {
  it('composes two substitutions', () => {
    const s1 = new Map<string, Term>();
    s1.set('X', variable('Y'));

    const s2 = new Map<string, Term>();
    s2.set('Y', atom('foo'));

    const result = composeSubstitutions(s1, s2);

    expect(result.get('X')).toEqual(atom('foo'));
    expect(result.get('Y')).toEqual(atom('foo'));
  });

  it('preserves bindings from first substitution', () => {
    const s1 = new Map<string, Term>();
    s1.set('X', atom('bar'));

    const s2 = new Map<string, Term>();
    s2.set('X', atom('foo'));

    const result = composeSubstitutions(s1, s2);
    expect(result.get('X')).toEqual(atom('bar'));
  });
});

describe('getVariables', () => {
  it('extracts variables from simple term', () => {
    const vars = getVariables(variable('X'));
    expect(vars.has('X')).toBe(true);
  });

  it('extracts variables from compound term', () => {
    const term = compound('foo', variable('X'), variable('Y'));
    const vars = getVariables(term);
    expect(vars.has('X')).toBe(true);
    expect(vars.has('Y')).toBe(true);
  });

  it('extracts variables from list', () => {
    const term = list([variable('X'), atom('a')], variable('Tail'));
    const vars = getVariables(term);
    expect(vars.has('X')).toBe(true);
    expect(vars.has('Tail')).toBe(true);
  });

  it('returns empty set for ground terms', () => {
    const term = compound('foo', atom('a'), atom('b'));
    const vars = getVariables(term);
    expect(vars.size).toBe(0);
  });
});

describe('renameVariables', () => {
  it('renames variables with suffix', () => {
    const term = variable('X');
    const renamed = renameVariables(term, '1');
    expect(renamed).toEqual(variable('X_1'));
  });

  it('renames variables in compound terms', () => {
    const term = compound('foo', variable('X'), variable('Y'));
    const renamed = renameVariables(term, '2');

    expect(isCompound(renamed)).toBe(true);
    if (isCompound(renamed)) {
      expect(renamed.args[0]).toEqual(variable('X_2'));
      expect(renamed.args[1]).toEqual(variable('Y_2'));
    }
  });

  it('leaves atoms unchanged', () => {
    const term = atom('foo');
    const renamed = renameVariables(term, '1');
    expect(renamed).toEqual(atom('foo'));
  });
});

describe('termToString', () => {
  it('formats atoms', () => {
    expect(termToString(atom('foo'))).toBe('foo');
  });

  it('formats variables', () => {
    expect(termToString(variable('X'))).toBe('X');
  });

  it('formats numbers', () => {
    expect(termToString({ type: 'number', value: 42 })).toBe('42');
  });

  it('formats strings', () => {
    expect(termToString({ type: 'string', value: 'hello' })).toBe('"hello"');
  });

  it('formats compound terms', () => {
    const term = compound('foo', atom('a'), atom('b'));
    expect(termToString(term)).toBe('foo(a, b)');
  });

  it('formats empty lists', () => {
    expect(termToString(list([]))).toBe('[]');
  });

  it('formats lists', () => {
    const term = list([atom('a'), atom('b'), atom('c')]);
    expect(termToString(term)).toBe('[a, b, c]');
  });

  it('formats lists with tail', () => {
    const term = list([atom('a'), atom('b')], variable('Tail'));
    expect(termToString(term)).toBe('[a, b|Tail]');
  });
});

describe('substitutionToString', () => {
  it('formats empty substitution', () => {
    expect(substitutionToString(new Map())).toBe('{}');
  });

  it('formats substitution with bindings', () => {
    const subst = new Map<string, Term>();
    subst.set('X', atom('foo'));
    subst.set('Y', atom('bar'));

    const result = substitutionToString(subst);
    expect(result).toContain('X = foo');
    expect(result).toContain('Y = bar');
  });
});
