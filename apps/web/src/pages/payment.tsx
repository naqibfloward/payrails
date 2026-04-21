import { Suspense } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCheckoutStore } from "@/stores/checkout";
import { PaymentStep } from "@/components/checkout/payment-step";

export const PaymentPage = () => {
  const navigate = useNavigate();
  const country = useCheckoutStore((state) => state.country);
  const operation = useCheckoutStore((state) => state.operation);
  const currency = useCheckoutStore((state) => state.getCurrency());
  const amount = useCheckoutStore((state) => state.getAmount());
  const months = useCheckoutStore((state) => state.getSubscriptionMonths());

  if (!country) return null;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading payment methods…
          </p>
        </div>
      }
    >
      <PaymentStep
        country={country}
        currency={currency}
        amount={amount}
        isSubscription={operation === "subscription"}
        months={months}
        onSuccess={() => navigate({ to: "/success" })}
        onBack={() => navigate({ to: "/items" })}
      />
    </Suspense>
  );
};
