import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runWithContext, getContext, addToContext } from '../src/context';
import type { RequestContext } from '../src/types';

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return { requestId: 'req-1', traceId: 'trace-1', spanId: 'span-1', ...overrides };
}

describe('context', () => {
  // ── runWithContext + getContext ──────────────────────────────────────

  it('getContext returns undefined when no context is active', () => {
    assert.equal(getContext(), undefined);
  });

  it('getContext returns the context set by runWithContext', () => {
    const ctx = makeCtx();
    runWithContext(ctx, () => {
      assert.deepStrictEqual(getContext(), ctx);
    });
  });

  it('context is available inside async callbacks', async () => {
    const ctx = makeCtx({ requestId: 'async-req' });
    await runWithContext(ctx, async () => {
      await new Promise((r) => setTimeout(r, 10));
      assert.equal(getContext()?.requestId, 'async-req');
    });
  });

  it('context is no longer active after runWithContext returns', () => {
    runWithContext(makeCtx(), () => {});
    assert.equal(getContext(), undefined);
  });

  it('nested runWithContext replaces the outer context', () => {
    const outer = makeCtx({ requestId: 'outer' });
    const inner = makeCtx({ requestId: 'inner' });

    runWithContext(outer, () => {
      assert.equal(getContext()?.requestId, 'outer');
      runWithContext(inner, () => {
        assert.equal(getContext()?.requestId, 'inner');
      });
      // outer is restored after inner finishes
      assert.equal(getContext()?.requestId, 'outer');
    });
  });

  // ── addToContext ────────────────────────────────────────────────────

  it('addToContext merges fields into the active context', () => {
    const ctx = makeCtx();
    runWithContext(ctx, () => {
      addToContext({ traceId: 'updated-trace' });
      assert.equal(getContext()?.traceId, 'updated-trace');
      // other fields are untouched
      assert.equal(getContext()?.requestId, 'req-1');
    });
  });

  it('addToContext is a no-op when no context is active', () => {
    // should not throw
    addToContext({ traceId: 'ignored' });
    assert.equal(getContext(), undefined);
  });

  it('addToContext can add arbitrary extra fields via the index signature', () => {
    runWithContext(makeCtx(), () => {
      addToContext({ userId: 'u-42' } as Partial<RequestContext>);
      const ctx = getContext();
      assert.equal(ctx?.['userId'], 'u-42');
    });
  });

  // ── parallel isolation ──────────────────────────────────────────────

  it('concurrent async contexts are isolated from each other', async () => {
    const results: string[] = [];

    const task = (id: string, delayMs: number) =>
      runWithContext(makeCtx({ requestId: id }), async () => {
        await new Promise((r) => setTimeout(r, delayMs));
        results.push(getContext()!.requestId);
      });

    await Promise.all([task('fast', 5), task('slow', 20)]);

    assert.ok(results.includes('fast'));
    assert.ok(results.includes('slow'));
  });
});
