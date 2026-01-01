import type { Clause, CompoundTerm, LogicQueryResult } from '@cogitator-ai/types';
import { termToString } from './unification';
import type { KnowledgeBase } from './knowledge-base';

export interface NLToLogicPromptContext {
  naturalLanguageQuery: string;
  knowledgeBase: KnowledgeBase;
  examples?: { input: string; output: string }[];
}

export function createNLToQueryPrompt(context: NLToLogicPromptContext): string {
  const predicates = context.knowledgeBase.getPredicates();
  const stats = context.knowledgeBase.getStats();

  const systemPrompt = `You are a logic programming expert that converts natural language questions into Prolog-style queries.

Available predicates in the knowledge base:
${predicates.map((p) => `  - ${p}`).join('\n')}

Knowledge base stats:
  - ${stats.factCount} facts
  - ${stats.ruleCount} rules

Rules for generating queries:
1. Use only predicates that exist in the knowledge base
2. Use variable names that start with uppercase letters (X, Y, Person, Item, etc.)
3. For "who" questions, use a Person or X variable
4. For "what" questions, use appropriate variable names
5. For yes/no questions, generate a ground query if possible
6. Multiple conditions should be separated by commas
7. Use underscore (_) for anonymous/unused variables`;

  const examples = context.examples || getDefaultExamples();

  const examplesSection =
    examples.length > 0
      ? `\n\nExamples:\n${examples.map((e) => `Q: "${e.input}"\nA: ${e.output}`).join('\n\n')}`
      : '';

  return `${systemPrompt}${examplesSection}

Convert this natural language query to a Prolog-style query:

Q: "${context.naturalLanguageQuery}"
A:`;
}

function getDefaultExamples(): { input: string; output: string }[] {
  return [
    { input: 'Who is the parent of John?', output: 'parent(X, john).' },
    { input: 'Is Mary the mother of John?', output: 'mother(mary, john).' },
    { input: 'Find all grandparents of Alice', output: 'grandparent(X, alice).' },
    { input: 'Who works at Google?', output: 'works_at(Person, google).' },
    { input: 'What is the capital of France?', output: 'capital(france, City).' },
    { input: 'Are Tom and Jerry siblings?', output: 'sibling(tom, jerry).' },
  ];
}

export interface NLToFactsPromptContext {
  naturalLanguageText: string;
  existingPredicates?: string[];
  domain?: string;
}

export function createNLToFactsPrompt(context: NLToFactsPromptContext): string {
  const predicateInfo = context.existingPredicates?.length
    ? `\n\nExisting predicates to use when applicable:\n${context.existingPredicates.map((p) => `  - ${p}`).join('\n')}`
    : '';

  const domainInfo = context.domain ? `\n\nDomain context: ${context.domain}` : '';

  return `You are a logic programming expert that extracts facts from natural language text.

Convert the following text into Prolog-style facts.

Rules:
1. Use lowercase for atoms (constants)
2. Use descriptive predicate names (parent, owns, works_at, etc.)
3. Keep predicates consistent in arity
4. Extract all relevant relationships
5. Use snake_case for multi-word predicates
6. Each fact should be on a separate line
7. End each fact with a period${predicateInfo}${domainInfo}

Text:
"${context.naturalLanguageText}"

Facts:`;
}

export interface NLToRulesPromptContext {
  naturalLanguageRule: string;
  existingPredicates?: string[];
  existingRules?: string[];
}

export function createNLToRulesPrompt(context: NLToRulesPromptContext): string {
  const predicateInfo = context.existingPredicates?.length
    ? `\n\nExisting predicates:\n${context.existingPredicates.map((p) => `  - ${p}`).join('\n')}`
    : '';

  const rulesInfo = context.existingRules?.length
    ? `\n\nExisting rules:\n${context.existingRules.join('\n')}`
    : '';

  return `You are a logic programming expert that converts natural language rules into Prolog-style rules.

Convert the following natural language rule into a Prolog-style rule.

Rules:
1. Use :- for "if" relationships
2. Head of rule comes first, body after :-
3. Multiple conditions in body separated by commas
4. Variables start with uppercase
5. Use meaningful variable names
6. End with a period${predicateInfo}${rulesInfo}

Natural language rule:
"${context.naturalLanguageRule}"

Prolog rule:`;
}

export interface ExplainResultPromptContext {
  query: CompoundTerm[];
  result: LogicQueryResult;
  knowledgeBase: KnowledgeBase;
}

