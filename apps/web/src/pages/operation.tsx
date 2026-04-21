import { memo } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Operation } from "@/data/mock-data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCheckoutStore } from "@/stores/checkout";

const OPTIONS: {
  id: Operation;
  label: string;
  description: string;
}[] = [
  {
    id: "checkout",
    label: "Checkout",
    description: "Browse products and complete a one-time purchase",
  },
  {
    id: "subscription",
    label: "Subscription",
    description: "Choose a recurring plan and subscribe",
  },
];

const Header = memo(() => (
  <div className="space-y-1">
    <h2 className="text-base font-semibold text-foreground">
      What would you like to do?
    </h2>
    <p className="text-sm text-muted-foreground">
      Select the type of transaction to perform
    </p>
  </div>
));

export const OperationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Header />
      <OperationSelector />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => navigate({ to: "/country" })}>
          Next
        </Button>
      </div>
    </div>
  );
};

const OperationSelector = () => {
  const operation = useCheckoutStore((state) => state.operation);
  const setOperation = useCheckoutStore((state) => state.setOperation);

  return (
    <RadioGroup
      value={operation ?? "checkout"}
      onValueChange={(value) => setOperation(value as Operation)}
      className="grid grid-cols-2 gap-3"
    >
      {OPTIONS.map((option) => (
        <Label
          key={option.id}
          className="flex flex-col gap-4 border-gray-300 cursor-pointer rounded-lg border bg-card p-5 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary"
        >
          <RadioGroupItem value={option.id} className="hidden" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {option.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {option.description}
            </p>
          </div>
        </Label>
      ))}
    </RadioGroup>
  );
};
