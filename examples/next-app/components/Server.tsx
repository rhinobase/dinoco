import { action } from "@/utils";
import { Form } from "./Form";
import { Wrapper } from "./Wrapper";

export function ServerPage({ name }: { name?: string }) {
  return (
    <Wrapper>
      <h1 className="text-3xl font-semibold">Hello, {name ?? "Dinoco"}!</h1>
      <Form action={action} />
    </Wrapper>
  );
}
