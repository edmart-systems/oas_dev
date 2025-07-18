import { Currency } from "@prisma/client";

export type Currency2 = Omit<Currency, "created_at" | "updated_at">;
