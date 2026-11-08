export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Datos de una sola lectura (p. ej. contraseña temporal generada). */
  secret?: string;
  ts?: number;
} | null;
