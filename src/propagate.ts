import { getContext } from './context';
import { REQUEST_ID_HEADER } from './middleware';

/**
 * Returns the headers you should attach to any outgoing HTTP call to another
 * internal service, so the request ID (and trace info, if present) carries
 * over. This is what actually stitches a trace across service boundaries.
 *
 * Usage with fetch:
 *   fetch(url, { headers: { ...propagationHeaders(), 'content-type': 'application/json' } })
 */
export function propagationHeaders(): Record<string, string> {
  const context = getContext();
  const headers: Record<string, string> = {};
  if (context?.requestId) {
    headers[REQUEST_ID_HEADER] = context.requestId;
  }
  return headers;
}
