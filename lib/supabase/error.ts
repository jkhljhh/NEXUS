// Filename: error.ts
// Path: @/lib/supabase/

export class SupabaseError extends Error {
  status: number;

  constructor(message: string, status: number = 500, name = "SupabaseError") {
    super(message);
    this.name = name;
    this.status = status;

    // Restore prototype chain for instanceof to work
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function toSupabaseError(err: any): SupabaseError {
  return new SupabaseError(
    err?.message || "Unknown error",
    err?.status || 500,
    err?.name || "SupabaseError",
  );
}
