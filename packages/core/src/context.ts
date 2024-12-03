import type { ContextVariableMap, ExecutionContext } from "hono";
import { HonoRequest } from "hono/request";
import type { Result } from "hono/router";
import type {
  BlankInput,
  FetchEventLike,
  H,
  Input,
  RouterRoute,
} from "hono/types";
import type { IsAny } from "hono/utils/types";
import type { Env, NotFoundHandler } from "./types";

/**
 * Interface for getting context variables.
 *
 * @template E - Environment type.
 */
interface Get<E extends Env> {
  <Key extends keyof E["Variables"]>(key: Key): E["Variables"][Key];
  <Key extends keyof ContextVariableMap>(key: Key): ContextVariableMap[Key];
}

/**
 * Interface for setting context variables.
 *
 * @template E - Environment type.
 */
interface Set<E extends Env> {
  <Key extends keyof E["Variables"]>(
    key: Key,
    value: E["Variables"][Key],
  ): void;
  <Key extends keyof ContextVariableMap>(
    key: Key,
    value: ContextVariableMap[Key],
  ): void;
}

/**
 * Options for configuring the context.
 *
 * @template E - Environment type.
 */
type ContextOptions<E extends Env> = {
  /**
   * Execution context for the request.
   */
  executionCtx?: FetchEventLike | ExecutionContext | undefined;
  /**
   * Handler for not found responses.
   */
  notFoundHandler?: NotFoundHandler<E>;
  matchResult?: Result<[H, RouterRoute]>;
  path?: string;
};

export class Context<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends Env = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends string = any,
  I extends Input = BlankInput,
> {
  #rawRequest: Request;
  #req: HonoRequest<P, I["out"]> | undefined;
  #var: Map<unknown, unknown> | undefined;
  // TODO: Need to figure this out
  finalized = true;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error: Error | undefined;

  #executionCtx: FetchEventLike | ExecutionContext | undefined;
  res: any;
  #notFoundHandler: NotFoundHandler<E> | undefined;

  #matchResult: Result<[H, RouterRoute]> | undefined;
  #path: string | undefined;

  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req: Request, options?: ContextOptions<E>) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }

  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req(): HonoRequest<P, I["out"]> {
    this.#req ??= new HonoRequest(
      this.#rawRequest,
      this.#path,
      this.#matchResult,
    );
    return this.#req;
  }

  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event(): FetchEventLike {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    }

    throw Error("This context has no FetchEvent");
  }

  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx(): ExecutionContext {
    if (this.#executionCtx) {
      return this.#executionCtx as ExecutionContext;
    }

    throw Error("This context has no ExecutionContext");
  }

  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is cool!!')
   *   await next()
   * })
   * ```
   */
  set: Set<
    IsAny<E> extends true
      ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Variables: ContextVariableMap & Record<string, any>;
        }
      : E
  > = (key: string, value: unknown) => {
    this.#var ??= new Map();
    this.#var.set(key, value);
  };

  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get: Get<
    IsAny<E> extends true
      ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Variables: ContextVariableMap & Record<string, any>;
        }
      : E
  > = (key: string) => {
    return this.#var ? this.#var.get(key) : undefined;
  };

  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var(): Readonly<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ContextVariableMap &
      (IsAny<E["Variables"]> extends true
        ? Record<string, any>
        : E["Variables"])
  > {
    if (!this.#var) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {} as any;
    }
    return Object.fromEntries(this.#var);
  }

  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = (): any | Promise<any> => {
    return this.#notFoundHandler?.(this);
  };
}
