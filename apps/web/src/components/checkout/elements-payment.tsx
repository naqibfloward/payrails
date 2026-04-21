import { useEffect, useMemo, useRef, useState } from "react";
import { Payrails } from "@payrails/web-sdk";
import { usePayrailsAvailability } from "@/hooks/usePayrailsAvailability";
import { PAYMENT_METHODS } from "@/data/mock-data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, CreditCard, Trash2 } from "lucide-react";
import type { CardListOptions } from "@payrails/web-sdk";
import { useCheckoutStore } from "@/stores/checkout";
import { useUpdateAmount } from "@/api/request";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type PayrailsClient = ReturnType<typeof Payrails.init>;
type CardInstrument = Parameters<CardListOptions["onCardChange"]>[0];
type CardInstrumentWithData = CardInstrument & {
  data: NonNullable<CardInstrument["data"]>;
};

interface ElementsPaymentProps {
  payrailsClient: PayrailsClient | undefined;
  currency: "GBP" | "JOD";
  onSuccess: () => void;
  onBack: () => void;
  refetchSession: () => void;
}

const isCardInstrument = (
  instrument: unknown,
): instrument is CardInstrumentWithData => {
  if (!instrument || typeof instrument !== "object") return false;
  const { data } = instrument as { data?: unknown };
  return (
    data !== null &&
    data !== undefined &&
    typeof data === "object" &&
    "bin" in data
  );
};

const getInstrumentLogo = (network: string) => {
  switch (network.toLowerCase()) {
    case "visa":
      return "https://logos-world.net/wp-content/uploads/2020/05/Visa-Logo.png";
    case "mastercard":
      return "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg";
    case "amex":
      return "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg";
    default:
      return "";
  }
};

