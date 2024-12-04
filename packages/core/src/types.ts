import type {
  AddParam,
  BlankInput,
  BlankSchema,
  ExtractInput,
  Input,
  IntersectNonAnyTypes,
  MergePath,
  Next,
  Schema,
  Variables,
} from "hono/types";
import type { IsAny, Simplify } from "hono/utils/types";
import type { DinocoBase } from "./base";
import type { Context } from "./context";

export interface RouterRoute {
  path: string;
  handler: H;
}

export type Env = {
  Variables?: Variables;
};

export type NotFoundHandler<E extends Env = any, R = any> = (
  c: Context<E>,
) => R | Promise<R>;

export type ErrorHandler<E extends Env = any, R = any> = (
  err: Error,
  c: Context<E>,
) => R | Promise<R>;

export type HandlerResponse<T> = T | Promise<T>;

export type Handler<
  E extends Env = Env,
  P extends string = any,
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any,
> = (c: Context<E, P, I>, next: Next) => R;

export type MiddlewareHandler<
  E extends Env = Env,
  P extends string = string,
  I extends Input = {},
  R = any,
> = (c: Context<E, P, I>, next: Next) => Promise<R | void>;

export type H<
  E extends Env = Env,
  P extends string = any,
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any,
> = Handler<E, P, I, R> | MiddlewareHandler<E, P, I, R>;

export type TypedResponse<T = unknown> = {
  _data: T;
};

type MergeTypedResponse<T> = T extends Promise<infer T2>
  ? T2 extends TypedResponse
    ? T2
    : TypedResponse
  : T extends TypedResponse
    ? T
    : TypedResponse;

type ExtractStringKey<S> = keyof S & string;

type ChangePathOfSchema<
  S extends Schema,
  Path extends string,
> = keyof S extends never
  ? { [K in Path]: {} }
  : { [K in keyof S as Path]: S[K] };

////////////////////////////////////////
//////                            //////
//////     HandlerInterface       //////
//////                            //////
////////////////////////////////////////

export interface HandlerInterface<
  E extends Env = Env,
  M extends string = string,
  S extends Schema = BlankSchema,
  BasePath extends string = "/",
> {
  // app.get(handler)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    I extends Input = BlankInput,
    R extends HandlerResponse<any> = any,
    E2 extends Env = E,
  >(
    handler: H<E2, P, I, R>,
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2]>,
    S & ToSchema<M, P, I, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x2)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    I extends Input = BlankInput,
    I2 extends Input = I,
    R extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
  >(
    ...handlers: [H<E2, P, I>, H<E3, P, I2, R>]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3]>,
    S & ToSchema<M, P, I2, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    E2 extends Env = E,
  >(
    path: P,
    handler: H<E2, MergedPath, I, R>,
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 3)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
  >(
    ...handlers: [H<E2, P, I>, H<E3, P, I2>, H<E4, P, I3, R>]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4]>,
    S & ToSchema<M, P, I3, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x2)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
  >(
    path: P,
    ...handlers: [H<E2, MergedPath, I>, H<E3, MergedPath, I2, R>]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I2, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 4)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
  >(
    ...handlers: [H<E2, P, I>, H<E3, P, I2>, H<E4, P, I3>, H<E5, P, I4, R>]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    S & ToSchema<M, P, I4, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x3)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I3, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 5)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
    S & ToSchema<M, P, I5, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x4)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I4, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 6)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
    S & ToSchema<M, P, I6, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x5)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I5, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 7)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6>,
      H<E8, P, I7, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
    S & ToSchema<M, P, I7, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x6)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I6, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 8)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6>,
      H<E8, P, I7>,
      H<E9, P, I8, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
    S & ToSchema<M, P, I8, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x7)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6>,
      H<E8, MergedPath, I7, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I7, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 9)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6>,
      H<E8, P, I7>,
      H<E9, P, I8>,
      H<E10, P, I9, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9, E10]>,
    S & ToSchema<M, P, I9, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x8)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6>,
      H<E8, MergedPath, I7>,
      H<E9, MergedPath, I8, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I8, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 10)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    I10 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8 & I9,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = E,
    E11 extends Env = IntersectNonAnyTypes<
      [E, E2, E3, E4, E5, E6, E7, E8, E9, E10]
    >,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6>,
      H<E8, P, I7>,
      H<E9, P, I8>,
      H<E10, P, I9>,
      H<E11, P, I10, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11]>,
    S & ToSchema<M, P, I10, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x9)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6>,
      H<E8, MergedPath, I7>,
      H<E9, MergedPath, I8>,
      H<E10, MergedPath, I9, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I9, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x10)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    I10 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8 & I9,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = E,
    E11 extends Env = IntersectNonAnyTypes<
      [E, E2, E3, E4, E5, E6, E7, E8, E9, E10]
    >,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6>,
      H<E8, MergedPath, I7>,
      H<E9, MergedPath, I8>,
      H<E10, MergedPath, I9>,
      H<E11, MergedPath, I10, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I10, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(...handlers[])
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    I extends Input = BlankInput,
    R extends HandlerResponse<any> = any,
  >(
    ...handlers: H<E, P, I, R>[]
  ): DinocoBase<E, S & ToSchema<M, P, I, MergeTypedResponse<R>>, BasePath>;

  // app.get(path, ...handlers[])
  <
    P extends string,
    I extends Input = BlankInput,
    R extends HandlerResponse<any> = any,
  >(
    path: P,
    ...handlers: H<E, MergePath<BasePath, P>, I, R>[]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path)
  <
    P extends string,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
  >(
    path: P,
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I, MergeTypedResponse<R>>,
    BasePath
  >;
}

