import { memo } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Country } from "@/data/mock-data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout";

const COUNTRY_OPTIONS: {
  id: Country;
  label: string;
  flag: string;
  currency: string;
}[] = [
  {
    id: "United Kingdom",
    label: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
  },
  { id: "Jordan", label: "Jordan", flag: "🇯🇴", currency: "JOD" },
];

const Header = memo(() => (
  <div className="space-y-1">
    <h2 className="text-base font-semibold text-foreground">
      Select your country
    </h2>
    <p className="text-sm text-muted-foreground">
      Pricing and currency will reflect your selection
    </p>
  </div>
));

export const CountryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Header />
      <CountrySelector />
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          className="gap-1.5 -ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button size="sm" onClick={() => navigate({ to: "/items" })}>
          Next
        </Button>
      </div>
    </div>
  );
};

const CountrySelector = () => {
  const country = useCheckoutStore((state) => state.country);
  const setCountry = useCheckoutStore((state) => state.setCountry);

  return (
    <RadioGroup
      value={country ?? "United Kingdom"}
      onValueChange={(value) => setCountry(value as Country)}
      className="grid grid-cols-2 gap-3"
    >
      {COUNTRY_OPTIONS.map((option) => (
        <Label
          key={option.id}
          className="flex flex-col gap-3 border-gray-300 cursor-pointer rounded-lg border bg-card p-5 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary"
        >
          <RadioGroupItem value={option.id} className="hidden" />
          <span className="text-3xl">{option.flag}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {option.label}
            </p>
            <Badge variant="secondary" className="mt-1.5 text-xs font-mono">
              {option.currency}
            </Badge>
          </div>
        </Label>
      ))}
    </RadioGroup>
  );
};
