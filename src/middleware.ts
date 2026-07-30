import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runWithContext } from './context';
import { getTraceContext } from './otel';

export const REQUEST_ID_HEADER = 'x-request-id';


export function requestContextMiddleware(): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const requestId = (Array.isArray(incoming) ? incoming[0] : incoming) ?? uuidv4();

    res.setHeader(REQUEST_ID_HEADER, requestId);

    const trace = getTraceContext();
    const context = {
      requestId,
      traceId: trace.traceId ?? '',
      spanId: trace.spanId ?? '',
    };

    runWithContext(context, () => {
      next();
    });
  };
}
