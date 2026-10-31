import type {
  AdminOrderAddress,
  AdminOrderCustomer,
  AdminOrderFiscalVoucher,
  AdminOrderPayment,
} from "@/features/admin-orders/types/admin-order.interface";
import { formatPrice } from "@/lib/products";
import { User, Mail, Phone, MapPin, CreditCard, FileText, ExternalLink } from "lucide-react";

interface OrderCustomerCardProps {
  customer: AdminOrderCustomer;
  address: AdminOrderAddress;
  payment: AdminOrderPayment | null;
  fiscalReceipt: AdminOrderFiscalVoucher | null;
}

export function OrderCustomerCard({
  customer,
  address,
  payment,
  fiscalReceipt,
}: OrderCustomerCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* ─── Bloque 1: Cliente ─────────────────────────────────────────── */}
      <div className="border border-border bg-card p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <span>Datos del Cliente</span>
          </h3>
          <span className="text-[10px] uppercase font-mono text-muted-foreground">
            ID: {customer.id.slice(0, 8)}
          </span>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <p className="font-bold text-foreground text-sm uppercase">
            {customer.name} {customer.last_name}
          </p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            <a href={`mailto:${customer.email}`} className="hover:text-primary transition-colors">
              {customer.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            <a href={`tel:${customer.phone}`} className="hover:text-primary transition-colors">
              {customer.phone}
            </a>
          </div>
        </div>
      </div>

      {/* ─── Bloque 2: Envío y Entrega ──────────────────────────────────── */}
      <div className="border border-border bg-card p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span>Destino de Envío</span>
          </h3>
          <span className="text-[10px] uppercase font-semibold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5">
            {address.city}
          </span>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">
              Destinatario:
            </span>
            <span className="font-semibold text-foreground uppercase">{address.recipient}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">
              Dirección:
            </span>
            <span className="text-foreground">{address.address_line}</span>
          </div>
          {address.reference && (
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">
                Referencia:
              </span>
              <span className="italic text-foreground">{address.reference}</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <Phone className="size-3 text-muted-foreground" />
            <span>Teléfono de recepción: {address.contact_phone}</span>
          </div>
        </div>
      </div>

      {/* ─── Bloque 3: Pago y Facturación ──────────────────────────────── */}
      <div className="border border-border bg-card p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <span>Pago & Facturación</span>
          </h3>
          {payment && (
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                payment.status === "APPROVED"
                  ? "bg-secondary/15 text-secondary border-secondary/30"
                  : payment.status === "PENDING"
                    ? "bg-muted text-muted-foreground border-border"
                    : "bg-destructive/15 text-destructive border-destructive/30"
              }`}
            >
              {payment.status === "APPROVED" ? "COBRADO" : payment.status}
            </span>
          )}
        </div>

        {payment ? (
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase">Pasarela / Método:</span>
              <span className="font-semibold text-foreground uppercase">
                {payment.gateway} · {payment.payment_method}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase">Monto Cobrado:</span>
              <span className="font-bold text-foreground">{formatPrice(payment.amount)}</span>
            </div>
            {payment.gateway_transaction_id && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase">Transacción ID:</span>
                <span className="font-mono text-[10px] text-foreground">
                  {payment.gateway_transaction_id}
                </span>
              </div>
            )}
            {payment.paid_at && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase">Fecha de cobro:</span>
                <span className="text-foreground">
                  {new Date(payment.paid_at).toLocaleString("es-PE")}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Sin registro de pago asociado en pasarela.
          </p>
        )}

        {/* Comprobante Fiscal si existe */}
        {fiscalReceipt && (
          <div className="mt-2 border-t border-border/60 pt-3 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-foreground font-semibold uppercase text-[11px]">
              <FileText className="size-3.5 text-primary" />
              <span>
                Comprobante: {fiscalReceipt.voucher_type} #{fiscalReceipt.serial_number}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {fiscalReceipt.identity_document_type}: {fiscalReceipt.identity_document_number} ·{" "}
              {fiscalReceipt.business_name}
            </p>
            {fiscalReceipt.pdf_url && (
              <a
                href={fiscalReceipt.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider hover:underline mt-1"
              >
                <span>Descargar PDF Fiscal</span>
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
