export interface RequestContext {
    requestId: string;
    traceId:string;
    spanId:string;
    [key:string]:unknown;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';


export type LogFields = Record<string, unknown>;

export interface LoggerOptions {
    level?: LogLevel;
    
}

export interface Logger {
    error(message: string,fields?: LogFields) : void;
    warn(message: string,fields?: LogFields) : void;
    info(message: string,fields?: LogFields) : void;
    debug(message: string,fields?: LogFields) : void;
}
