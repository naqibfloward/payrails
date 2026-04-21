import { memo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCheckoutStore } from "@/stores/checkout";
import { PRODUCTS, SUBSCRIPTIONS_BY_COUNTRY } from "@/data/mock-data";
import type { Country, Product } from "@/data/mock-data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, Minus, Plus } from "lucide-react";

export const ItemsPage = () => {
  const navigate = useNavigate();
  const operation = useCheckoutStore((state) => state.operation);
  const country = useCheckoutStore((state) => state.country);

  if (!operation || !country) return null;

  return (
    <div className="space-y-6">
      {operation === "subscription" ? (
        <>
          <SubscriptionHeader country={country} />
          <SubscriptionSelector country={country} />
        </>
      ) : (
        <>
          <ProductHeader country={country} />
          <ProductGrid country={country} />
          <ProductSummary country={country} />
        </>
      )}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/country" })}
          className="gap-1.5 -ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button size="sm" onClick={() => navigate({ to: "/payment" })}>
          Continue
        </Button>
      </div>
    </div>
  );
};

const SubscriptionHeader = memo(({ country }: { country: Country }) => {
  const currency = SUBSCRIPTIONS_BY_COUNTRY[country][0]?.currency;
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground">
        Choose a subscription plan
      </h2>
      <p className="text-sm text-muted-foreground">
        Prices in{" "}
        <span className="font-medium text-foreground">{currency}</span> ·{" "}
        {country}
      </p>
    </div>
  );
});

const SubscriptionSelector = ({ country }: { country: Country }) => {
  const selectedId = useCheckoutStore((state) => state.selectedSubscriptionId);
  const setSelectedId = useCheckoutStore(
    (state) => state.setSelectedSubscriptionId,
  );
  const subscriptions = SUBSCRIPTIONS_BY_COUNTRY[country];
  const currency = subscriptions[0]?.currency;

  useEffect(() => {
    if (!selectedId && subscriptions.length > 0) {
      setSelectedId(subscriptions[0].id);
    }
  }, [selectedId, subscriptions, setSelectedId]);

  return (
    <RadioGroup
      value={selectedId ?? ""}
      onValueChange={(val) => setSelectedId(val)}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {subscriptions.map((sub) => (
        <Label
          key={sub.id}
          className="flex border-gray-300 flex-col cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-accent has-data-[state=checked]:border-primary has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary"
        >
          <RadioGroupItem value={sub.id} className="sr-only" />
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">{sub.name}</p>
            <Badge
              variant={sub.period === 12 ? "default" : "secondary"}
              className="text-xs ml-2 shrink-0"
            >
              {sub.period} months
            </Badge>
          </div>
          <div className="text-xl font-bold text-primary mb-1">
            {currency} {sub.price.toFixed(country === "Jordan" ? 3 : 2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              /{sub.period} mo
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {sub.description}
          </p>
          <ul className="mt-auto space-y-1">
            {sub.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Check className="h-3 w-3 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </Label>
      ))}
    </RadioGroup>
  );
};

const ProductHeader = memo(({ country }: { country: Country }) => {
  const currency = PRODUCTS[0]?.currency[country] ?? "GBP";
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground">
        Select your products
      </h2>
      <p className="text-sm text-muted-foreground">
        Prices in{" "}
        <span className="font-medium text-foreground">{currency}</span> ·{" "}
        {country}
      </p>
    </div>
  );
});

const ProductGrid = memo(({ country }: { country: Country }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {PRODUCTS.map((product) => (
      <ProductCard key={product.id} product={product} country={country} />
    ))}
  </div>
));

const ProductCard = ({
  product,
  country,
}: {
  product: Product;
  country: Country;
}) => {
  const quantity = useCheckoutStore(
    (state) =>
      state.productSelections.find(
        (selection) => selection.productId === product.id,
      )?.quantity ?? 0,
  );
  const updateQuantity = useCheckoutStore(
    (state) => state.updateProductQuantity,
  );

  return (
    <Card
      className={cn(
        "transition-all border-gray-300 shadow-none",
        quantity > 0 && "border-primary ring-1 ring-primary",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl leading-none mt-0.5">{product.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {product.description}
            </p>
            <p className="text-sm font-bold text-primary mt-1">
              {product.currency[country]}{" "}
              {product.price[country].toFixed(country === "Jordan" ? 3 : 2)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(product.id, -1)}
            disabled={quantity === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-5 text-center text-sm font-semibold text-foreground">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(product.id, 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductSummary = ({ country }: { country: Country }) => {
  const currency = PRODUCTS[0]?.currency[country] ?? "GBP";

  const totalItems = useCheckoutStore((state) =>
    state.productSelections.reduce(
      (sum, selection) => sum + selection.quantity,
      0,
    ),
  );
  const totalAmount = useCheckoutStore((state) =>
    state.productSelections.reduce((sum, selection) => {
      const product = PRODUCTS.find((prod) => prod.id === selection.productId);
      return sum + (product ? product.price[country] * selection.quantity : 0);
    }, 0),
  );

  if (totalItems === 0) return null;

  return (
    <>
      <Separator />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {totalItems} item{totalItems !== 1 ? "s" : ""} selected
        </span>
        <span className="font-bold text-foreground">
          {currency} {totalAmount.toFixed(country === "Jordan" ? 3 : 2)}
        </span>
      </div>
    </>
  );
};
