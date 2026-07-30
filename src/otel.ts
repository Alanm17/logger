import type { RequestContext } from './types';

/**
 * Returns { traceId, spanId } from the currently active OpenTelemetry span,
 * or {} if @opentelemetry/api isn't installed or there's no active span.
 * Defensive by design: services that haven't adopted OTel yet are
 * completely unaffected, and this can never throw.
 */
export function getTraceContext(): Partial<Pick<RequestContext, 'traceId' | 'spanId'>> {
  let otelApi: typeof import('@opentelemetry/api');
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    otelApi = require('@opentelemetry/api');
  } catch {
    return {}; 
  }

  try {
    const span = otelApi.trace.getActiveSpan();
    if (!span) return {};
    const spanContext = span.spanContext();
    if (!spanContext) return {};
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
    };
  } catch {
    return {}; // never let tracing hiccups break logging
  }
}
