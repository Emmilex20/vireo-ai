export type Nullable<T> = T | null;

export type GenerationType =
  | "image"
  | "video"
  | "restyle"
  | "motion"
  | "sound";

export type GenerationStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

  export type CreditTransactionType =
  | "signup_bonus"
  | "purchase"
  | "generation_debit"
  | "refund"
  | "admin_adjustment";