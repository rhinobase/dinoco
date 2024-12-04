import NextjsForm from "next/form";

export type Form = {
  action: (data: FormData) => void;
};

export function Form({ action }: Form) {
  return (
    <NextjsForm action={action} className="w-[300px] flex items-center gap-2">
      <input
        name="name"
        // biome-ignore lint/a11y/noAutofocus: <explanation>
        autoFocus
        className="w-full border appearance-none outline-none dark:text-zinc-100 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 py-1.5 text-base hover:border-blue-500 dark:hover:border-blue-300 border-zinc-300 dark:border-zinc-700 focus-visible:ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 focus:border-blue-500 dark:focus:border-blue-300 ring-blue-300 dark:ring-blue-100 bg-transparent rounded-l-md rounded-r-md px-3"
      />
      <button
        type="submit"
        className="font-semibold transition-all border select-none outline-none px-3 py-2 text-sm rounded-md text-white dark:text-black focus-visible:ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 border-transparent bg-blue-500 hover:bg-blue-600 dark:bg-blue-300/90 dark:hover:bg-blue-400/80 ring-blue-300 dark:ring-blue-100"
      >
        Submit
      </button>
    </NextjsForm>
  );
}
