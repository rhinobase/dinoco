/**
 * @module
 * This module is the base module for the Dinoco object.
 */
import type { ExecutionContext } from "hono";
import type { Router } from "hono/router";
import type {
  FetchEventLike,
  H,
  MergePath,
  MergeSchemaPath,
  Next,
  Schema,
} from "hono/types";
import { mergePath } from "hono/utils/url";
import { compose } from "./compose";
import { Context } from "./context";
import type {
  Env,
  ErrorHandler,
  HandlerInterface,
  MiddlewareHandler,
  MiddlewareHandlerInterface,
  NotFoundHandler,
  RouterRoute,
} from "./types";

/**
 * Symbol used to mark a composed handler.
 */
export const COMPOSED_HANDLER = Symbol("composedHandler");

const notFoundHandler = (c: Context) => {
  return "404 Not Found";
};

const errorHandler = (err: Error, c: Context) => {
  console.error(err);
  return "Internal Server Error";
};

export type DinocoOptions = {
  /**
   * `router` option specifies which router to use.
   *
   * @see {@link https://hono.dev/docs/api/hono#router-option}
   *
   * @example
   * ```ts
   * const app = new Dinoco({ router: new RegExpRouter() })
   * ```
   */
  router?: Router<[H, RouterRoute]>;
};

class Dinoco<
  E extends Env = Env,
  S extends Schema = {},
  BasePath extends string = "/",
  R = any,
> {
  get!: HandlerInterface<E, "get", S, BasePath>;
  use: MiddlewareHandlerInterface<E, S, BasePath>;

  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router!: Router<[H, RouterRoute]>;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  private _basePath = "/";
  #path = "/";

  routes: RouterRoute[] = [];

  constructor(options: DinocoOptions = {}) {
    // Implementation of app.get(...handlers[]) or app.get(path, ...handlers[])

    // @ts-expect-error
    this.get = (args1: string | H, ...args: H[]) => {
      if (typeof args1 === "string") {
        this.#path = args1;
      } else {
        this.#addRoute(this.#path, args1);
      }

      for (const handler of args) {
        this.#addRoute(this.#path, handler);
      }

      return this as any;
    };

    // Implementation of app.use(...handlers[]) or app.use(path, ...handlers[])
    this.use = (
      arg1: string | MiddlewareHandler<any>,
      ...handlers: MiddlewareHandler<any>[]
    ) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      for (const handler of handlers) {
        // @ts-expect-error
        this.#addRoute(this.#path, handler);
      }
      return this as any;
    };

    Object.assign(this, options);
  }

  #clone(): Dinoco<E, S, BasePath> {
    const clone = new Dinoco<E, S, BasePath>({
      router: this.router,
    });
    clone.routes = this.routes;
    return clone;
  }

  #notFoundHandler: NotFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  private errorHandler: ErrorHandler = errorHandler;

  /**
   * `.route()` allows grouping other Dinoco instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Dinoco} app - other Dinoco instance
   * @returns {Dinoco} routed Dinoco instance
   *
   * @example
   * ```ts
   * const app = new Dinoco()
   * const app2 = new Dinoco()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route<
    SubPath extends string,
    SubEnv extends Env,
    SubSchema extends Schema,
    SubBasePath extends string,
  >(
    path: SubPath,
    app: Dinoco<SubEnv, SubSchema, SubBasePath>,
  ): Dinoco<
    E,
    MergeSchemaPath<SubSchema, MergePath<BasePath, SubPath>> | S,
    BasePath
  > {
    const subApp = this.basePath(path);
    app.routes.map((r) => {
      let handler: unknown;
      if (app.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c: Context, next: Next) =>
          (
            await compose<Context>([], app.errorHandler)(c, () =>
              r.handler(c, next),
            )
          ).res;
        (handler as any)[COMPOSED_HANDLER] = r.handler;
      }

      // @ts-expect-error
      subApp.#addRoute(r.path, handler);
    });
    return this;
  }

  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Dinoco} changed Dinoco instance
   *
   * @example
   * ```ts
   * const api = new Dinoco().basePath('/api')
   * ```
   */
  basePath<SubPath extends string>(
    path: SubPath,
  ): Dinoco<E, S, MergePath<BasePath, SubPath>> {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }

  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Dinoco} changed Dinoco instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler: ErrorHandler<E>): Dinoco<E, S, BasePath> => {
    this.errorHandler = handler;
    return this;
  };

  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Dinoco} changed Dinoco instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler: NotFoundHandler<E>): Dinoco<E, S, BasePath> => {
    this.#notFoundHandler = handler;
    return this;
  };

  #addRoute(_path: string, handler: H) {
    const path = mergePath(this._basePath, _path);

    // @ts-expect-error
    const r: RouterRoute = { path, handler };
    this.router.add("GET", path, [handler, r]);
    this.routes.push(r);
  }

  #handleError(err: unknown, c: Context<E>) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }

  #dispatch(
    path: string,
    executionCtx: ExecutionContext | FetchEventLike | undefined,
  ): R | Promise<R> {
    const matchResult = this.router.match("GET", path);

    const c = new Context(new Request(`http://internal${path}`), {
      path,
      // @ts-expect-error
      matchResult,
      executionCtx,
      notFoundHandler: this.#notFoundHandler,
    });

    // Do not `compose` if it has only one handler
    if (matchResult[0].length === 1) {
      let res: ReturnType<H>;
      try {
        // @ts-expect-error
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }

      return res instanceof Promise
        ? res
            .then(
              (resolved: R | undefined) =>
                resolved || (c.finalized ? c.res : this.#notFoundHandler(c)),
            )
            .catch((err: Error) => this.#handleError(err, c))
        : (res ?? this.#notFoundHandler(c));
    }

    const composed = compose<Context>(
      matchResult[0],
      this.errorHandler,
      this.#notFoundHandler,
    );

    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?",
          );
        }

        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }

  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {R | Promise<R>} response of request
   *
   */
  fetch: (path: string, executionCtx?: ExecutionContext) => R | Promise<R> = (
    path,
    ctx,
  ) => {
    return this.#dispatch(path, ctx);
  };
}

export { Dinoco as DinocoBase };
