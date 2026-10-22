"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Camera,
  CreditCard,
  Shield,
  Bell,
  UserX,
  BadgeCheck,
  Upload,
  PauseCircle,
  BellOff,
  HeartCrack,
  ArrowRight,
  Mail,
  Info,
  MailPlus,
  Phone,
  ShieldCheck,
  Circle,
  Laptop,
  HelpCircle,
} from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type Section =
  | "perfil"
  | "fotografia"
  | "seguridad"
  | "suscripciones"
  | "metodos-de-pago"
  | "privacidad"
  | "preferencias-de-notificaciones"
  | "cerrar-cuenta";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div
      className={[
        "fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 shadow-xl transition-all duration-300",
        "bg-inverse-surface text-inverse-on-surface",
        visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <CheckCircle2 className="size-5 shrink-0" />
      <span className="text-xs font-label uppercase tracking-widest">{msg}</span>
    </div>
  );
}

function FeedbackMsg({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <p
      className={`flex items-center gap-2 text-xs font-label uppercase tracking-wide ${
        type === "success" ? "text-secondary" : "text-error"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="size-4 shrink-0" />
      ) : (
        <AlertTriangle className="size-4 shrink-0" />
      )}
      {msg}
    </p>
  );
}

function SidebarItem({
  section,
  current,
  icon: Icon,
  label,
  onClick,
}: {
  section: Section;
  current: Section;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  const isActive = section === current;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex w-full items-center gap-3 px-3 py-3 text-sm transition-colors text-left rounded-none",
        isActive
          ? "bg-surface-container-high text-on-surface font-semibold"
          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
      ].join(" ")}
    >
      <Icon className="size-5 shrink-0" strokeWidth={1.8} />
      <span className="flex-1 text-sm">{label}</span>
    </button>
  );
}

function SectionPerfil({
  user,
}: {
  user: { name: string; email: string; picture?: string; phone?: string };
}) {
  const [firstName, setFirstName] = useState(user.name.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(user.name.split(" ").slice(1).join(" ") ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [isPending, startTransition] = useTransition();
  const [toastVisible, setToastVisible] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const initials = getInitials(user.name);
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) return;
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 700));
      setFeedback({ type: "success", msg: "Perfil actualizado correctamente." });
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        setFeedback(null);
      }, 3200);
    });
  }
  return (
    <>
      <Toast msg="Cambios de perfil guardados con éxito" visible={toastVisible} />
      <div className="flex flex-col w-full">
        <div className="relative w-full pb-8 mb-8 border-b border-[var(--color-outline-variant)]/30">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                <span className="text-[11px] font-label font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
                  Configuración de Cuenta
                </span>
              </div>
              <h2
                className="text-5xl md:text-6xl tracking-wide uppercase text-[var(--color-on-surface)] leading-none"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                PERFIL PÚBLICO
              </h2>
              <p className="mt-2 text-sm text-[var(--color-on-surface-variant)] max-w-xl">
                Añade y gestiona tu información personal en el ecosistema NORTE.
              </p>
            </div>
            <div className="flex items-center gap-4 p-3 bg-[var(--color-surface-container-low)] shadow-sm">
              <div
                className="relative w-14 h-14 rounded-full bg-[var(--color-secondary)] text-[var(--color-on-secondary)] flex items-center justify-center text-2xl shadow-inner ring-2 ring-[var(--color-primary)]/20"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                {initials}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--color-primary)] rounded-full ring-2 ring-[var(--color-surface)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-[var(--color-on-surface)]">
                  {user.name}
                </span>
                <span className="text-xs text-[var(--color-on-surface-variant)]">
                  Miembro NORTE · Activo
                </span>
                <span className="text-[10px] uppercase font-label tracking-wider text-[var(--color-primary)] mt-0.5">
                  Perfil activo
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 flex flex-col space-y-10">
            <section className="bg-[var(--color-surface-container-low)] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-6 border-b border-[var(--color-outline-variant)]/30">
                <BadgeCheck className="size-5 text-[var(--color-primary)]" strokeWidth={1.8} />
                <h3
                  className="text-2xl tracking-wider uppercase text-[var(--color-on-surface)]"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  Información Básica
                </h3>
              </div>
              <form onSubmit={handleSave}>
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="first-name"
                      className="text-xs font-label font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]"
                    >
                      Nombre
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isPending}
                      className="w-full bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm text-[var(--color-on-surface)] border-b-2 border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="last-name"
                      className="text-xs font-label font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]"
                    >
                      Apellidos
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isPending}
                      className="w-full bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm text-[var(--color-on-surface)] border-b-2 border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-xs font-label font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]"
                    >
                      Teléfono
                    </label>
                    <div className="relative flex items-center">
                      <Phone
                        className="absolute left-3 size-4 text-[var(--color-on-surface-variant)] pointer-events-none"
                        strokeWidth={1.8}
                      />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isPending}
                        placeholder="+54 11 1234-5678"
                        className="w-full bg-[var(--color-surface-container-lowest)] pl-9 pr-4 py-3 text-sm text-[var(--color-on-surface)] border-b-2 border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {feedback && (
                  <div className="mt-4">
                    <FeedbackMsg type={feedback.type} msg={feedback.msg} />
                  </div>
                )}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-[var(--color-outline-variant)]/30 mt-8">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-label font-semibold uppercase tracking-[0.15em] text-xs transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button
                    id="btn-save-profile"
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto px-10 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] font-label font-semibold uppercase tracking-[0.18em] text-xs shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4 group-hover:rotate-12 transition-transform" />
                    )}
                    <span>GUARDAR CAMBIOS</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="bg-[var(--color-surface-container-low)] p-5 shadow-sm space-y-3">
              <span className="text-[11px] font-label font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] block">
                Nota editorial
              </span>
              <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                Tu nombre y título son visibles en publicaciones, créditos y correspondencia con la
                firma NORTE.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
                <span className="text-[11px] font-label uppercase tracking-widest text-[var(--color-secondary)]">
                  Visible en tu perfil público
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionFotografia({ user }: { user: { name: string; picture?: string } }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.picture ?? null);
  const [fileName, setFileName] = useState("Examinar en tu equipo");
  const [fileStatus, setFileStatus] = useState("Ningún archivo seleccionado");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo supera el límite de 5 MB.");
      e.target.value = "";
      return;
    }
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileName(file.name);
    setFileStatus(`${sizeMB} MB • Listo para guardar`);
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) setPreviewUrl(evt.target.result as string);
    };
    reader.readAsDataURL(file);
  }
  function handleSave() {
    showToast("Fotografía guardada con éxito en tu ficha editorial.");
  }
  function handleDelete() {
    if (!confirm("¿Deseas retirar tu fotografía de perfil actual?")) return;
    setPreviewUrl(null);
    setFileName("Examinar en tu equipo");
    setFileStatus("Ningún archivo seleccionado");
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Fotografía retirada. Se restauró la imagen de archivo.");
  }
  const initials = getInitials(user.name);
  return (
    <>
      <Toast msg={toastMsg} visible={toastVisible} />
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between pb-6 mb-4">
          <div className="flex items-center gap-3 text-xs font-label uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
            <span>Cuenta</span>
            <span className="text-[var(--color-primary)] font-bold">/</span>
            <span className="text-[var(--color-on-surface)]">Fotografía de Perfil</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[var(--color-surface-container-high)] text-[11px] font-label tracking-widest uppercase text-[var(--color-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
            <span>Perfil Público Verificado</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10">
          <div>
            <span className="text-xs font-label uppercase tracking-[0.25em] text-[var(--color-primary)] font-semibold mb-2 block">
              Identidad Visual
            </span>
            <h2
              className="text-6xl md:text-8xl tracking-tight text-[var(--color-on-surface)] leading-none uppercase m-0"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              FOTOGRAFÍA
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-3 max-w-xl">
              Añade o actualiza la fotografía de tu perfil personal. Tu retrato será visible en
              publicaciones y créditos editoriales de la firma.
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <span className="text-[11px] font-label tracking-[0.2em] uppercase text-[var(--color-outline)] block">
              Referencia de Archivo
            </span>
            <span
              className="text-2xl tracking-wider text-[var(--color-on-surface)]"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              NRT-PORTRAIT-2025
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[var(--color-surface-container-low)] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 pb-6">
                <span className="text-xs font-label uppercase tracking-[0.2em] font-semibold text-[var(--color-on-surface)]">
                  VISTA PREVIA DE IMAGEN
                </span>
              </div>
              <div className="relative bg-[var(--color-surface-container-highest)] p-4 md:p-8 flex items-center justify-center min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-surface-container-high)]/40 via-transparent to-transparent pointer-events-none" />
                <div className="relative group z-10 flex flex-col items-center py-8">
                  <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden shadow-xl ring-4 ring-[var(--color-surface)] bg-[var(--color-surface-container)] relative flex items-center justify-center">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={user.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-surface-container-high)] flex flex-col items-center justify-center">
                        <span
                          className="text-7xl text-[var(--color-primary)]/70"
                          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                        >
                          {initials}
                        </span>
                        <span className="text-[11px] font-label uppercase tracking-widest text-[var(--color-on-surface-variant)] mt-2">
                          Retrato Actual
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <Camera className="size-10 text-white" strokeWidth={1.4} />
                    </div>
                  </div>
                  <div className="absolute bottom-8 right-1/2 translate-x-24 md:translate-x-28 w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] shadow-md ring-2 ring-[var(--color-surface)]">
                    <BadgeCheck className="size-5" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[var(--color-surface-container-low)] p-6 md:p-8 shadow-sm">
              <div className="pb-6">
                <span className="text-xs font-label uppercase tracking-[0.2em] font-semibold text-[var(--color-primary)] block mb-1">
                  GESTIÓN DE ARCHIVO
                </span>
                <h3
                  className="text-3xl md:text-4xl tracking-wide uppercase text-[var(--color-on-surface)]"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  AÑADIR O CAMBIAR IMAGEN
                </h3>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2 leading-relaxed">
                  Selecciona un archivo fotográfico reciente desde tu estación de trabajo o
                  dispositivo móvil.
                </p>
              </div>
              <div
                className="bg-[var(--color-surface-container)] p-6 text-center cursor-pointer hover:bg-[var(--color-surface-container-high)] transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-12 h-12 bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] flex items-center justify-center rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="size-6" strokeWidth={1.8} />
                  </div>
                  <p
                    className="text-xl uppercase tracking-wider text-[var(--color-on-surface)]"
                    style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                  >
                    {fileName}
                  </p>
                  <p className="text-xs text-[var(--color-outline)] mt-1">{fileStatus}</p>
                </div>
                <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] text-[var(--color-on-surface)] text-xs font-label uppercase tracking-widest font-semibold group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)] transition-colors">
                  <Upload className="size-4" strokeWidth={1.8} />
                  <span>Subir imagen</span>
                </div>
              </div>
              <div className="mt-6 pt-4 space-y-3">
                {[
                  {
                    icon: Shield,
                    label: "Formatos:",
                    desc: "JPG, PNG o WebP de alta fidelidad tonal.",
                  },
                  { icon: BadgeCheck, label: "Tamaño máximo:", desc: "5 MB por archivo." },
                  {
                    icon: Camera,
                    label: "Recorte:",
                    desc: "Se guarda un respaldo sin comprimir para publicaciones físicas.",
                  },
                ].map(({ icon: Ic, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Ic
                      className="size-4 text-[var(--color-secondary)] mt-0.5 shrink-0"
                      strokeWidth={1.8}
                    />
                    <div className="text-xs text-[var(--color-on-surface-variant)]">
                      <strong className="font-label text-[var(--color-on-surface)] uppercase tracking-wide">
                        {label}{" "}
                      </strong>
                      {desc}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full py-4 px-6 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[var(--color-primary-container)] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="size-4" strokeWidth={2} />
                  <span>GUARDAR FOTOGRAFÍA</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full py-3 px-6 text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-container)]/40 text-xs font-label uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="size-4" strokeWidth={1.8} />
                  <span>ELIMINAR FOTO ACTUAL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EmailChangeModal({
  currentEmail,
  onClose,
}: {
  currentEmail: string;
  onClose: () => void;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === currentEmail) return;
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 800));
      setFeedback({
        type: "success",
        msg: "Se envió un código de verificación a la nueva dirección.",
      });
    });
  }

  return (
    <div
      id="email-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-on-surface/40 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-surface w-full max-w-lg shadow-2xl relative p-8 md:p-10 transition-transform transform scale-100">
        {/* Close Button */}
        <button
          type="button"
          aria-label="Cerrar modal"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <X className="size-6" strokeWidth={1.8} />
        </button>

        {/* Modal Tag / Category */}
        <span className="text-[10px] font-label font-bold uppercase tracking-[0.3em] text-primary block mb-3">
          PROCEDIMIENTO SEGURO
        </span>

        {/* Modal Title */}
        <h3
          id="modal-title"
          className="text-3xl md:text-4xl font-headline tracking-wide uppercase text-on-surface mb-3 leading-none"
        >
          CAMBIA TU CORREO ELECTRÓNICO
        </h3>

        {/* Modal Body */}
        <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-6">
          Introduce la nueva dirección de correo electrónico que quieres usar. Te enviaremos un
          código de confirmación.
        </p>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Correo actual */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-label uppercase tracking-[0.15em] font-semibold text-on-surface-variant">
              Correo actual
            </label>
            <div className="relative flex items-center bg-surface-container-low px-4 py-3 text-sm font-mono text-on-surface border border-outline-variant/30">
              <Mail className="size-4 text-on-surface-variant mr-3 shrink-0" strokeWidth={1.8} />
              <span className="truncate">{currentEmail}</span>
            </div>
          </div>

          {/* Nuevo correo electrónico */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="new-email-input"
              className="text-xs font-label uppercase tracking-[0.15em] font-semibold text-on-surface"
            >
              Nuevo correo electrónico
            </label>
            <div className="relative flex items-center bg-white border border-outline-variant/60 focus-within:border-primary transition-colors">
              <MailPlus
                className="size-5 text-on-surface-variant ml-3.5 mr-2 shrink-0"
                strokeWidth={1.8}
              />
              <input
                id="new-email-input"
                ref={inputRef}
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isPending || feedback?.type === "success"}
                required
                placeholder="nombre@ejemplo.com"
                className="w-full bg-transparent pr-4 py-3.5 text-sm font-body text-on-surface placeholder:text-outline/70 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Warning Note */}
          <div className="bg-surface-container-high p-4 flex items-start gap-3">
            <Info className="size-5 text-primary shrink-0 mt-0.5" strokeWidth={1.8} />
            <p className="text-xs font-body text-on-surface-variant leading-normal">
              Por seguridad, al cambiar tu correo electrónico se solicitará verificar tu identidad
              en ambos buzones de correo.
            </p>
          </div>

          {feedback && <FeedbackMsg type={feedback.type} msg={feedback.msg} />}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending || !newEmail.trim() || feedback?.type === "success"}
              className="w-full py-4 px-6 bg-primary text-on-primary hover:bg-primary-container transition-colors text-xs font-label uppercase tracking-[0.2em] font-bold text-center cursor-pointer shadow-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              <span>VERIFICAR NUEVO CORREO</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-4 px-6 bg-transparent text-on-surface hover:bg-surface-container transition-colors text-xs font-label uppercase tracking-[0.15em] font-semibold text-center cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionSeguridad({ user }: { user: { email: string } }) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }
  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setFeedback({ type: "error", msg: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", msg: "Las contraseñas no coinciden." });
      return;
    }
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 800));
      setFeedback({ type: "success", msg: "Contraseña actualizada correctamente." });
      setNewPassword("");
      setConfirmPassword("");
      showToast("Tu contraseña ha sido actualizada con éxito.");
      setTimeout(() => setFeedback(null), 3500);
    });
  }
  return (
    <>
      {showEmailModal && (
        <EmailChangeModal currentEmail={user.email} onClose={() => setShowEmailModal(false)} />
      )}
      <Toast msg={toastMsg} visible={toastVisible} />
      <div className="flex flex-col w-full max-w-[1080px]">
        {/* Top Editorial Header & Status Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-outline-variant/40">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-[10px] font-label font-semibold tracking-[0.2em] uppercase bg-secondary-container text-on-secondary-container">
                ÁREA DE CUENTA
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-headline tracking-wider text-on-surface uppercase m-0 leading-tight pt-1">
              Seguridad de la Cuenta
            </h1>
            <p className="text-sm font-body text-on-surface-variant max-w-xl">
              Edita la configuración de autenticación, credenciales de acceso y protocolos de
              protección de tu perfil NORTE.
            </p>
          </div>
        </div>

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10">
          {/* Primary Column (Credentials & Authentication) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Section 1: Email Address */}
            <section className="bg-surface-container-low p-6 sm:p-8 border border-outline-variant/40 space-y-5 shadow-sm">
              <div className="flex items-baseline justify-between pb-3 border-b border-outline-variant/30">
                <div className="space-y-1">
                  <h2 className="text-xl font-headline tracking-wide uppercase text-on-surface m-0">
                    Correo Electrónico
                  </h2>
                  <p className="text-xs font-body text-on-surface-variant">
                    Identificador principal para notificaciones y códigos de seguridad.
                  </p>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>Principal
                </span>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-lowest p-3 border border-outline-variant/60 focus-within:border-primary transition-colors">
                <div className="pl-2 pr-1 text-on-surface-variant flex items-center">
                  <Mail className="size-5" />
                </div>
                <div className="flex-1 py-1">
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                    Dirección asociada
                  </p>
                  <p
                    className="text-sm font-body text-on-surface font-semibold tracking-wide"
                    id="displayEmail"
                  >
                    {user.email}
                  </p>
                </div>
                <button
                  id="editEmailBtn"
                  title="Modificar dirección de correo"
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-label uppercase tracking-[0.1em] font-medium transition-all"
                >
                  <Pencil className="size-4" />
                  <span className="hidden sm:inline">Cambiar</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant/80 italic">
                Este correo es tu identificador principal para recibir recibos, reportes y códigos
                de doble factor.
              </p>
            </section>

            {/* Section 2: Password Update */}
            <section className="bg-surface-container-low p-6 sm:p-8 border border-outline-variant/40 space-y-6 shadow-sm">
              <div className="pb-3 border-b border-outline-variant/30">
                <h2 className="text-xl font-headline tracking-wide uppercase text-on-surface mb-1">
                  Cambiar Contraseña
                </h2>
                <p className="text-xs font-body text-on-surface-variant">
                  Se recomienda utilizar una clave única de al menos 8 caracteres con combinación de
                  números y signos.
                </p>
              </div>
              <form id="passwordForm" onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-label uppercase tracking-[0.15em] font-medium text-on-surface"
                    htmlFor="newPassword"
                  >
                    Nueva Contraseña
                  </label>
                  <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant/60 focus-within:border-primary transition-colors">
                    <input
                      className="w-full bg-transparent px-4 py-3 text-sm font-body text-on-surface placeholder:text-outline-variant focus:outline-none"
                      id="newPassword"
                      name="newPassword"
                      placeholder="Introducir nueva contraseña"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isPending}
                      required
                    />
                    <button
                      aria-label="Mostrar u ocultar contraseña"
                      className="px-3 text-on-surface-variant hover:text-on-surface transition-colors"
                      onClick={() => setShowNew((v) => !v)}
                      type="button"
                    >
                      {showNew ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-label uppercase tracking-[0.15em] font-medium text-on-surface"
                    htmlFor="confirmPassword"
                  >
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant/60 focus-within:border-primary transition-colors">
                    <input
                      className="w-full bg-transparent px-4 py-3 text-sm font-body text-on-surface placeholder:text-outline-variant focus:outline-none"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Introducir nueva contraseña de nuevo"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isPending}
                      required
                    />
                    <button
                      aria-label="Mostrar u ocultar confirmación de contraseña"
                      className="px-3 text-on-surface-variant hover:text-on-surface transition-colors"
                      onClick={() => setShowConfirm((v) => !v)}
                      type="button"
                    >
                      {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3 px-4 bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant font-mono">
                  <div className="flex items-center gap-2">
                    {newPassword.length >= 8 ? (
                      <CheckCircle2 className="size-4 text-secondary shrink-0" />
                    ) : (
                      <Circle className="size-4 text-outline shrink-0" />
                    )}
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[A-Z]/.test(newPassword) ? (
                      <CheckCircle2 className="size-4 text-secondary shrink-0" />
                    ) : (
                      <Circle className="size-4 text-outline shrink-0" />
                    )}
                    <span>Al menos una letra mayúscula</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[0-9]/.test(newPassword) ? (
                      <CheckCircle2 className="size-4 text-secondary shrink-0" />
                    ) : (
                      <Circle className="size-4 text-outline shrink-0" />
                    )}
                    <span>Al menos un número decimal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[^A-Za-z0-9]/.test(newPassword) ? (
                      <CheckCircle2 className="size-4 text-secondary shrink-0" />
                    ) : (
                      <Circle className="size-4 text-outline shrink-0" />
                    )}
                    <span>Un símbolo o signo especial (@, #, $)</span>
                  </div>
                </div>
                {feedback && <FeedbackMsg type={feedback.type} msg={feedback.msg} />}
                <div className="pt-2">
                  <button
                    className="px-8 py-3.5 bg-primary hover:bg-primary-container text-on-primary font-headline tracking-[0.12em] text-lg uppercase transition-all shadow-sm active:translate-y-px disabled:opacity-50 flex items-center gap-2"
                    type="submit"
                    disabled={isPending || !newPassword || !confirmPassword}
                  >
                    {isPending && <Loader2 className="size-5 animate-spin" />}
                    Cambiar la Contraseña
                  </button>
                </div>
              </form>
            </section>

            {/* Section 3: Multifactor Authentication (2FA) */}
            <section className="bg-surface-container-low p-6 sm:p-8 border border-outline-variant/40 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
                    <ShieldCheck className="size-5 text-primary shrink-0" />
                    <h3 className="text-xl font-headline tracking-wide uppercase text-on-surface m-0 leading-none">
                      Autenticación Multifactor (2FA)
                    </h3>
                  </div>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                    Para aumentar la seguridad de la cuenta, puedes solicitar que te enviemos un
                    código por correo electrónico que deberás introducir cuando inicies sesión. Para
                    obtener más información sobre el funcionamiento de la autenticación multifactor,
                    consulta nuestro{" "}
                    <a
                      className="underline underline-offset-4 text-primary font-semibold hover:text-on-surface transition-colors"
                      href="#"
                    >
                      centro de asistencia
                    </a>
                    .
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-outline uppercase tracking-wider pt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${mfaEnabled ? "bg-secondary" : "bg-outline-variant"}`}
                    ></span>
                    Estado actual: {mfaEnabled ? "Activo" : "Inactivo (Recomendado activar)"}
                  </div>
                </div>
                <div className="shrink-0 self-start md:self-center">
                  <button
                    className={`px-7 py-3 font-headline tracking-[0.15em] text-base uppercase transition-all shadow-sm ${
                      mfaEnabled
                        ? "bg-error-container text-on-error-container hover:bg-error/20"
                        : "bg-inverse-surface hover:bg-on-surface text-inverse-on-surface"
                    }`}
                    id="mfaBtn"
                    onClick={() => {
                      setMfaEnabled((v) => !v);
                      showToast(
                        mfaEnabled
                          ? "Autenticación multifactor desactivada."
                          : "Autenticación multifactor activada para tu cuenta.",
                      );
                    }}
                    type="button"
                  >
                    {mfaEnabled ? "Deshabilitar" : "Habilitar"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Secondary Column / Editorial Security Context & Sessions */}
          <div className="lg:col-span-4 space-y-8">
            {/* Active Sessions Panel */}
            <div className="bg-surface-container p-6 border border-outline-variant/40 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                <span className="text-xs font-label uppercase tracking-widest font-semibold text-on-surface">
                  Sesiones Activas
                </span>
                <Laptop className="size-4.5 text-on-surface-variant" />
              </div>
              {/* Session 1: Current */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface font-body">
                    MacBook Pro · Chrome
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-secondary/15 text-secondary px-2 py-0.5 font-bold">
                    Esta sesión
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-mono">
                  Santiago, CL · IP: 186.105.***.***
                </p>
                <p className="text-[10px] text-outline font-mono">Activo ahora mismo</p>
              </div>
              {/* Session 2 */}
              <div className="pt-3 border-t border-outline-variant/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-on-surface font-body">
                    iPhone 14 · Safari Mobile
                  </span>
                  <button
                    type="button"
                    className="text-[11px] text-error hover:underline uppercase tracking-wide font-mono font-medium"
                  >
                    Cerrar
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant font-mono">
                  Valparaíso, CL · Hace 2 días
                </p>
              </div>
              <button
                type="button"
                className="w-full text-center py-2.5 text-xs font-label uppercase tracking-[0.15em] text-on-surface hover:bg-surface-container-high transition-colors font-medium border border-outline-variant/40"
              >
                Cerrar Todas las Demás Sesiones
              </button>
            </div>

            {/* Security Activity Log Micro-card */}
            <div className="bg-surface-container-low p-6 border border-outline-variant/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-label uppercase tracking-widest font-semibold text-on-surface">
                  Registro de Actividad
                </span>
                <span className="text-[10px] font-mono text-outline">HISTÓRICO</span>
              </div>
              <div className="space-y-3 text-xs font-body">
                <div className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0"></span>
                  <div>
                    <p className="text-on-surface font-medium">Inicio de sesión exitoso</p>
                    <p className="text-[11px] font-mono text-on-surface-variant">
                      Hoy, 10:42 AM · Chrome / macOS
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full bg-outline-variant mt-1 shrink-0"></span>
                  <div>
                    <p className="text-on-surface font-medium">Contraseña modificada</p>
                    <p className="text-[11px] font-mono text-on-surface-variant">
                      14 Enero 2025 · Portal Web
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full bg-outline-variant mt-1 shrink-0"></span>
                  <div>
                    <p className="text-on-surface font-medium">Nueva vinculación de correo</p>
                    <p className="text-[11px] font-mono text-on-surface-variant">
                      02 Noviembre 2024 · Verificado
                    </p>
                  </div>
                </div>
              </div>
              <a
                className="block text-right text-[11px] font-label uppercase tracking-wider text-primary hover:underline font-semibold"
                href="#"
              >
                Descargar informe de auditoría →
              </a>
            </div>

            {/* Support Advisory Notice */}
            <div className="p-5 bg-secondary-container/40 border border-secondary/20">
              <div className="flex items-start gap-3">
                <HelpCircle className="size-5 text-secondary shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-on-secondary-fixed font-body">
                    ¿Detectas actividad no autorizada?
                  </p>
                  <p className="text-[11px] text-on-secondary-fixed-variant leading-relaxed">
                    Contacta de inmediato a nuestro equipo de seguridad editorial en{" "}
                    <a className="underline font-semibold" href="mailto:seguridad@norte-studio.cl">
                      seguridad@norte-studio.cl
                    </a>{" "}
                    o bloquea temporalmente tus accesos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionCerrarCuenta({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const [reason, setReason] = useState("not_using");
  const [extraFeedback, setExtraFeedback] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setPwdError(true);
      setTimeout(() => setPwdError(false), 1200);
      return;
    }
    if (!consentChecked) {
      setConsentError(true);
      setTimeout(() => setConsentError(false), 1200);
      return;
    }
    setShowModal(true);
  }

  function handleFinalDelete() {
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 1400));
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/");
    });
  }

  return (
    <>
      {/* Modal / Dialogue Backdrop for Destructive Confirmation (Simulated Editorial Dialog) */}
      {showModal && (
        <div
          id="confirmation-dialog"
          className="fixed inset-0 z-50 bg-on-background/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-surface p-8 shadow-2xl relative">
            <div className="w-12 h-12 bg-error-container text-error flex items-center justify-center mb-6">
              <HeartCrack className="size-8" strokeWidth={1.8} />
            </div>
            <h3 className="text-3xl font-display uppercase tracking-wider text-on-surface mb-2">
              ÚLTIMA CONFIRMACIÓN
            </h3>
            <p className="text-xs font-body text-on-surface-variant leading-relaxed mb-6">
              Estás a punto de borrar definitivamente tu identidad en NORTE. No habrá vuelta atrás
              ni posibilidad de restaurar tus colecciones guardadas. ¿Deseas proceder?
            </p>
            <div className="flex flex-col gap-3">
              <button
                id="final-delete-btn"
                type="button"
                onClick={handleFinalDelete}
                disabled={isPending}
                className="w-full py-3.5 bg-error hover:bg-[#8f1212] text-on-error font-label uppercase text-xs tracking-widest font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                <span>
                  {isPending ? "PROCESANDO SOLICITUD..." : "SÍ, ELIMINAR MI CUENTA AHORA"}
                </span>
              </button>
              <button
                id="cancel-dialog-btn"
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="w-full py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-label uppercase text-xs tracking-widest font-semibold transition-colors cursor-pointer"
              >
                CANCELAR Y REGRESAR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full">
        {/* Top Editorial Sub-bar & Progress Marker */}
        <div className="pb-8 mb-10 border-b-0">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-label font-semibold tracking-[0.25em] uppercase text-primary">
                NORTE ARCHIVO · GESTIÓN CRÍTICA
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-display uppercase tracking-tight text-on-surface leading-none m-0">
              CERRAR CUENTA
            </h1>
            <p className="text-base text-on-surface-variant font-body leading-relaxed max-w-xl pt-1">
              Gestiona la desactivación o eliminación definitiva de tu cuenta en NORTE. Por favor,
              lee con detenimiento el alcance irreversible de este procedimiento.
            </p>
          </div>
        </div>

        {/* Main Editorial Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Confirmation Steps (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Critical Warning Card */}
            <div className="relative overflow-hidden bg-error-container/35 p-7 md:p-9 shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-none bg-error/15 text-error flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="size-6 text-error fill-error/20" strokeWidth={2} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-label uppercase tracking-[0.2em] font-semibold text-error">
                      IRREVERSIBLE
                    </span>
                    <span className="text-on-error-container/40">•</span>
                    <span className="text-xs font-label tracking-widest text-on-error-container/80 uppercase">
                      Atención requerida
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-headline tracking-wide uppercase text-on-error-container leading-tight">
                    ADVERTENCIA: ESTA ACCIÓN ES PERMANENTE
                  </h2>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                    Si cierras tu cuenta, perderás acceso permanente a tu historial de pedidos,
                    piezas reservadas, direcciones guardadas y promociones exclusivas del archivo de
                    NORTE.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-y-2 gap-x-4 text-xs font-label text-on-error-container">
                    <span className="inline-flex items-center gap-1.5">
                      <X className="size-4 text-error" strokeWidth={2.5} /> Pérdida de estatus
                      curatorial
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <X className="size-4 text-error" strokeWidth={2.5} /> Cancelación de listas de
                      espera
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <X className="size-4 text-error" strokeWidth={2.5} /> Anonimización de datos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Impact Data Summary Strip */}
            <div className="bg-surface-container p-6 md:p-7 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <span className="text-xs font-label uppercase tracking-[0.18em] text-on-surface-variant font-medium">
                  Patrimonio en riesgo en esta cuenta
                </span>
                <span className="text-[11px] font-mono text-tertiary">ID: #NRT-89240</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                <div className="bg-surface-container-low p-4">
                  <div className="text-2xl md:text-3xl font-headline text-on-surface tracking-wider">
                    04
                  </div>
                  <div className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant mt-1">
                    Pedidos Históricos
                  </div>
                </div>
                <div className="bg-surface-container-low p-4">
                  <div className="text-2xl md:text-3xl font-headline text-primary tracking-wider">
                    02
                  </div>
                  <div className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant mt-1">
                    Piezas Reservadas
                  </div>
                </div>
                <div className="bg-surface-container-low p-4">
                  <div className="text-2xl md:text-3xl font-headline text-on-surface tracking-wider">
                    850
                  </div>
                  <div className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant mt-1">
                    Puntos de Archivo
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form Container */}
            <form
              id="closure-form"
              onSubmit={handleSubmit}
              className="space-y-8 bg-surface-container-low p-7 md:p-9 shadow-sm"
            >
              {/* Step 1: Reason Selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-label uppercase tracking-[0.18em] text-on-surface font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-none bg-surface-container-highest text-on-surface flex items-center justify-center text-[11px] font-mono">
                      1
                    </span>
                    ¿Por qué deseas cerrar tu cuenta?
                  </label>
                  <span className="text-[11px] font-label text-tertiary uppercase tracking-wider">
                    Requerido
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 pt-1" id="reasons-group">
                  <label className="group relative flex items-start gap-4 p-4 bg-surface cursor-pointer hover:bg-surface-container transition-all">
                    <input
                      type="radio"
                      name="closure_reason"
                      value="not_using"
                      checked={reason === "not_using"}
                      onChange={() => setReason("not_using")}
                      className="mt-1 w-4 h-4 text-primary accent-primary bg-surface"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-body font-medium text-on-surface group-hover:text-primary transition-colors">
                        Ya no utilizo esta cuenta
                      </span>
                      <span className="block text-xs font-body text-on-surface-variant mt-0.5">
                        Mis hábitos o preferencias de compra han cambiado en los últimos meses.
                      </span>
                    </div>
                  </label>

                  <label className="group relative flex items-start gap-4 p-4 bg-surface cursor-pointer hover:bg-surface-container transition-all">
                    <input
                      type="radio"
                      name="closure_reason"
                      value="privacy"
                      checked={reason === "privacy"}
                      onChange={() => setReason("privacy")}
                      className="mt-1 w-4 h-4 text-primary accent-primary bg-surface"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-body font-medium text-on-surface group-hover:text-primary transition-colors">
                        Problemas de privacidad o protección de datos
                      </span>
                      <span className="block text-xs font-body text-on-surface-variant mt-0.5">
                        Deseo purgar cualquier registro o traza personal según el marco RGPD.
                      </span>
                    </div>
                  </label>

                  <label className="group relative flex items-start gap-4 p-4 bg-surface cursor-pointer hover:bg-surface-container transition-all">
                    <input
                      type="radio"
                      name="closure_reason"
                      value="duplicate"
                      checked={reason === "duplicate"}
                      onChange={() => setReason("duplicate")}
                      className="mt-1 w-4 h-4 text-primary accent-primary bg-surface"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-body font-medium text-on-surface group-hover:text-primary transition-colors">
                        Tengo otra cuenta activa en NORTE
                      </span>
                      <span className="block text-xs font-body text-on-surface-variant mt-0.5">
                        Consolidación de cuenta principal bajo otra dirección de correo electrónico.
                      </span>
                    </div>
                  </label>

                  <label className="group relative flex items-start gap-4 p-4 bg-surface cursor-pointer hover:bg-surface-container transition-all">
                    <input
                      type="radio"
                      name="closure_reason"
                      value="other"
                      checked={reason === "other"}
                      onChange={() => setReason("other")}
                      className="mt-1 w-4 h-4 text-primary accent-primary bg-surface"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-body font-medium text-on-surface group-hover:text-primary transition-colors">
                        Otro motivo
                      </span>
                      <span className="block text-xs font-body text-on-surface-variant mt-0.5">
                        Prefiero no especificar o se trata de una circunstancia excepcional.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Dynamic feedback textarea for 'Other' or extra remarks */}
                <div className="pt-2">
                  <label
                    htmlFor="optional-feedback"
                    className="block text-[11px] font-label uppercase tracking-widest text-on-surface-variant mb-2"
                  >
                    Comentarios adicionales para el equipo curatorial (opcional)
                  </label>
                  <textarea
                    id="optional-feedback"
                    rows={2}
                    value={extraFeedback}
                    onChange={(e) => setExtraFeedback(e.target.value)}
                    placeholder="Escribe aquí cualquier observación sobre el servicio..."
                    className="w-full bg-surface text-on-surface text-sm p-3 placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Step 2: Password Confirmation Input */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="current-password"
                    className="text-xs font-label uppercase tracking-[0.18em] text-on-surface font-semibold flex items-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-none bg-surface-container-highest text-on-surface flex items-center justify-center text-[11px] font-mono">
                      2
                    </span>
                    Verificación de identidad
                  </label>
                  <span className="text-[11px] font-label text-error uppercase tracking-wider font-medium">
                    Obligatorio
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-body text-on-surface-variant block">
                    Para confirmar la orden de borrado, introduce tu contraseña actual.
                  </span>
                  <div className="relative">
                    <input
                      id="current-password"
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Introduce tu contraseña"
                      className={`w-full bg-surface text-on-surface px-4 py-3.5 pr-11 text-sm font-body tracking-wider focus:outline-none focus:bg-surface-container-lowest transition-all ${
                        pwdError ? "bg-error-container/30 ring-1 ring-error" : ""
                      }`}
                    />
                    <button
                      id="toggle-pwd-btn"
                      type="button"
                      aria-label="Mostrar contraseña"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-on-surface transition-colors p-1"
                    >
                      {showPwd ? (
                        <EyeOff className="size-5" id="pwd-icon" strokeWidth={1.8} />
                      ) : (
                        <Eye className="size-5" id="pwd-icon" strokeWidth={1.8} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Explicit Final Checkbox */}
              <div className="pt-2">
                <label
                  className={`flex items-start gap-3 select-none cursor-pointer p-3 bg-surface hover:bg-surface-container transition-colors ${
                    consentError ? "bg-error-container/20 ring-1 ring-error" : ""
                  }`}
                >
                  <input
                    id="consent-check"
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-error text-error"
                  />
                  <span className="text-xs font-body text-on-surface-variant leading-relaxed">
                    Comprendo que esta acción cancela inmediatamente mis suscripciones activas al
                    boletín editorial de NORTE y renuncio al reclamo sobre piezas de tirada limitada
                    no despachadas.
                  </span>
                </label>
              </div>

              {/* Step 4: Action Buttons Area */}
              <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  id="delete-account-btn"
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-4 px-6 bg-error hover:bg-[#8f1212] text-on-error font-label uppercase text-xs tracking-[0.2em] font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="size-[18px]" strokeWidth={2} />
                  <span>CERRAR CUENTA DEFINITIVAMENTE</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("perfil")}
                  className="py-4 px-8 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label uppercase text-xs tracking-[0.2em] font-semibold text-center transition-all duration-200 cursor-pointer"
                >
                  CONSERVAR MI CUENTA
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Editorial Visual Storytelling & Alternative Options (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Alternative: Pause or Silence Notifications instead */}
            <div className="bg-surface-container p-7 space-y-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <PauseCircle className="size-[22px] text-primary" strokeWidth={1.8} />
                <h3 className="text-xl font-headline uppercase tracking-wider text-on-surface m-0">
                  ¿Solo necesitas un respiro?
                </h3>
              </div>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">
                Si el motivo de tu baja es la frecuencia de nuestras comunicaciones o un periodo de
                desconexión, no es necesario eliminar tu cuenta permanentemente:
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => onNavigate("preferencias-de-notificaciones")}
                  className="w-full flex items-center justify-between p-3.5 bg-surface-container-low hover:bg-surface-bright transition-colors group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <BellOff
                      className="size-[18px] text-tertiary group-hover:text-primary transition-colors"
                      strokeWidth={1.8}
                    />
                    <div>
                      <span className="block text-xs font-label uppercase tracking-widest text-on-surface font-semibold">
                        Pausar Correos & Noticias
                      </span>
                      <span className="block text-[11px] font-body text-on-surface-variant">
                        Mantén tu historial intacto sin recibir correspondencia
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-[18px] text-tertiary group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Legal Footnote */}
            <div className="p-2 text-center lg:text-left">
              <p className="text-[11px] font-body text-tertiary leading-relaxed">
                NORTE procesa las solicitudes de cancelación conforme al Reglamento General de
                Protección de Datos (RGPD UE 2016/679). Los registros contables y fiscales
                legalmente exigidos serán custodiados bajo cifrado según los plazos que dicta la ley
                española y europea.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col w-full">
      <div className="pb-8 mb-8 border-b border-outline-variant/30">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[11px] font-label font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Próximamente
          </span>
        </div>
        <h2
          className="text-5xl md:text-6xl tracking-wide uppercase text-on-surface leading-none mt-1"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant max-w-xl">{description}</p>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[260px] bg-surface-container-low p-12 shadow-sm text-center gap-6">
        <div className="w-16 h-16 bg-surface-container flex items-center justify-center text-primary/60">
          <Icon className="size-8" strokeWidth={1.4} />
        </div>
        <div>
          <p
            className="text-2xl uppercase tracking-widest text-on-surface-variant"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            Sección en desarrollo
          </p>
          <p className="text-xs text-outline mt-2 max-w-xs mx-auto">
            Esta funcionalidad está siendo construida. Estará disponible en una próxima
            actualización del archivo NORTE.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-[11px] font-label uppercase tracking-[0.2em] text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant animate-pulse" />
          Ref. NORTE · En progreso
        </div>
      </div>
    </div>
  );
}

