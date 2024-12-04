"use server";
import { redirect } from "next/navigation";

export async function action(formData: FormData) {
  const name = formData.get("name");

  redirect(`/server?name=${name}`);
}
