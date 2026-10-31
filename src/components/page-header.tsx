import Link from "next/link";
import { SplittingText } from "@animate-ui/react/primitives/texts/splitting";

export function BackLink({ href = "/", label = "Home" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-back"]}
      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span aria-hidden className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
      {label}
    </Link>
  );
}

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
      <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
        <SplittingText text={title} type="chars" stagger={0.025} />
      </h1>
      <p className="mt-3 max-w-[34rem] text-[17px] leading-relaxed text-pretty text-muted-foreground">{intro}</p>
      {children}
    </header>
  );
}
