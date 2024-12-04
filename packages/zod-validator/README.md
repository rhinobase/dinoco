# Zod validator middleware for Dinoco

The validator middleware using [Zod](https://zod.dev) for [Dinoco](https://github.com/rhinobase/dinoco) applications.
You can write a schema with Zod and validate the incoming values.

## Usage

```tsx
import { z } from "zod";
import { zValidator } from "@dinoco/zod-validator";

const schema = z.object({
  name: z.string(),
});

app.get("/author", zValidator("query", schema), (c) => {
  const data = c.req.valid("query");

  return <div>Hello, {data.name}!</div>;
});
```

Hook:

```ts
app.post(
  "/post",
  zValidator("query", schema, (result, c) => {
    if (!result.success) {
      throw new Error("Invalid query");
    }
  })
  //...
);
```
