import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useCheckoutStore } from "@/stores/checkout";

export const ErrorPage = () => {
  const navigate = useNavigate();
  const currency = useCheckoutStore((state) => state.getCurrency());
  const amount = useCheckoutStore((state) => state.getAmount());
  const reset = useCheckoutStore((state) => state.reset);

  const handleRetry = () => {
    navigate({ to: "/payment" });
  };

  const handleStartOver = () => {
    reset();
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-9 w-9 text-red-600" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">
          Payment failed
        </h2>
        <p className="text-sm text-muted-foreground">
          Your payment of{" "}
          <span className="font-semibold text-foreground font-mono">
            {currency} {amount}
          </span>{" "}
          could not be processed. Please try again.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={handleStartOver}>
          Start over
        </Button>
        <Button
          onClick={handleRetry}
          className="bg-[#1d4b58] hover:bg-[#275f70]"
        >
          Retry payment
        </Button>
      </div>
    </div>
  );
};
