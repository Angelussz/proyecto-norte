import { SettingsForm } from "@/features/admin-settings/components/settings-form";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-6 md:px-8">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1
          className="text-3xl font-normal tracking-[0.22em] text-foreground uppercase"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          CONFIGURACIÓN
        </h1>

        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Administración de envíos e impuestos de la tienda
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
