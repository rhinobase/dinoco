import { HonoRequest } from "hono/request";
import type { Input } from "hono/types";

export class Context<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends string = any,
  I extends Input = {}
> {
  #rawRequest: Request;
  #req: HonoRequest<P, I["out"]> | undefined;
  #var: Map<unknown, unknown> | undefined;
  finalized = false;
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
  #headers: Headers | undefined;
  #preparedHeaders: Record<string, string> | undefined;
  #layout: Layout<PropsForRenderer & { Layout: Layout }> | undefined;
  #renderer: Renderer | undefined;

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
      this.env = options.env;
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
      this.#matchResult
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
    } else {
      throw Error("This context has no FetchEvent");
    }
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
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }

  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render: Renderer = (...args) => {
    this.#renderer ??= (content: string | Promise<string>) =>
      this.html(content);
    return this.#renderer(...args);
  };

  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (
    layout: Layout<PropsForRenderer & { Layout: Layout }>
  ): Layout<
    PropsForRenderer & {
      Layout: Layout;
    }
  > => (this.#layout = layout);

  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = (): Layout<PropsForRenderer & { Layout: Layout }> | undefined =>
    this.#layout;

  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer: Renderer): void => {
    this.#renderer = renderer;
  };

  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header: SetHeaders = (name, value, options): void => {
    // Clear the header
    if (value === undefined) {
      if (this.#headers) {
        this.#headers.delete(name);
      } else if (this.#preparedHeaders) {
        delete this.#preparedHeaders[name.toLocaleLowerCase()];
      }
      if (this.finalized) {
        this.res.headers.delete(name);
      }
      return;
    }

    if (options?.append) {
      if (!this.#headers) {
        this.#isFresh = false;
        this.#headers = new Headers(this.#preparedHeaders);
        this.#preparedHeaders = {};
      }
      this.#headers.append(name, value);
    } else {
      if (this.#headers) {
        this.#headers.set(name, value);
      } else {
        this.#preparedHeaders ??= {};
        this.#preparedHeaders[name.toLowerCase()] = value;
      }
    }

    if (this.finalized) {
      if (options?.append) {
        this.res.headers.append(name, value);
      } else {
        this.res.headers.set(name, value);
      }
    }
  };

  status = (status: StatusCode): void => {
    this.#isFresh = false;
    this.#status = status;
  };

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
}