export function createExplainResultPrompt(context: ExplainResultPromptContext): string {
  const queryStr = context.query.map(termToString).join(', ');
  const solutionsStr = context.result.solutions
    .map((s, i) => {
      const bindings: string[] = [];
      for (const [k, v] of s) {
        if (!k.startsWith('_')) {
          bindings.push(`${k} = ${termToString(v)}`);
        }
      }
      return `  Solution ${i + 1}: ${bindings.length > 0 ? bindings.join(', ') : 'true'}`;
    })
    .join('\n');

  return `You are explaining the results of a logic query to a user.

Query: ${queryStr}

${
  context.result.success
    ? `Found ${context.result.solutions.length} solution(s):
${solutionsStr}`
    : 'Query failed - no solutions found.'
}

Explain these results in natural language. Be clear and concise.
If there are multiple solutions, explain what they represent.
If the query failed, suggest why it might have failed.

Explanation:`;
}

export interface GenerateQueriesPromptContext {
  knowledgeBase: KnowledgeBase;
  topic?: string;
  count?: number;
}

export function createGenerateQueriesPrompt(context: GenerateQueriesPromptContext): string {
  const predicates = context.knowledgeBase.getPredicates();
  const count = context.count || 5;
  const topicInfo = context.topic ? ` about "${context.topic}"` : '';

  return `You are generating interesting queries for a logic programming knowledge base.

Available predicates:
${predicates.map((p) => `  - ${p}`).join('\n')}

Generate ${count} interesting and diverse queries${topicInfo}.

Requirements:
1. Each query should be valid for the available predicates
2. Include a mix of simple and complex queries
3. Use variables where appropriate
4. Include at least one query that might return multiple solutions
5. Format: one query per line, ending with ?

Queries:`;
}

export interface DebugQueryPromptContext {
  query: CompoundTerm[];
  result: LogicQueryResult;
  knowledgeBase: KnowledgeBase;
  expectedResult?: string;
}

export function createDebugQueryPrompt(context: DebugQueryPromptContext): string {
  const queryStr = context.query.map(termToString).join(', ');
  const predicates = context.knowledgeBase.getPredicates();
  const kbSnapshot = context.knowledgeBase.toString().slice(0, 1000);

  const expectedInfo = context.expectedResult ? `\nExpected result: ${context.expectedResult}` : '';

  return `You are debugging a logic programming query that may have unexpected results.

Query: ${queryStr}?
Result: ${context.result.success ? 'success' : 'failure'} with ${context.result.solutions.length} solutions${expectedInfo}

Available predicates:
${predicates.map((p) => `  - ${p}`).join('\n')}

Knowledge base (first 1000 chars):
${kbSnapshot}

Analyze the query and explain:
1. Why the query produced this result
2. Possible issues with the query
3. Suggestions for fixing the query

Analysis:`;
}

export function formatQueryForLLM(query: CompoundTerm[]): string {
  return query.map(termToString).join(', ') + '?';
}

export function formatClauseForLLM(clause: Clause): string {
  const head = termToString(clause.head);
  if (clause.body.length === 0) {
    return `${head}.`;
  }
  const body = clause.body.map(termToString).join(', ');
  return `${head} :- ${body}.`;
}

export function formatKnowledgeBaseForLLM(kb: KnowledgeBase, maxClauses: number = 50): string {
  const clauses = kb.getAllClauses();
  const sample = clauses.slice(0, maxClauses);
  const remaining = clauses.length - sample.length;

  let result = sample.map(formatClauseForLLM).join('\n');

  if (remaining > 0) {
    result += `\n... and ${remaining} more clauses`;
  }

  return result;
}

export interface ParseLLMResponseResult {
  success: boolean;
  queries?: string[];
  facts?: string[];
  rules?: string[];
  error?: string;
}

export function parseLLMQueryResponse(response: string): ParseLLMResponseResult {
  const lines = response
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

  const queries: string[] = [];

  for (const line of lines) {
    const cleaned = line.replace(/^\d+\.\s*/, '').trim();

    if (cleaned.endsWith('?') || cleaned.endsWith('.')) {
      queries.push(cleaned.endsWith('?') ? cleaned : cleaned.replace(/\.$/, '?'));
    } else if (cleaned.includes('(') && cleaned.includes(')')) {
      queries.push(cleaned + '?');
    }
  }

  return {
    success: queries.length > 0,
    queries: queries.length > 0 ? queries : undefined,
    error: queries.length === 0 ? 'No valid queries found in response' : undefined,
  };
}

export function parseLLMFactsResponse(response: string): ParseLLMResponseResult {
  const lines = response
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

  const facts: string[] = [];
  const rules: string[] = [];

  for (const line of lines) {
    const cleaned = line.replace(/^\d+\.\s*/, '').trim();

    if (!cleaned.includes('(') || !cleaned.endsWith('.')) {
      continue;
    }

    if (cleaned.includes(':-')) {
      rules.push(cleaned);
    } else {
      facts.push(cleaned);
    }
  }

  const success = facts.length > 0 || rules.length > 0;

  return {
    success,
    facts: facts.length > 0 ? facts : undefined,
    rules: rules.length > 0 ? rules : undefined,
    error: success ? undefined : 'No valid facts or rules found in response',
  };
}
