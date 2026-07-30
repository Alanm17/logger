import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runWithContext, getContext } from '../src/context';
import { propagationHeaders } from '../src/propagate';
import { REQUEST_ID_HEADER } from '../src/middleware';
import type { RequestContext } from '../src/types';

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return { requestId: 'req-1', traceId: 'trace-1', spanId: 'span-1', ...overrides };
}

describe('propagationHeaders', () => {
  it('returns an empty object when no context is active', () => {
    const headers = propagationHeaders();
    assert.deepStrictEqual(headers, {});
  });

  it('returns x-request-id from the active context', () => {
    runWithContext(makeCtx({ requestId: 'prop-req' }), () => {
      const headers = propagationHeaders();
      assert.equal(headers[REQUEST_ID_HEADER], 'prop-req');
    });
  });

  it('returns empty object when requestId is empty string', () => {
    runWithContext(makeCtx({ requestId: '' }), () => {
      const headers = propagationHeaders();
      assert.deepStrictEqual(headers, {});
    });
  });
});
