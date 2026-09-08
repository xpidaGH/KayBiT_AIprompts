/**
 * Text Diff Utility for side-by-side and unified diff comparison.
 * Implements Longest Common Subsequence (LCS) for line and word level diffing.
 */

export type DiffType = 'unchanged' | 'added' | 'deleted' | 'modified' | 'empty';

export interface WordToken {
  text: string;
  type: 'unchanged' | 'added' | 'deleted';
}

export interface SideBySideDiffRow {
  leftLineNumber: number | null;
  leftText: string | null;
  leftType: DiffType;
  leftWords?: WordToken[];

  rightLineNumber: number | null;
  rightText: string | null;
  rightType: DiffType;
  rightWords?: WordToken[];
}

export interface UnifiedDiffLine {
  type: 'unchanged' | 'added' | 'deleted' | 'header';
  oldLineNumber?: number;
  newLineNumber?: number;
  text: string;
  words?: WordToken[];
}

export interface DiffStats {
  additions: number;
  deletions: number;
  modifications: number;
  unchanged: number;
  similarityScore: number; // 0 - 100%
  totalWordsA: number;
  totalWordsB: number;
}

/**
 * Tokenizes a string into words, whitespace, and punctuation tokens
 */
function tokenizeWords(text: string): string[] {
  // Split preserving whitespace and punctuation
  const tokens = text.match(/[\w]+|[^\w\s]+|\s+/g);
  return tokens || [text];
}

/**
 * Computes the Longest Common Subsequence (LCS) table between two string arrays
 */
function computeLCS<T>(a: T[], b: T[], equals = (x: T, y: T) => x === y): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (equals(a[i], b[j])) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }
  return dp;
}

/**
 * Computes word-level diff between two lines
 */
export function computeWordDiff(textA: string, textB: string): { leftWords: WordToken[]; rightWords: WordToken[] } {
  const wordsA = tokenizeWords(textA);
  const wordsB = tokenizeWords(textB);

  const dp = computeLCS(wordsA, wordsB);
  let i = wordsA.length;
  let j = wordsB.length;

  const leftTokensReversed: WordToken[] = [];
  const rightTokensReversed: WordToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      leftTokensReversed.push({ text: wordsA[i - 1], type: 'unchanged' });
      rightTokensReversed.push({ text: wordsB[j - 1], type: 'unchanged' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightTokensReversed.push({ text: wordsB[j - 1], type: 'added' });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      leftTokensReversed.push({ text: wordsA[i - 1], type: 'deleted' });
      i--;
    }
  }

  return {
    leftWords: leftTokensReversed.reverse(),
    rightWords: rightTokensReversed.reverse()
  };
}

/**
 * Computes side-by-side aligned diff between two texts
 */
