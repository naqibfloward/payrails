import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "./client";

type Currency = "GBP" | "JOD";

type SessionQuery = {
  currency: Currency;
  amount: string;
  recurring: boolean;
  months?: number;
};

export const useGetSession = (params: SessionQuery) => {
  return useQuery({
    queryKey: ["session", params],
    queryFn: async () => {
      const response = await client.session.get({
        query: params.recurring
          ? {
              currency: params.currency,
              amount: params.amount,
              recurring: true as const,
              months: params.months!,
            }
          : {
              currency: params.currency,
              amount: params.amount,
              recurring: false as const,
            },
      });
      if (!response.data) {
        throw new Error("Failed to fetch session");
      }
      return response.data;
    },
  });
};

export const useUpdateAmount = () => {
  return useMutation({
    mutationFn: async (params: {
      executionId: string;
      amount: string;
      currency: Currency;
    }) => {
      const response = await client.update.post({
        executionId: params.executionId,
        amount: params.amount,
        currency: params.currency,
      });
      if (response.error) {
        throw new Error("Failed to update amount");
      }
      return response.data;
    },
  });
};
