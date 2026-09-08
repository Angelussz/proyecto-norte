import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COL_1 = ["Shipping", "Returns", "Size Guide"];
const COL_2 = ["Sustainability", "Privacy Policy", "Terms of Service"];

export function StoreFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-muted">
      <div className="mx-auto grid 7xl grid-cols-1 gap-6 px-5 py-16 md:grid-cols-4 md:px-16">
        <div className="flex flex-col gap-4">
          <span
            className="text-3xl tracking-wider text-foreground"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            NORTE
          </span>
          <p className="mt-auto text-xs text-muted-foreground">
            © 2024 NORTE. ALL RIGHTS RESERVED.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {COL_1.map((item) => (
            <Link
              key={item}
              href="#"
              className="text-sm font-semibold uppercase text-muted-foreground underline decoration-1 opacity-80 transition-opacity hover:text-primary hover:opacity-100"
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {COL_2.map((item) => (
            <Link
              key={item}
              href="#"
              className="text-sm font-semibold uppercase text-muted-foreground underline decoration-1 opacity-80 transition-opacity hover:text-primary hover:opacity-100"
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold uppercase text-foreground">
            Stay in the loop
          </span>
          <p className="text-base text-muted-foreground">
            Join our newsletter for early access to new collections.
          </p>
          <div className="mt-2 flex border-b border-border pb-2 transition-colors focus-within:border-foreground">
            <Input
              type="email"
              placeholder="Enter your email"
              className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
            <Button variant="ghost" size="icon" aria-label="Subscribe">
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
