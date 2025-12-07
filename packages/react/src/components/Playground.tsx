import type { PropsWithChildren } from "react";

export default function Playground({
  title,
  description,
  children,
}: PropsWithChildren<{
  title: string;
  description: string;
}>) {
  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-12 z-10 border-b border-separator backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs/6 uppercase tracking-[0.2em] text-muted-foreground">
              {description}
            </p>
            <h1 className="font-semibold leading-tight">{title}</h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
        {children}
      </main>
    </div>
  );
}
