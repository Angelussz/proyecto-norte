import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Shipping", state: "done" },
  { label: "Payment", state: "current" },
  { label: "Review", state: "upcoming" },
] as const;

export function CheckoutSteps() {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center" role="list">
        {STEPS.map((step, i) => {
          const last = i === STEPS.length - 1;
          return (
            <li
              key={step.label}
              className={cn("relative", !last && "pr-8 sm:pr-20")}
            >
              {!last && (
                <div aria-hidden className="absolute inset-0 flex items-center">
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      step.state === "done" ? "bg-foreground" : "bg-border"
                    )}
                  />
                </div>
              )}
              <Link
                href="#"
                aria-current={step.state === "current" ? "step" : undefined}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-none border-2 transition-colors",
                  step.state === "done" &&
                    "border-foreground bg-foreground text-background",
                  step.state === "current" &&
                    "border-foreground bg-background text-foreground",
                  step.state === "upcoming" &&
                    "border-border bg-background text-muted-foreground"
                )}
              >
                {step.state === "done" ? (
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                ) : (
                  <span className="text-sm font-semibold">{i + 1}</span>
                )}
              </Link>
              <span
                className={cn(
                  "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold uppercase tracking-widest",
                  step.state === "upcoming"
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
