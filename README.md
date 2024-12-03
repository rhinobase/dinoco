# 🦕 Dinoco

[![npm version](https://img.shields.io/npm/v/dinoco.svg)](https://npmjs.org/package/dinoco "View this project on NPM")
[![npm downloads](https://img.shields.io/npm/dm/dinoco)](https://www.npmjs.com/package/dinoco)
[![license](https://img.shields.io/npm/l/dinoco)](LICENSE)

A flexible, type-safe server-side router for meta-frameworks like Next.js and Nuxt.js, inspired by [Hono.js](https://hono.dev). Build powerful dynamic routes for `[...slug]` or `[[...slug]]` with ease.

This is basically a smaller and more focused version of Hono.js, with a focus on dynamic routes and server-side routing. But the API is very similar, so if you are familiar with Hono.js, you should feel right at home.

> [!Note]
> This package is still in development and your feedback is highly appreciated. If you have any suggestions or issues, please let us know by creating an issue on GitHub.

## Usage

### Installation

Install the package using your package manager of choice.

```bash
npm install dinoco
```

### Basic Usage

You can define routes using the `Dinoco` class and the `get` method. The `get` method accepts a path and a handler function. The handler function should return a the component that should be rendered for the given path.

Here we are using `next@15` as an example, but this package can be used with any meta-framework that supports dynamic routes.

```tsx
// [[...segments]].tsx or [...segments].tsx
import { Dinoco } from "dinoco";

const app = new Dinoco();

app.get("/about", () => {
  return <div>About Page</div>;
});

app.get("/", () => {
  return <div>Home Page</div>;
});

type Args = {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export default async function IdPage(props: Args) {
  const segments = (await props.params).segments;
  const searchParams = await props.searchParams;

  return app.fetch(segments, searchParams);
}
```

### Middlewares

You can use middlewares to run code before the handler function is called. Middlewares can be used to check if a user is authenticated, fetch data, or any other logic you need to run before the handler function is called.

```tsx
app.use(async (c, next) => {
  // Some auth logic
  const user = await fetchUser();
  c.set("user", user);

  await next();
}, async (c, next) => {
  const user = c.get("user");

  if (!user) notFound();

  await next();
});
```

### Error Handling & 404

```tsx
app.notFound(() => {
  // For Nextjs
  return notFound();
});

app.onError((err, c) => {
  // Handle errors here
})
```

## Contributing

We would love to have more contributors involved!

To get started, please read our [Contributing Guide](https://github.com/rhinobase/hono-openapi/blob/main/CONTRIBUTING.md).

## Credits

- This project would not have been possible without the work of [Yusuke Wada](https://github.com/yusukebe) and Honojs's Community, on [HonoJS](https://github.com/honojs/hono) package.
