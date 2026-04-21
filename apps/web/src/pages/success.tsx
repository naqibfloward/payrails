import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useCheckoutStore } from "@/stores/checkout";

export const SuccessPage = () => {
  const navigate = useNavigate();
  const currency = useCheckoutStore((state) => state.getCurrency());
  const amount = useCheckoutStore((state) => state.getAmount());
  const reset = useCheckoutStore((state) => state.reset);

  const handleDone = () => {
    reset();
    navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-9 w-9 text-green-600" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">
          Payment successful
        </h2>
        <p className="text-sm text-muted-foreground">
          Your payment of{" "}
          <span className="font-semibold text-foreground font-mono">
            {currency} {amount}
          </span>{" "}
          has been processed successfully.
        </p>
      </div>
      <Button
        onClick={handleDone}
        className="mt-2 bg-[#1d4b58] hover:bg-[#275f70]"
      >
        Start a new order
      </Button>
    </div>
  );
};