export function computeSideBySideDiff(textA: string, textB: string): {
  rows: SideBySideDiffRow[];
  stats: DiffStats;
} {
  const linesA = textA ? textA.split(/\r?\n/) : [];
  const linesB = textB ? textB.split(/\r?\n/) : [];

  const dp = computeLCS(linesA, linesB);

  // Backtrack to find line diff items
  type RawDiffItem = 
    | { type: 'unchanged'; lineA: string; lineB: string; idxA: number; idxB: number }
    | { type: 'deleted'; lineA: string; idxA: number }
    | { type: 'added'; lineB: string; idxB: number };

  const rawItemsReversed: RawDiffItem[] = [];
  let i = linesA.length;
  let j = linesB.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      rawItemsReversed.push({
        type: 'unchanged',
        lineA: linesA[i - 1],
        lineB: linesB[j - 1],
        idxA: i - 1,
        idxB: j - 1
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawItemsReversed.push({
        type: 'added',
        lineB: linesB[j - 1],
        idxB: j - 1
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawItemsReversed.push({
        type: 'deleted',
        lineA: linesA[i - 1],
        idxA: i - 1
      });
      i--;
    }
  }

  const rawItems = rawItemsReversed.reverse();

  // Group raw items into aligned rows (pairing deletions with additions as modifications where possible)
  const rows: SideBySideDiffRow[] = [];
  let additionsCount = 0;
  let deletionsCount = 0;
  let modificationsCount = 0;
  let unchangedCount = 0;

  let k = 0;
  while (k < rawItems.length) {
    const item = rawItems[k];

    if (item.type === 'unchanged') {
      rows.push({
        leftLineNumber: item.idxA + 1,
        leftText: item.lineA,
        leftType: 'unchanged',
        rightLineNumber: item.idxB + 1,
        rightText: item.lineB,
        rightType: 'unchanged'
      });
      unchangedCount++;
      k++;
    } else {
      // Gather contiguous block of deletions and additions
      const delGroup: { lineA: string; idxA: number }[] = [];
      const addGroup: { lineB: string; idxB: number }[] = [];

      while (k < rawItems.length && rawItems[k].type !== 'unchanged') {
        const current = rawItems[k];
        if (current.type === 'deleted') {
          delGroup.push({ lineA: current.lineA, idxA: current.idxA });
        } else if (current.type === 'added') {
          addGroup.push({ lineB: current.lineB, idxB: current.idxB });
        }
        k++;
      }

      const maxLen = Math.max(delGroup.length, addGroup.length);
      for (let step = 0; step < maxLen; step++) {
        const delItem = delGroup[step];
        const addItem = addGroup[step];

        if (delItem && addItem) {
          // Paired as modification: compute word-level diff
          const wordDiff = computeWordDiff(delItem.lineA, addItem.lineB);
          rows.push({
            leftLineNumber: delItem.idxA + 1,
            leftText: delItem.lineA,
            leftType: 'modified',
            leftWords: wordDiff.leftWords,
            rightLineNumber: addItem.idxB + 1,
            rightText: addItem.lineB,
            rightType: 'modified',
            rightWords: wordDiff.rightWords
          });
          modificationsCount++;
        } else if (delItem && !addItem) {
          // Deletion only
          rows.push({
            leftLineNumber: delItem.idxA + 1,
            leftText: delItem.lineA,
            leftType: 'deleted',
            rightLineNumber: null,
            rightText: null,
            rightType: 'empty'
          });
          deletionsCount++;
        } else if (!delItem && addItem) {
          // Addition only
          rows.push({
            leftLineNumber: null,
            leftText: null,
            leftType: 'empty',
            rightLineNumber: addItem.idxB + 1,
            rightText: addItem.lineB,
            rightType: 'added'
          });
          additionsCount++;
        }
      }
    }
  }

  // Calculate similarity percentage
  const wordsA = textA.trim().split(/\s+/).filter(Boolean);
  const wordsB = textB.trim().split(/\s+/).filter(Boolean);
  const totalWords = wordsA.length + wordsB.length;
  
  let similarityScore = 100;
  if (totalWords > 0) {
    const wordDp = computeLCS(wordsA, wordsB);
    const lcsWords = wordDp[wordsA.length][wordsB.length];
    similarityScore = Math.round((2 * lcsWords / totalWords) * 100);
  } else if (textA !== textB) {
    similarityScore = 0;
  }

  const stats: DiffStats = {
    additions: additionsCount,
    deletions: deletionsCount,
    modifications: modificationsCount,
    unchanged: unchangedCount,
    similarityScore,
    totalWordsA: wordsA.length,
    totalWordsB: wordsB.length
  };

  return { rows, stats };
}

/**
 * Computes unified diff lines for compact inline view
 */
export function computeUnifiedDiff(textA: string, textB: string): UnifiedDiffLine[] {
  const linesA = textA ? textA.split(/\r?\n/) : [];
  const linesB = textB ? textB.split(/\r?\n/) : [];

  const dp = computeLCS(linesA, linesB);

  const lines: UnifiedDiffLine[] = [];
  let i = 0;
  let j = 0;

  let oldLine = 1;
  let newLine = 1;

  while (i < linesA.length || j < linesB.length) {
    if (i < linesA.length && j < linesB.length && linesA[i] === linesB[j]) {
      lines.push({
        type: 'unchanged',
        oldLineNumber: oldLine,
        newLineNumber: newLine,
        text: linesA[i]
      });
      i++;
      j++;
      oldLine++;
      newLine++;
    } else if (j < linesB.length && (i === linesA.length || dp[i][j + 1] >= dp[i + 1][j])) {
      lines.push({
        type: 'added',
        newLineNumber: newLine,
        text: linesB[j]
      });
      j++;
      newLine++;
    } else if (i < linesA.length && (j === linesB.length || dp[i][j + 1] < dp[i + 1][j])) {
      lines.push({
        type: 'deleted',
        oldLineNumber: oldLine,
        text: linesA[i]
      });
      i++;
      oldLine++;
    }
  }

  return lines;
}

/**
 * Generates unified git diff format text for copying or export
 */
export function generateGitDiffText(versionALabel: string, versionBLabel: string, textA: string, textB: string): string {
  const unified = computeUnifiedDiff(textA, textB);
  const header = `--- a/${versionALabel}\n+++ b/${versionBLabel}\n@@ -1,${textA.split('\n').length} +1,${textB.split('\n').length} @@\n`;
  const body = unified.map(line => {
    if (line.type === 'added') return `+ ${line.text}`;
    if (line.type === 'deleted') return `- ${line.text}`;
    return `  ${line.text}`;
  }).join('\n');

  return header + body;
}
