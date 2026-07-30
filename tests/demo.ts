/**
 * demo.ts — Run this to see every feature of @alanxdev/logger in action.
 *
 *   npm run demo
 */

import { createLogger, runWithContext, getContext, addToContext, propagationHeaders } from '../src/index';
import type { RequestContext } from '../src/types';

(async () => {
  const log = createLogger('demo-service');

  function separator(title: string) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${title}`);
    console.log(`${'═'.repeat(60)}\n`);
  }

  // ── 1. Basic logging (no context) ──────────────────────────────────

  separator('1. Basic logging — no request context');
  log.info('Server starting up', { port: 3000 });
  log.warn('Cache miss rate is high', { rate: 0.87 });
  log.error('Failed to connect to DB', { host: 'db.internal', retries: 3 });

  // ── 2. Logging inside a request context ────────────────────────────

  separator('2. Logging inside a request context');
  const ctx: RequestContext = {
    requestId: 'abc-123-def',
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    spanId: '00f067aa0ba902b7',
  };

  runWithContext(ctx, () => {
    log.info('Processing order', { orderId: 'ORD-999' });
    log.info('Payment charged', { amount: 49.99, currency: 'USD' });
  });

  // ── 3. addToContext — enrich context mid-request ───────────────────

  separator('3. addToContext — enrich context mid-request');
  runWithContext({ ...ctx }, () => {
    log.info('Before enrichment');

    addToContext({ userId: 'u-42', tenant: 'acme' } as Partial<RequestContext>);
    log.info('After enrichment — userId and tenant are now in every log line');
  });

  // ── 4. Async context propagation ───────────────────────────────────

  separator('4. Async context propagation');
  await runWithContext(ctx, async () => {
    log.info('Start of async handler');

    // simulate a DB call
    await new Promise((r) => setTimeout(r, 50));
    log.info('After awaiting DB call — context is still here');

    // simulate parallel async tasks
    await Promise.all([
      (async () => {
        await new Promise((r) => setTimeout(r, 20));
        log.info('Parallel task A done');
      })(),
      (async () => {
        await new Promise((r) => setTimeout(r, 30));
        log.info('Parallel task B done');
      })(),
    ]);

    log.info('All parallel tasks finished');
  });

  // ── 5. Nested contexts ─────────────────────────────────────────────

  separator('5. Nested contexts (e.g. sub-requests)');
  const outerCtx: RequestContext = { requestId: 'outer-req', traceId: '', spanId: '' };
  const innerCtx: RequestContext = { requestId: 'inner-sub-req', traceId: '', spanId: '' };

  runWithContext(outerCtx, () => {
    log.info('Outer handler');

    runWithContext(innerCtx, () => {
      log.info('Inner sub-request handler');
    });

    log.info('Back to outer handler — context restored');
  });

  // ── 6. propagationHeaders ──────────────────────────────────────────

  separator('6. propagationHeaders — carry context to downstream services');
  runWithContext(ctx, () => {
    const headers = propagationHeaders();
    console.log('Headers to attach to outgoing HTTP calls:', headers);
  });

  // ── 7. Redaction of sensitive fields ───────────────────────────────

  separator('7. Redaction — sensitive fields are automatically hidden');
  log.info('User login attempt', {
    username: 'alice',
    password: 'supersecret',
    token: 'jwt-abc-123',
    apiKey: 'key_live_xxx',
  });

  // ── 8. Log levels ──────────────────────────────────────────────────

  separator('8. Log levels — "warn" level suppresses info/debug');
  const warnLog = createLogger('strict-service', { level: 'warn' });
  warnLog.debug('This will NOT appear');
  warnLog.info('This will NOT appear either');
  warnLog.warn('This WILL appear');
  warnLog.error('This WILL appear too');

  // ── 9. Context isolation across concurrent requests ────────────────

  separator('9. Concurrent request isolation');
  async function handleRequest(id: string, delayMs: number) {
    const reqCtx: RequestContext = { requestId: id, traceId: '', spanId: '' };
    await runWithContext(reqCtx, async () => {
      log.info(`[${id}] Start`);
      await new Promise((r) => setTimeout(r, delayMs));
      log.info(`[${id}] End — context is still correct: ${getContext()?.requestId}`);
    });
  }

  await Promise.all([
    handleRequest('req-FAST', 10),
    handleRequest('req-SLOW', 40),
    handleRequest('req-MED', 25),
  ]);

  separator('Done — all features working!');
})();