export const ElementsPayment = ({
  payrailsClient,
  currency,
  onSuccess,
  onBack,
  refetchSession,
}: ElementsPaymentProps) => {
  const [selectedPayment, setSelectedPayment] = useState("credit_card");
  const [isCardFormReady, setIsCardFormReady] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const onSuccessRef = useRef(onSuccess);
  const onBackRef = useRef(onBack);
  const refetchSessionRef = useRef(refetchSession);
  onSuccessRef.current = onSuccess;
  onBackRef.current = onBack;
  refetchSessionRef.current = refetchSession;

  const { mutateAsync: updateAmount } = useUpdateAmount();
  const updateAmountRef = useRef(updateAmount);
  updateAmountRef.current = updateAmount;

  const performAmountUpdate = async () => {
    const executionId = payrailsClient?.query("executionId");
    if (!executionId) {
      console.warn("No executionId available for amount update");
      return;
    }
    const amount = useCheckoutStore.getState().getDisplayAmount();
    await updateAmountRef.current({ executionId, amount, currency });
    payrailsClient!.update({ value: amount, currency });
  };
  const performAmountUpdateRef = useRef(performAmountUpdate);
  performAmountUpdateRef.current = performAmountUpdate;

  const { applePayAvailable, googlePayAvailable } = usePayrailsAvailability({
    payrailsClient,
    googlePayMerchantInfo: { merchantName: "Floward" },
  });

  const cardInstruments = useMemo(
    () =>
      payrailsClient?.query("paymentMethodInstruments", {
        paymentMethodCode: "card",
      }),
    [payrailsClient],
  );

  const savedCards = useMemo(() => {
    if (!cardInstruments?.length) return [];
    return cardInstruments.filter(isCardInstrument).map((instrument) => ({
      id: instrument.id,
      lastFour: instrument.data.suffix,
      network: instrument.data.network ?? "",
      logo: getInstrumentLogo(instrument.data.network ?? ""),
    }));
  }, [cardInstruments]);

  const cardForm = useMemo(
    () =>
      payrailsClient
        ? payrailsClient.cardForm({
            showSingleExpiryDateField: true,
            showStoreInstrumentCheckbox: true,
            styles: {
              storeInstrumentCheckbox: {
                display: "flex",
                alignItems: "center",
                marginTop: "8px",
              },
              inputFields: {
                all: {
                  base: {
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    margin: "5px",
                  },
                },
                CARD_NUMBER: { base: { maxWidth: "calc(100% - 0.5rem)" } },
                EXPIRATION_DATE: { base: { maxWidth: "calc(100% - 0.5rem)" } },
                CVV: { base: { maxWidth: "calc(100% - 0.5rem)" } },
              },
            },
            translations: {
              labels: { storeInstrument: "Save card for faster checkout" },
            },
            events: {
              onReady: () => setIsCardFormReady(true),
            },
          })
        : null,
    [payrailsClient],
  );

  useEffect(() => {
    setIsCardFormReady(false);
  }, [cardForm]);

  const paymentButton = useMemo(
    () =>
      payrailsClient?.paymentButton({
        translations: {
          label: `Pay ${currency} ${useCheckoutStore.getState().getDisplayAmount()}`,
        },
        disabledByDefault: true,
        events: {
          onSuccess: () => onSuccessRef.current(),
          onFailed: (action, e) => {
            console.log("Payment failed for card action: ", action);
            console.log("Payment failed for card: ", e);
          },
          onButtonClicked: async () => {
            try {
              await performAmountUpdateRef.current();
            } catch (err) {
              console.error("Failed to update amount before payment:", err);
              return false;
            }
            return true;
          },
          onPaymentSessionExpired: () => {
            refetchSessionRef.current();
          },
        },
        styles: {
          base: {
            width: "100%",
            border: "1px solid transparent",
            borderRadius: "8px",
            backgroundColor: "#1d4b58",
            borderColor: "transparent",
            color: "#ffffff",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: "600",
            minHeight: "40px",
          },
          disabled: {
            backgroundColor: "#e2e8f0",
            color: "#94a3b8",
          },
          hover: {
            backgroundColor: "#275f70",
          },
        },
      }),
    [payrailsClient],
  );

  const applePayButton = useMemo(
    () =>
      payrailsClient?.applePayButton({
        showStoreInstrumentCheckbox: false,
        abortAfterAuthorizeFailed: false,
        events: {
          onSuccess: () => onSuccessRef.current(),
          onFailed: (e) => console.log("Payment failed for apple pay: ", e),
          onButtonClicked: async () => {
            try {
              await performAmountUpdateRef.current();
            } catch (err) {
              console.error("Failed to update amount before payment:", err);
              return false;
            }
            return true;
          },
          onPaymentSessionExpired: () => {
            refetchSessionRef.current();
          },
          onApplePayAvailable() {},
        },
        styles: { type: "buy" },
      }),
    [payrailsClient],
  );

  const googlePayButton = useMemo(
    () =>
      payrailsClient?.googlePayButton({
        showStoreInstrumentCheckbox: false,
        events: {
          onSuccess: () => onSuccessRef.current(),
          onFailed: (action, event) => {
            console.log("Google Pay failed on action: ", action);
            console.log("Google Pay failed with event: ", event);
          },
          onButtonClicked: async () => {
            try {
              await performAmountUpdateRef.current();
            } catch (err) {
              console.error("Failed to update amount before payment:", err);
              return false;
            }
            return true;
          },
          onPaymentSessionExpired: () => {
            refetchSessionRef.current();
          },
        },
      }),
    [payrailsClient],
  );

  const isCard = selectedPayment === "credit_card";
  const isGooglePay = selectedPayment === "google_pay";
  const isApplePay = selectedPayment === "apple_pay";

  useEffect(() => {
    if (isCard) {
      cardForm?.mount("#card-form");
      paymentButton?.mount("#payment-button");
    } else if (isGooglePay) {
      googlePayButton?.mount("#google-pay-button");
    } else if (isApplePay) {
      applePayButton?.mount("#apple-pay-button");
    }

    return () => {
      cardForm?.unmount();
      paymentButton?.unmount();
      googlePayButton?.unmount();
      applePayButton?.unmount();
    };
  }, [
    cardForm,
    paymentButton,
    googlePayButton,
    applePayButton,
    selectedPayment,
    isCard,
    isGooglePay,
    isApplePay,
  ]);

  const visibleMethods = PAYMENT_METHODS.filter((method) => {
    if (method.id === "apple_pay" && !applePayAvailable) return false;
    if (method.id === "google_pay" && !googlePayAvailable) return false;
    return true;
  });

  const handleDeleteSavedCard = async (cardId: string) => {
    const result = await payrailsClient?.api({
      operation: "deleteInstrument",
      resourceId: cardId,
    });

    if (result?.success) {
      toast.success("Card deleted successfully", { position: "top-right" });
      refetchSession();
    } else {
      toast.error("Failed to delete card", { position: "top-right" });
    }
  };

  return (
    <>
      <RadioGroup
        value={selectedPayment}
        onValueChange={setSelectedPayment}
        className="space-y-2"
      >
        {savedCards.length > 0 ? (
          <>
            <p className="text-xs font-medium text-muted-foreground px-1 pb-0.5">
              Saved cards
            </p>
            {savedCards.map((card) => (
              <Label
                key={card.id}
                className={cn(
                  "flex items-center gap-3 cursor-pointer rounded-lg border border-gray-300 bg-card px-4 py-3 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary",
                )}
              >
                <RadioGroupItem value={card.id} />
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground font-mono">
                  •••• •••• •••• {card.lastFour}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCardToDelete(card.id);
                  }}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Delete saved card"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <span className="flex-1" />
                <img
                  src={card.logo}
                  alt={card.network}
                  className="h-6 w-12 object-contain object-right shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </Label>
            ))}
            <p className="text-xs font-medium text-muted-foreground px-1 pb-0.5 pt-2">
              Other payment methods
            </p>
          </>
        ) : null}
        {visibleMethods.map((method) => (
          <div key={method.id}>
            <Label
              className={cn(
                "flex items-center gap-3 cursor-pointer rounded-lg border border-gray-300 bg-card px-4 py-3 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary",
              )}
            >
              <RadioGroupItem value={method.id} />
              {!method.logo && (
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="flex-1 text-sm font-medium text-foreground">
                {method.label}
              </span>
              {method.logo && (
                <img
                  src={method.logo}
                  alt={method.label}
                  className="h-6 w-12 object-contain object-right shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </Label>
            {method.id === "credit_card" && (
              <div
                className={cn(
                  "mt-4 rounded-lg border border-gray-200 bg-muted p-6 space-y-4",
                  selectedPayment === "credit_card" && isCardFormReady
                    ? "block"
                    : "hidden",
                )}
              >
                <div id="card-form" />
              </div>
            )}
          </div>
        ))}
      </RadioGroup>
      <div id="google-pay-button" />
      <div id="apple-pay-button" />
      <div id="payment-button" />
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
      <AlertDialog
        open={cardToDelete !== null}
        onOpenChange={(open) => !open && setCardToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove saved card?</AlertDialogTitle>
            <AlertDialogDescription>
              This card will be permanently removed from your saved payment
              methods. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (cardToDelete) handleDeleteSavedCard(cardToDelete);
                setCardToDelete(null);
              }}
            >
              Remove card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
