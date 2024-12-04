import type { Context } from "../context";
import type {
  Env,
  MiddlewareHandler,
  TypedResponse,
  ValidationTargets,
} from "../types";

type ValidationTargetByMethod = keyof ValidationTargets;

export type ValidationFunction<
  InputType,
  OutputType,
  E extends Env = {},
  P extends string = string,
> = (value: InputType, c: Context<E, P>) => OutputType | Promise<OutputType>;

type ExcludeResponseType<T> = T extends TypedResponse<any> ? never : T;

export const validator = <
  InputType,
  P extends string,
  U extends ValidationTargetByMethod,
  OutputType = ValidationTargets[U],
  OutputTypeExcludeResponseType = ExcludeResponseType<OutputType>,
  P2 extends string = P,
  V extends {
    in: {
      [K in U]: {
        // @ts-expect-error
        [K2 in keyof OutputTypeExcludeResponseType]: ValidationTargets[K][K2];
      };
    };
    out: { [K in U]: OutputTypeExcludeResponseType };
  } = {
    in: {
      [K in U]: {
        // @ts-expect-error
        [K2 in keyof OutputTypeExcludeResponseType]: ValidationTargets[K][K2];
      };
    };
    out: { [K in U]: OutputTypeExcludeResponseType };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends Env = any,
>(
  target: U,
  validationFunc: ValidationFunction<
    unknown extends InputType ? ValidationTargets[U] : InputType,
    OutputType,
    E,
    P2
  >,
): MiddlewareHandler<E, P, V> => {
  return async (c, next) => {
    let value = {};

    switch (target) {
      case "query":
        value = Object.fromEntries(
          Object.entries(c.req.queries()).map(([k, v]) => {
            return v.length === 1 ? [k, v[0]] : [k, v];
          }),
        );
        break;
      case "param":
        value = c.req.param() as Record<string, string>;
        break;
    }

    const res = await validationFunc(value as never, c as never);

    c.req.addValidatedData(target, res as never);

    await next();
  };
};