export function AccountView() {
  const { user, isLoading } = useSession();
  const [currentSection, setCurrentSection] = useState<Section>("perfil");

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const SIDEBAR_ITEMS: { section: Section; icon: React.ElementType; label: string }[] = [
    { section: "perfil", icon: User, label: "Perfil" },
    { section: "fotografia", icon: Camera, label: "Fotografía" },
    { section: "seguridad", icon: Lock, label: "Seguridad de la cuenta" },
    { section: "suscripciones", icon: BadgeCheck, label: "Suscripciones" },
    { section: "metodos-de-pago", icon: CreditCard, label: "Métodos de pago" },
    { section: "privacidad", icon: Shield, label: "Privacidad" },
    {
      section: "preferencias-de-notificaciones",
      icon: Bell,
      label: "Preferencias de notificaciones",
    },
    { section: "cerrar-cuenta", icon: UserX, label: "Cerrar cuenta" },
  ];

  return (
    <div className="flex flex-1 min-h-[calc(100vh-5rem)] bg-background font-body text-on-surface antialiased">
      <aside className="sticky top-20 self-start w-72 shrink-0 h-[calc(100vh-5rem)] bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 overflow-y-auto px-6 py-8">
        <div className="mb-8 px-3">
          <p className="text-[11px] font-label font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Área de Cuenta
          </p>
        </div>
        <nav className="flex flex-col space-y-1" aria-label="Secciones de cuenta">
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarItem
              key={item.section}
              section={item.section}
              current={currentSection}
              icon={item.icon}
              label={item.label}
              onClick={() => setCurrentSection(item.section)}
            />
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 bg-background">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-16 py-12">
          {currentSection === "perfil" && <SectionPerfil user={user} />}
          {currentSection === "fotografia" && <SectionFotografia user={user} />}
          {currentSection === "seguridad" && <SectionSeguridad user={user} />}
          {currentSection === "suscripciones" && (
            <SectionPlaceholder
              icon={BadgeCheck}
              title="Suscripciones"
              description="Gestiona tus suscripciones activas al boletín editorial y a los archivos de colección NORTE."
            />
          )}
          {currentSection === "metodos-de-pago" && (
            <SectionPlaceholder
              icon={CreditCard}
              title="Métodos de Pago"
              description="Administra tus tarjetas y métodos de pago vinculados a tu cuenta en el archivo NORTE."
            />
          )}
          {currentSection === "privacidad" && (
            <SectionPlaceholder
              icon={Shield}
              title="Privacidad"
              description="Controla qué información compartes y cómo NORTE gestiona tus datos personales según el marco RGPD."
            />
          )}
          {currentSection === "preferencias-de-notificaciones" && (
            <SectionPlaceholder
              icon={Bell}
              title="Preferencias de Notificaciones"
              description="Configura qué comunicaciones y alertas deseas recibir del equipo curatorial de NORTE."
            />
          )}
          {currentSection === "cerrar-cuenta" && (
            <SectionCerrarCuenta onNavigate={setCurrentSection} />
          )}
        </div>
      </div>
    </div>
  );
}