////////////////////////////////////////
//////                            //////
//////     HandlerInterface       //////
//////                            //////
////////////////////////////////////////

export interface HandlerInterface<
  E extends Env = Env,
  M extends string = string,
  S extends Schema = BlankSchema,
  BasePath extends string = "/",
> {
  // app.get(handler)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    I extends Input = BlankInput,
    R extends HandlerResponse<any> = any,
    E2 extends Env = E,
  >(
    handler: H<E2, P, I, R>,
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2]>,
    S & ToSchema<M, P, I, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x2)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    I extends Input = BlankInput,
    I2 extends Input = I,
    R extends HandlerResponse<any> = any,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
  >(
    ...handlers: [H<E2, P, I>, H<E3, P, I2, R>]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3]>,
    S & ToSchema<M, P, I2, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    E2 extends Env = E,
  >(
    path: P,
    handler: H<E2, MergedPath, I, R>,
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 3)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
  >(
    ...handlers: [H<E2, P, I>, H<E3, P, I2>, H<E4, P, I3, R>]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4]>,
    S & ToSchema<M, P, I3, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x2)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
  >(
    path: P,
    ...handlers: [H<E2, MergedPath, I>, H<E3, MergedPath, I2, R>]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I2, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 4)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
  >(
    ...handlers: [H<E2, P, I>, H<E3, P, I2>, H<E4, P, I3>, H<E5, P, I4, R>]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    S & ToSchema<M, P, I4, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x3)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I3, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 5)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
    S & ToSchema<M, P, I5, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x4)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I4, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 6)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
    S & ToSchema<M, P, I6, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x5)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I5, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 7)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6>,
      H<E8, P, I7, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
    S & ToSchema<M, P, I7, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x6)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I6, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 8)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6>,
      H<E8, P, I7>,
      H<E9, P, I8, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
    S & ToSchema<M, P, I8, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x7)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6>,
      H<E8, MergedPath, I7, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I7, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 9)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6>,
      H<E8, P, I7>,
      H<E9, P, I8>,
      H<E10, P, I9, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9, E10]>,
    S & ToSchema<M, P, I9, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x8)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6>,
      H<E8, MergedPath, I7>,
      H<E9, MergedPath, I8, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I8, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(handler x 10)
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    I10 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8 & I9,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = E,
    E11 extends Env = IntersectNonAnyTypes<
      [E, E2, E3, E4, E5, E6, E7, E8, E9, E10]
    >,
  >(
    ...handlers: [
      H<E2, P, I>,
      H<E3, P, I2>,
      H<E4, P, I3>,
      H<E5, P, I4>,
      H<E6, P, I5>,
      H<E7, P, I6>,
      H<E8, P, I7>,
      H<E9, P, I8>,
      H<E10, P, I9>,
      H<E11, P, I10, R>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11]>,
    S & ToSchema<M, P, I10, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x9)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6>,
      H<E8, MergedPath, I7>,
      H<E9, MergedPath, I8>,
      H<E10, MergedPath, I9, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I9, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path, handler x10)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
    I2 extends Input = I,
    I3 extends Input = I & I2,
    I4 extends Input = I & I2 & I3,
    I5 extends Input = I & I2 & I3 & I4,
    I6 extends Input = I & I2 & I3 & I4 & I5,
    I7 extends Input = I & I2 & I3 & I4 & I5 & I6,
    I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7,
    I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8,
    I10 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8 & I9,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = E,
    E11 extends Env = IntersectNonAnyTypes<
      [E, E2, E3, E4, E5, E6, E7, E8, E9, E10]
    >,
  >(
    path: P,
    ...handlers: [
      H<E2, MergedPath, I>,
      H<E3, MergedPath, I2>,
      H<E4, MergedPath, I3>,
      H<E5, MergedPath, I4>,
      H<E6, MergedPath, I5>,
      H<E7, MergedPath, I6>,
      H<E8, MergedPath, I7>,
      H<E9, MergedPath, I8>,
      H<E10, MergedPath, I9>,
      H<E11, MergedPath, I10, R>,
    ]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I10, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(...handlers[])
  <
    P extends string = ExtractStringKey<S> extends never
      ? BasePath
      : ExtractStringKey<S>,
    I extends Input = BlankInput,
    R extends HandlerResponse<any> = any,
  >(
    ...handlers: H<E, P, I, R>[]
  ): DinocoBase<E, S & ToSchema<M, P, I, MergeTypedResponse<R>>, BasePath>;

  // app.get(path, ...handlers[])
  <
    P extends string,
    I extends Input = BlankInput,
    R extends HandlerResponse<any> = any,
  >(
    path: P,
    ...handlers: H<E, MergePath<BasePath, P>, I, R>[]
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I, MergeTypedResponse<R>>,
    BasePath
  >;

  // app.get(path)
  <
    P extends string,
    R extends HandlerResponse<any> = any,
    I extends Input = BlankInput,
  >(
    path: P,
  ): DinocoBase<
    E,
    S & ToSchema<M, MergePath<BasePath, P>, I, MergeTypedResponse<R>>,
    BasePath
  >;
}

////////////////////////////////////////
//////                            //////
////// MiddlewareHandlerInterface //////
//////                            //////
////////////////////////////////////////

export interface MiddlewareHandlerInterface<
  E extends Env = Env,
  S extends Schema = BlankSchema,
  BasePath extends string = "/",
  R = any,
> {
  //// app.use(...handlers[])
  <E2 extends Env = E>(
    ...handlers: MiddlewareHandler<
      E2,
      MergePath<BasePath, ExtractStringKey<S>>
    >[]
  ): DinocoBase<IntersectNonAnyTypes<[E, E2]>, S, BasePath, R>;

  // app.use(handler)
  <E2 extends Env = E>(
    handler: MiddlewareHandler<E2, MergePath<BasePath, ExtractStringKey<S>>>,
  ): DinocoBase<IntersectNonAnyTypes<[E, E2]>, S, BasePath, R>;

  // app.use(handler x2)
  <
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [MiddlewareHandler<E2, P>, MiddlewareHandler<E3, P>]
  ): DinocoBase<IntersectNonAnyTypes<[E, E2, E3]>, S, BasePath, R>;

  // app.get(path, handler)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
  >(
    path: P,
    handler: MiddlewareHandler<E2, MergedPath>,
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  // app.use(handler x3)
  <
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
    ]
  ): DinocoBase<IntersectNonAnyTypes<[E, E2, E3, E4]>, S, BasePath, R>;

  // app.get(path, handler x2)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
    E3 extends Env = IntersectNonAnyTypes<[E, E2]>,
  >(
    path: P,
    ...handlers: [MiddlewareHandler<E2, P>, MiddlewareHandler<E3, P>]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  // app.use(handler x4)
  <
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
    ]
  ): DinocoBase<IntersectNonAnyTypes<[E, E2, E3, E4, E5]>, S, BasePath, R>;

  // app.get(path, handler x3)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = IntersectNonAnyTypes<[E, E2, E3]>,
  >(
    path: P,
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  // app.use(handler x5)
  <
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
    ]
  ): DinocoBase<IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>, S, BasePath, R>;

  // app.get(path, handler x4)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4]>,
  >(
    path: P,
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  // app.use(handler x6)
  <
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
    S,
    BasePath,
    R
  >;

  // app.get(path, handler x5)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5]>,
  >(
    path: P,
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  // app.use(handler x7)
  <
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
      MiddlewareHandler<E8, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
    S,
    BasePath,
    R
  >;

  // app.get(path, handler x6)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6]>,
  >(
    path: P,
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  // app.use(handler x8)
  <
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
      MiddlewareHandler<E8, P>,
      MiddlewareHandler<E9, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
    S,
    BasePath,
    R
  >;

  // app.get(path, handler x7)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7]>,
  >(
    path: P,
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
      MiddlewareHandler<E8, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  // app.use(handler x9)
  <
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
      MiddlewareHandler<E8, P>,
      MiddlewareHandler<E9, P>,
      MiddlewareHandler<E10, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9, E10]>,
    S,
    BasePath,
    R
  >;

  // app.get(path, handler x8)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8]>,
  >(
    path: P,
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
      MiddlewareHandler<E8, P>,
      MiddlewareHandler<E9, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  // app.use(handler x10)
  <
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = E,
    E11 extends Env = IntersectNonAnyTypes<
      [E, E2, E3, E4, E5, E6, E7, E8, E9, E10]
    >,
    P extends string = MergePath<BasePath, ExtractStringKey<S>>,
  >(
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
      MiddlewareHandler<E8, P>,
      MiddlewareHandler<E9, P>,
      MiddlewareHandler<E10, P>,
      MiddlewareHandler<E11, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11]>,
    S,
    BasePath,
    R
  >;

  // app.get(path, handler x9)
  <
    P extends string,
    MergedPath extends MergePath<BasePath, P> = MergePath<BasePath, P>,
    E2 extends Env = E,
    E3 extends Env = E,
    E4 extends Env = E,
    E5 extends Env = E,
    E6 extends Env = E,
    E7 extends Env = E,
    E8 extends Env = E,
    E9 extends Env = E,
    E10 extends Env = IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9]>,
  >(
    path: P,
    ...handlers: [
      MiddlewareHandler<E2, P>,
      MiddlewareHandler<E3, P>,
      MiddlewareHandler<E4, P>,
      MiddlewareHandler<E5, P>,
      MiddlewareHandler<E6, P>,
      MiddlewareHandler<E7, P>,
      MiddlewareHandler<E8, P>,
      MiddlewareHandler<E9, P>,
      MiddlewareHandler<E10, P>,
    ]
  ): DinocoBase<
    IntersectNonAnyTypes<[E, E2, E3, E4, E5, E6, E7, E8, E9, E10]>,
    ChangePathOfSchema<S, MergedPath>,
    BasePath,
    R
  >;

  //// app.use(path, ...handlers[])
  <P extends string, E2 extends Env = E>(
    path: P,
    ...handlers: MiddlewareHandler<E2, MergePath<BasePath, P>>[]
  ): DinocoBase<E, S, BasePath, R>;
}

////////////////////////////////////////
//////                            //////
//////           ToSchema         //////
//////                            //////
////////////////////////////////////////

export type ToSchema<
  M extends string,
  P extends string,
  I extends Input | Input["in"],
  RorO, // Response or Output
> = Simplify<{
  [K in P]: {
    [K2 in M as AddDollar<K2>]: Simplify<
      {
        input: AddParam<ExtractInput<I>, P>;
      } & (IsAny<RorO> extends true
        ? {
            output: {};
          }
        : RorO extends TypedResponse<infer T>
          ? {
              output: unknown extends T ? {} : T;
            }
          : {
              output: unknown extends RorO ? {} : RorO;
            })
    >;
  };
}>;

type AddDollar<T extends string> = `$${Lowercase<T>}`;

////////////////////////////////////////
//////                             /////
//////      ValidationTargets      /////
//////                             /////
////////////////////////////////////////

export type ValidationTargets<P extends string = string> = {
  query: Record<string, string | string[]>;
  param: Record<P, P extends `${infer _}?` ? string | undefined : string>;
};
