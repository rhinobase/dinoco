import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-w-0 max-w-2xl flex-auto h-full px-4 py-16 lg:max-w-none lg:pl-8 lg:pr-0 xl:px-16">
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-slate-900 font-display font-semibold dark:text-white">
          404
        </p>
        <div className="space-y-2">
          <h1 className="text-blue-700 font-display dark:text-blue-300 text-[2rem] leading-[2.5rem] tracking-tight">
            Page not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[0.875rem] leading-[1.5rem]">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
        <Link
          href="/"
          className="rounded text-sm px-2.5 py-1.5 hover:bg-zinc-200/60 text-zinc-700 hover:text-black dark:hover:bg-zinc-800/60 dark:text-zinc-300 dark:hover:text-zinc-50 transition-all ease-in-out"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
