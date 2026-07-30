import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestContext } from './types';

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Run `fn` with the given context available to everything it calls
 * (synchronously or via async/await/promises) until it finishes.
 */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
    return storage.run(context, fn);
}

/** Get the current request context, or undefined if none is active. */
export function getContext(): RequestContext | undefined {
    return storage.getStore();
}

/** Merge new fields into the currently active context, if one exists. */
export function addToContext(fields: Partial<RequestContext>): void {
    const current = storage.getStore();
    if (current) {
        Object.assign(current, fields);
    }
}
