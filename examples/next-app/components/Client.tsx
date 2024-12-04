"use client";
import { useState } from "react";
import { Form } from "./Form";
import { Wrapper } from "./Wrapper";

export function ClientPage() {
  const [value, setValue] = useState<string | undefined>();

  return (
    <Wrapper>
      <h1 className="text-3xl font-semibold">Hello, {value ?? "Dinoco"}!</h1>
      <Form action={(data) => setValue(String(data.get("name")))} />
    </Wrapper>
  );
}
