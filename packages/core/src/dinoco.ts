import type { Schema } from "hono";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { SmartRouter } from "hono/router/smart-router";
import { TrieRouter } from "hono/router/trie-router";
import type { BlankEnv, BlankSchema } from "hono/types";
import { DinocoBase, type DinocoOptions } from "./base";
import type { Env } from "./types";

/**
 * The Dinoco class extends the functionality of the DinocoBase class.
 * It sets up routing and allows for custom options to be passed.
 *
 * @template E - The environment type.
 * @template S - The schema type.
 * @template BasePath - The base path type.
 */
export class Dinoco<
  E extends Env = BlankEnv,
  S extends Schema = BlankSchema,
  BasePath extends string = "/",
> extends DinocoBase<E, S, BasePath> {
  /**
   * Creates an instance of the Dinoco class.
   *
   * @param options - Optional configuration options for the Dinoco instance.
   */
  constructor(options: DinocoOptions = {}) {
    super(options);
    this.router =
      options.router ??
      new SmartRouter({
        routers: [new RegExpRouter(), new TrieRouter()],
      });
  }
}
