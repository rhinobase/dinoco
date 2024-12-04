import Link from "next/link";
import type { PropsWithChildren } from "react";

export function Wrapper({ children }: PropsWithChildren) {
  return (
    <div className="h-full w-full max-w-xl mx-auto flex flex-col items-center justify-center gap-4">
      <Link href="/">
        <div className="fixed top-2 left-2 rounded text-sm px-2.5 py-1.5 hover:bg-zinc-200/60 text-zinc-700 hover:text-black dark:hover:bg-zinc-800/60 dark:text-zinc-300 dark:hover:text-zinc-50 transition-all ease-in-out">
          Go back to Home Page
        </div>
      </Link>
      {children}
    </div>
  );
}
