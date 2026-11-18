import type {
  AdminSettingsResponse,
  UpdateAdminSettingsDto,
} from "../types/admin-settings.interface";

export class AdminSettingsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AdminSettingsApiError";
  }
}

async function handleResponseError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null);

  throw new AdminSettingsApiError(
    body?.message ?? body?.error ?? "Ocurrió un error al procesar la solicitud.",
    response.status,
    body?.code,
  );
}

export async function fetchAdminSettings(signal?: AbortSignal): Promise<AdminSettingsResponse> {
  const response = await fetch("/api/admin/settings", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  return response.json();
}

export async function updateAdminSettings(
  dto: UpdateAdminSettingsDto,
): Promise<AdminSettingsResponse> {
  const response = await fetch("/api/admin/settings", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  return response.json();
}
