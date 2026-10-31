import Link from "next/link";

export function BackLink({ href = "/", label = "Home" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-back"]}
      className="group -ml-1 inline-flex min-h-7 items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span aria-hidden className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
      {label}
    </Link>
  );
}

/** Every page opens the same way: back link, title, one-line intro. The title rises in once; it never splits into letters. */
export function PageHeader({
  title, intro, back, children,
}: {
  title: string;
  intro: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="pt-16 sm:pt-20">
      <BackLink {...back} />
      <h1 className="page-rise mt-5 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">{title}</h1>
      <p className="page-rise mt-3 max-w-[34rem] text-[17px] leading-relaxed text-pretty text-muted-foreground [animation-delay:80ms]">{intro}</p>
      {children}
    </header>
  );
}
