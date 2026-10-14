import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Envío", state: "done" },
  { label: "Pago", state: "current" },
  { label: "Revisión", state: "upcoming" },
] as const;

export function CheckoutSteps() {
  return (
    <nav aria-label="Progreso del pedido">
      <ol className="flex items-start" role="list">
        {STEPS.map((step, i) => {
          const last = i === STEPS.length - 1;
          return (
            <li
              key={step.label}
              className={cn("flex items-start", !last && "flex-1")}
            >
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="#"
                  aria-current={step.state === "current" ? "step" : undefined}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-none border-2 transition-colors",
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
                    "whitespace-nowrap text-xs font-semibold uppercase tracking-widest",
                    step.state === "upcoming"
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!last && (
                <div
                  aria-hidden
                  className={cn(
                    "mx-2 mt-4 h-0.5 flex-1 sm:mx-4",
                    step.state === "done" ? "bg-foreground" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
