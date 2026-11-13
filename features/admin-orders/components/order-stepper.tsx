import type { OrderStatus } from "@/features/admin-orders/types/admin-order.interface";
import { Check, Truck, Package, CheckCircle2, AlertOctagon, Info } from "lucide-react";

interface OrderStepperProps {
  status: OrderStatus;
  cancelReason?: string | null;
  statusNotes?: string | null;
}

const STEPPER_STAGES: {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}[] = [
  { key: "PAID", label: "Pago Aprobado", sublabel: "Cobro verificado", icon: Check },
  { key: "PREPARING", label: "Preparación", sublabel: "Picking & Packing", icon: Package },
  { key: "SHIPPED", label: "En Camino", sublabel: "Despachado a courier", icon: Truck },
  { key: "DELIVERED", label: "Entregado", sublabel: "Recepción final", icon: CheckCircle2 },
];

function getStageIndex(status: OrderStatus): number {
  switch (status) {
    case "PENDING_PAYMENT":
      return 0; // Ni siquiera el pago está completo
    case "PAID":
      return 1;
    case "PREPARING":
      return 2;
    case "SHIPPED":
      return 3;
    case "DELIVERED":
      return 4;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}

export function OrderStepper({ status, cancelReason, statusNotes }: OrderStepperProps) {
  const isCancelled = status === "CANCELLED";
  const currentStageIndex = getStageIndex(status);

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Banner si la orden fue CANCELADA ───────────────────────────── */}
      {isCancelled && (
        <div className="flex items-start gap-3 border border-destructive/40 bg-destructive/10 p-4 shadow-xs">
          <AlertOctagon className="size-5 shrink-0 text-destructive mt-0.5" />
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
              Orden Cancelada
            </h4>
            <p className="text-xs text-foreground">
              {cancelReason ? (
                <>
                  <span className="font-semibold text-muted-foreground uppercase text-[11px]">
                    Motivo registrado:{" "}
                  </span>
                  {cancelReason}
                </>
              ) : (
                "Esta orden fue cancelada y el stock fue restituido según corresponda."
              )}
            </p>
          </div>
        </div>
      )}

      {/* ─── Banner si hay notas operativas o de retroceso ───────────────── */}
      {statusNotes && !isCancelled && (
        <div className="flex items-start gap-3 border border-primary/30 bg-primary/10 p-3.5 shadow-xs">
          <Info className="size-4 shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-bold uppercase tracking-wider text-primary text-[10px]">
              Nota Operativa / Auditoría
            </span>
            <p className="text-foreground">{statusNotes}</p>
          </div>
        </div>
      )}

      {/* ─── Stepper Visual ─────────────────────────────────────────────── */}
      {!isCancelled && (
        <div className="border border-border bg-card p-5 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pipeline de Distribución
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Fase {Math.max(1, currentStageIndex)} de 4
            </span>
          </div>

          <div className="relative flex items-center justify-between">
            {/* Línea conectora base */}
            <div className="absolute left-6 right-6 top-4 h-[2px] bg-border -z-0" />

            {/* Línea conectora de progreso activo */}
            <div
              className="absolute left-6 top-4 h-[2px] bg-primary -z-0 transition-all duration-300"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, ((currentStageIndex - 1) / (STEPPER_STAGES.length - 1)) * 100),
                )}%`,
              }}
            />

            {/* Pasos */}
            {STEPPER_STAGES.map((stage, idx) => {
              const stepNumber = idx + 1;
              const isPassed = stepNumber < currentStageIndex;
              const isCurrent = stepNumber === currentStageIndex;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`flex size-8 items-center justify-center border transition-all duration-200 ${
                      isPassed
                        ? "border-secondary bg-secondary text-secondary-foreground"
                        : isCurrent
                          ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-sm"
                          : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {isPassed ? (
                      <Check className="size-4" />
                    ) : isCurrent ? (
                      <Icon className="size-4 animate-pulse" />
                    ) : (
                      <span className="text-xs font-semibold">{stepNumber}</span>
                    )}
                  </div>

                  <span
                    className={`mt-2 text-[11px] font-bold uppercase tracking-wider text-center ${
                      isCurrent
                        ? "text-primary"
                        : isPassed
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="hidden sm:block text-[10px] text-muted-foreground text-center">
                    {stage.sublabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
