import { useEffect, useRef } from "react";
import { Payrails } from "@payrails/web-sdk";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useUpdateAmount } from "@/api/request";
import { useCheckoutStore } from "@/stores/checkout";

type PayrailsClient = ReturnType<typeof Payrails.init>;

interface DropInPaymentProps {
  payrailsClient: PayrailsClient | undefined;
  currency: "GBP" | "JOD";
  onSuccess: () => void;
  onBack: () => void;
  refetchSession: () => void;
}

export const DropInPayment = ({
  payrailsClient,
  currency,
  onSuccess,
  onBack,
  refetchSession,
}: DropInPaymentProps) => {
  const onSuccessRef = useRef(onSuccess);
  const refetchSessionRef = useRef(refetchSession);
  onSuccessRef.current = onSuccess;
  refetchSessionRef.current = refetchSession;

  const { mutateAsync: updateAmount } = useUpdateAmount();
  const updateAmountRef = useRef(updateAmount);
  updateAmountRef.current = updateAmount;

  useEffect(() => {
    if (!payrailsClient) return;

    const dropIn = payrailsClient.dropin({
      events: {
        onSuccess: () => onSuccessRef.current(),
        onFailed: (action, e) => {
          console.log("DropIn payment failed on action: ", action);
          console.log("DropIn payment failed: ", e);
        },
        onButtonClicked: async () => {
          const executionId = payrailsClient.query("executionId");
          if (executionId) {
            const amount = useCheckoutStore.getState().getDisplayAmount();
            try {
              await updateAmountRef.current({ executionId, amount, currency });
              payrailsClient.update({ value: amount, currency });
            } catch (err) {
              console.error("Failed to update amount before payment:", err);
              return false;
            }
          }
          return true;
        },
        onPaymentSessionExpired: () => {
          refetchSessionRef.current();
        },
      },
    });

    dropIn.mount("#dropin-container");

    return () => {
      dropIn.unmount();
    };
  }, [payrailsClient]);

  return (
    <div className="space-y-4">
      {!payrailsClient ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Initializing payment…</p>
        </div>
      ) : (
        <div id="dropin-container" />
      )}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 -ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
};
