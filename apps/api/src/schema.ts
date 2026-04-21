import z from "zod";

const currencyEnum = z.enum(
  ["GBP", "JOD"],
  "Currency must be either GBP or JOD",
);
export type Currency = z.infer<typeof currencyEnum>;

export const basePayloadSchema = z.object({
  currency: currencyEnum,
  amount: z
    .string("Amount must be a string")
    .regex(
      /^\d+(\.\d{1,3})?$/,
      "Amount must be a string representing a number with up to 3 decimal places",
    ),
});

const coerceQueryParams = (input: unknown) => {
  if (typeof input !== "object" || input === null) return input;
  const params = input as Record<string, unknown>;
  const recurringMap: Record<string, boolean> = { true: true, false: false };
  return {
    ...params,
    recurring: recurringMap[params.recurring as string] ?? params.recurring,
    ...(params.months !== undefined && { months: Number(params.months) }),
  };
};

export const sessionPayloadSchema = z.preprocess(
  coerceQueryParams,
  z.discriminatedUnion("recurring", [
    basePayloadSchema.extend({
      recurring: z.literal(false),
    }),
    basePayloadSchema.extend({
      recurring: z.literal(true),
      months: z
        .number("Months must be a number")
        .int("Months must be an integer")
        .positive("Months must be a positive integer")
        .max(12, "Months cannot exceed 12"),
    }),
  ]),
);

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export const updateAmountPayloadSchema = z.object({
  amount: z
    .string("Amount must be a string")
    .regex(
      /^\d+(\.\d{1,3})?$/,
      "Amount must be a string representing a number with up to 3 decimal places",
    ),
  currency: currencyEnum,
  executionId: z.uuid("Execution ID must be a valid UUID"),
});

export type UpdateAmountPayload = z.infer<typeof updateAmountPayloadSchema>;
