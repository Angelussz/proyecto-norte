import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";

const NAV = ["New In", "Shop", "Collections", "About", "Contact"];

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-16">
        <Link
          href="/"
          className="text-3xl tracking-wider text-foreground"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          NORTE
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item}
              href="#"
              className={`text-sm font-semibold uppercase tracking-widest transition-colors hover:text-primary ${
                item === "Shop"
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-foreground">
          <button aria-label="Search" className="transition-colors hover:text-primary">
            <Search className="size-6" />
          </button>
          <button aria-label="Profile" className="transition-colors hover:text-primary">
            <User className="size-6" />
          </button>
          <button aria-label="Cart" className="transition-colors hover:text-primary">
            <ShoppingBag className="size-6" />
          </button>
          <button aria-label="Menu" className="transition-colors hover:text-primary md:hidden">
            <Menu className="size-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
