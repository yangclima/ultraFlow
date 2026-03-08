import { DefaultReporter } from 'vitest/reporters';
import { TestCase, TestModule, TestSuite } from 'vitest/node';

// ─── ANSI helpers ────────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
} as const;

type Mod = keyof typeof C;

const c = (text: string, ...mods: Mod[]) =>
  mods.map((m) => C[m]).join('') + text + C.reset;

// ─── Duration ────────────────────────────────────────────────────────────────

function formatDuration(ms: number | undefined): string {
  if (ms === undefined || ms < 0) return '';
  if (ms < 1000) return ` (${Math.round(ms)} ms)`;
  return ` (${(ms / 1000).toFixed(3)} s)`;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

interface Stats {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

function collectStats(suite: TestSuite): Stats {
  let passed = 0,
    failed = 0,
    skipped = 0;

  for (const child of suite.children.array()) {
    if (child.type === 'test') {
      const state = child.result()?.state;
      if (state === 'passed') passed++;
      else if (state === 'failed') failed++;
      else skipped++;
    } else if (child.type === 'suite') {
      const s = collectStats(child);
      passed += s.passed;
      failed += s.failed;
      skipped += s.skipped;
    }
  }

  return { passed, failed, skipped, total: passed + failed + skipped };
}

// ─── Renderers ───────────────────────────────────────────────────────────────

/**
 * Jest uses:
 *   ✓ test name  (green, dimmed for passing)
 *   ✕ test name  (red+bold for failing)
 *   ○ test name  (yellow for skipped/todo)
 */
function renderTest(test: TestCase, depth: number): string {
  const indent = '    ' + '  '.repeat(depth);
  const state = test.result()?.state;
  const dur = test.diagnostic()?.duration;

  if (state === 'passed') {
    return `${indent}${c('✓', 'green')} ${c(test.name + formatDuration(dur), 'dim')}`;
  }

  if (state === 'failed') {
    return `${indent}${c('✕', 'red', 'bold')} ${c(test.name, 'red', 'bold')}`;
  }

  // skipped / todo / pending
  return `${indent}${c('○', 'yellow')} ${c(test.name, 'yellow')}`;
}

/**
 * Jest renders describe blocks as plain bold labels, no icon.
 *   describe('UserService', ...)
 *   →  UserService
 *        ✓ creates a user
 */
function renderSuite(suite: TestSuite, depth: number): string[] {
  const indent = '    ' + '  '.repeat(depth);
  const lines: string[] = [];

  lines.push(`${indent}${c(suite.name, 'bold')}`);

  for (const child of suite.children.array()) {
    if (child.type === 'test') {
      lines.push(renderTest(child, depth + 1));
    } else if (child.type === 'suite') {
      lines.push(...renderSuite(child, depth + 1));
    }
  }

  return lines;
}

// ─── Reporter ─────────────────────────────────────────────────────────────────

export default class JestStyleReporter extends DefaultReporter {
  override onTestModuleEnd(module: TestModule): void {
    const lines: string[] = [];

    // ── Aggregate stats across all top-level children ──
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let hasFailed = false;

    for (const child of module.children.array()) {
      if (child.type === 'suite') {
        const s = collectStats(child);
        totalPassed += s.passed;
        totalFailed += s.failed;
        totalSkipped += s.skipped;
        if (s.failed > 0) hasFailed = true;
      } else if (child.type === 'test') {
        const state = child.result()?.state;
        if (state === 'passed') totalPassed++;
        else if (state === 'failed') {
          totalFailed++;
          hasFailed = true;
        } else totalSkipped++;
      }
    }

    // ── Header: "PASS path/to/file" ──
    const badge = hasFailed
      ? c(' FAIL ', 'bgRed', 'white', 'bold')
      : c(' PASS ', 'bgGreen', 'white', 'bold');

    const filePath = c(module.moduleId.replace(process.cwd() + '/', ''), 'dim');
    lines.push(`${badge} ${filePath}`);

    // ── Test tree ──
    for (const child of module.children.array()) {
      if (child.type === 'suite') {
        lines.push(...renderSuite(child, 0));
      } else if (child.type === 'test') {
        lines.push(renderTest(child, 0));
      }
    }

    // ── Footer summary (Jest style: "Tests: 2 failed, 5 passed, 7 total") ──
    lines.push('');

    const total = totalPassed + totalFailed + totalSkipped;
    const parts: string[] = [];
    if (totalFailed > 0) parts.push(c(`${totalFailed} failed`, 'red', 'bold'));
    if (totalSkipped > 0)
      parts.push(c(`${totalSkipped} skipped`, 'yellow', 'bold'));
    if (totalPassed > 0)
      parts.push(c(`${totalPassed} passed`, 'green', 'bold'));
    parts.push(`${total} total`);

    lines.push(`${'Tests:'.padEnd(12)}${parts.join(', ')}`);
    lines.push('');

    this.ctx.logger.log(lines.join('\n'));
  }
}
