import { BlankInput, Input, Next } from "hono/types";

export interface RouterRoute {
  path: string;
  handler: H;
}

export type HandlerResponse<T> = T | Promise<T>;

export type Handler<
  P extends string = any,
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any
> = (c: Context<P, I>, next: Next) => R;

export type MiddlewareHandler<
  P extends string = string,
  I extends Input = {},
  R = any
> = (c: Context<P, I>, next: Next) => Promise<R | void>;

export type H<
  P extends string = any,
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any
> = Handler<P, I, R> | MiddlewareHandler<P, I, R>;
