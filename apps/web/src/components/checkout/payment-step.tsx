import { memo } from "react";
import { useGetSession } from "@/api/request";
import { usePayrailsClient } from "@/hooks/usePayrailsClient";
import { VOUCHERS } from "@/data/mock-data";
import type { Country } from "@/data/mock-data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tag, Layers, LayoutGrid } from "lucide-react";
import "@payrails/web-sdk/payrails-styles.css";
import { ElementsPayment } from "./elements-payment";
import { DropInPayment } from "./dropin-payment";
import { useCheckoutStore } from "@/stores/checkout";

interface PaymentStepProps {
  country: Country;
  currency: "GBP" | "JOD";
  amount: string;
  isSubscription: boolean;
  months?: number | null;
  onSuccess: () => void;
  onBack: () => void;
}

export const PaymentStep = ({
  country: _country,
  currency,
  amount,
  isSubscription,
  months,
  onSuccess,
  onBack,
}: PaymentStepProps) => {
  const sessionParams = {
    currency,
    amount,
    recurring: isSubscription,
    ...(isSubscription ? { months: months ?? 1 } : {}),
  };
  const { data, refetch: refetchSession } = useGetSession(sessionParams);

  const { payrailsClient } = usePayrailsClient({
    config: data,
    environment: "TEST",
  });

  return (
    <div className="space-y-6">
      <PaymentHeader currency={currency} />
      <Separator />
      <SdkModeSelector />
      <Separator />
      <VoucherSelector />
      <Separator />
      <SdkModePayment
        payrailsClient={payrailsClient}
        currency={currency}
        onSuccess={onSuccess}
        onBack={onBack}
        refetchSession={refetchSession}
      />
    </div>
  );
};

const PaymentHeaderTitle = memo(() => (
  <div className="space-y-1">
    <h2 className="text-base font-semibold text-foreground">Payment method</h2>
    <p className="text-sm text-muted-foreground">
      Choose how you'd like to pay
    </p>
  </div>
));

const PaymentAmountBadge = ({ currency }: { currency: "GBP" | "JOD" }) => {
  const displayAmount = useCheckoutStore((state) => state.getDisplayAmount());

  return (
    <Badge
      variant="outline"
      className="font-mono text-sm font-bold px-3 py-1 shrink-0"
    >
      {currency} {displayAmount}
    </Badge>
  );
};

const PaymentHeader = ({ currency }: { currency: "GBP" | "JOD" }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <PaymentHeaderTitle />
      <PaymentAmountBadge currency={currency} />
    </div>
  );
};

const SdkModeSelector = () => {
  const sdkMode = useCheckoutStore((state) => state.sdkMode);
  const setSdkMode = useCheckoutStore((state) => state.setSdkMode);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground px-1">
        SDK Integration
      </p>
      <RadioGroup
        value={sdkMode}
        onValueChange={(value) => setSdkMode(value as "elements" | "dropin")}
        className="grid grid-cols-2 gap-3"
      >
        <Label className="flex flex-col gap-2 cursor-pointer rounded-lg border border-gray-300 bg-card px-4 py-3 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary">
          <RadioGroupItem value="elements" className="hidden" />
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              Elements
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            Individual payment components with full UI control
          </p>
        </Label>
        <Label className="flex flex-col gap-2 cursor-pointer rounded-lg border border-gray-300 bg-card px-4 py-3 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary">
          <RadioGroupItem value="dropin" className="hidden" />
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              Drop-in
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            Pre-built payment UI embedded in one component
          </p>
        </Label>
      </RadioGroup>
    </div>
  );
};

const VoucherSelector = () => {
  const selectedVoucherId = useCheckoutStore(
    (state) => state.selectedVoucherId,
  );
  const setSelectedVoucherId = useCheckoutStore(
    (state) => state.setSelectedVoucherId,
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground px-1">Voucher</p>
      <RadioGroup
        value={selectedVoucherId ?? "none"}
        onValueChange={(value) =>
          setSelectedVoucherId(value === "none" ? null : value)
        }
        className="space-y-2"
      >
        <Label className="flex items-center border-gray-300 gap-3 cursor-pointer rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary">
          <RadioGroupItem value="none" className="hidden" />
          <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">No voucher</span>
        </Label>
        {VOUCHERS.map((voucher) => (
          <Label
            key={voucher.id}
            className="flex items-center border-gray-300 gap-3 cursor-pointer rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary"
          >
            <RadioGroupItem value={voucher.id} className="hidden" />
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {voucher.code}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {voucher.type === "percentage"
                    ? `${voucher.discount}% OFF`
                    : `${voucher.discount} OFF`}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {voucher.description}
                {voucher.minOrder > 0 && ` · Min. order ${voucher.minOrder}`}
              </p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};

const SdkModePayment = ({
  payrailsClient,
  currency,
  onSuccess,
  onBack,
  refetchSession,
}: {
  payrailsClient: ReturnType<typeof usePayrailsClient>["payrailsClient"];
  currency: "GBP" | "JOD";
  onSuccess: () => void;
  onBack: () => void;
  refetchSession: () => void;
}) => {
  const sdkMode = useCheckoutStore((state) => state.sdkMode);

  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground">Checkout</h2>
      <p className="text-sm text-muted-foreground">Payment Options</p>
      {sdkMode === "elements" ? (
        <ElementsPayment
          payrailsClient={payrailsClient}
          currency={currency}
          onSuccess={onSuccess}
          onBack={onBack}
          refetchSession={refetchSession}
        />
      ) : (
        <DropInPayment
          payrailsClient={payrailsClient}
          currency={currency}
          onSuccess={onSuccess}
          onBack={onBack}
          refetchSession={refetchSession}
        />
      )}
    </div>
  );
};
