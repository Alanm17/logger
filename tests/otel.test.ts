import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getTraceContext } from '../src/otel';

describe('getTraceContext', () => {
  it('returns an object (possibly empty) and never throws', () => {
    const result = getTraceContext();
    assert.equal(typeof result, 'object');
    assert.ok(result !== null);
  });

  it('returns {} when there is no active OTel span', () => {
    // Without setting up an OTel tracer, there is no active span
    const result = getTraceContext();
    assert.equal(result.traceId, undefined);
    assert.equal(result.spanId, undefined);
  });
});
