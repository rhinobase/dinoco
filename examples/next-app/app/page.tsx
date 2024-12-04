import Link from "next/link";

const LINKS: {
  title: string;
  href: string;
}[] = [
  { title: "Server Page", href: "/server" },
  { title: "Client Page", href: "/client" },
  { title: "404 Page", href: "/thislinkdoesntexist" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center h-full w-full gap-4 justify-center">
      <h1 className="text-3xl font-bold">This is a Dinoco example</h1>
      <div className="w-[300px]">
        {LINKS.map((item, index) => (
          <Link key={`${index}-${item.title}`} href={item.href}>
            <div className="py-1 w-full border mb-1.5 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-center transition-all ease-in-out">
              {item.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
