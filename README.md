# @alanxdev/logger

[![npm version](https://img.shields.io/npm/v/@alanxdev/logger.svg)](https://www.npmjs.com/package/@alanxdev/logger)

A simple wrapper around Pino that automatically passes request IDs and tracing info through your logs using Node's `async_hooks`.

You don't need to pass a logger instance around your app. Just set up the middleware once, and any log down the chain will automatically include the `requestId`, `traceId`, and `spanId`.

## Install

```bash
npm install @alanxdev/logger
```

## How to use it

### Basic setup with Express

The easiest way to use it is with the Express middleware. It grabs the `x-request-id` header (or generates one) and wraps the request.

```typescript
import express from 'express';
import { createLogger, requestContextMiddleware } from '@alanxdev/logger';

const app = express();
const log = createLogger('payment-service');

app.use(requestContextMiddleware());

app.post('/payments/charge', async (req, res) => {
  // You don't need to pass req or context here! 
  // It automatically knows the requestId from the middleware.
  log.info('Initiating payment charge', { amount: req.body.amount, currency: 'USD' }); 
  
  res.send({ status: 'success' });
});
```

### Adding custom fields

If you want to add more context (like a transaction ID or user ID) mid-request so it shows up in all future logs for that request:

```typescript
import { addToContext } from '@alanxdev/logger';

app.post('/payments/charge', (req, res) => {
  addToContext({ transactionId: req.body.txId, userId: req.user.id });
  
  // This log will automatically include "transactionId" and "userId"
  log.info('Processing payment via Stripe'); 
});
```

### Calling other services

When making HTTP requests to other microservices (like a fraud-detection service), you can easily grab the headers to pass the trace along:

```typescript
import { propagationHeaders } from '@alanxdev/logger';

await fetch('http://fraud-service/api/verify', { 
  headers: propagationHeaders() 
});
```

## Redaction & OpenTelemetry

- Passwords, tokens, and API keys are automatically redacted out of the box.
- If you have `@opentelemetry/api` installed, it automatically pulls `traceId` and `spanId` from the active span.

## Testing it locally

To see everything in action, run the demo script:
```bash
npm run demo
```
# logger
