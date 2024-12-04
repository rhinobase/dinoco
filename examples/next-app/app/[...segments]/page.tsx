import { ClientPage } from "@/components/Client";
import { ServerPage } from "@/components/Server";
import { zValidator } from "@dinoco/zod-validator";
import { Dinoco } from "dinoco";
import { notFound } from "next/navigation";
import z from "zod";

const app = new Dinoco()
  .notFound(() => {
    return notFound();
  })
  .onError((err) => {
    throw err;
  });

const schema = z.object({
  name: z.string().max(10).optional(),
});

app.get("/server", zValidator("query", schema), (c) => {
  const { name } = c.req.valid("query");
  return <ServerPage name={name} />;
});

app.get("/client", () => {
  return <ClientPage />;
});

type Args = {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export async function generateStaticParams() {
  return app.routes.map((slug) => ({
    segments: slug.path.split("/").slice(1),
  }));
}

export default async function DinocoPages(props: Args) {
  const segments = (await props.params).segments;
  const searchParams = await props.searchParams;

  return app.fetch(segments, searchParams);
}
