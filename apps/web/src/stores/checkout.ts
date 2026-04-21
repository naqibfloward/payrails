import { create } from "zustand";
import type { Country, Operation, ProductSelection } from "@/data/mock-data";
import { PRODUCTS, SUBSCRIPTIONS_BY_COUNTRY, VOUCHERS } from "@/data/mock-data";

type SdkMode = "elements" | "dropin";

const CURRENCY_BY_COUNTRY: Record<Country, "GBP" | "JOD"> = {
  "United Kingdom": "GBP",
  Jordan: "JOD",
};

interface CheckoutData {
  operation: Operation | null;
  country: Country | null;
  selectedSubscriptionId: string | null;
  productSelections: ProductSelection[];
  sdkMode: SdkMode;
  selectedVoucherId: string | null;
}

const initialState: CheckoutData = {
  operation: "checkout",
  country: "United Kingdom",
  selectedSubscriptionId: null,
  productSelections: [],
  sdkMode: "dropin",
  selectedVoucherId: null,
};

interface CheckoutActions {
  setOperation: (operation: Operation) => void;
  setCountry: (country: Country) => void;
  setSelectedSubscriptionId: (subscriptionId: string) => void;
  setProductSelections: (selections: ProductSelection[]) => void;
  updateProductQuantity: (productId: string, delta: number) => void;
  setSdkMode: (mode: SdkMode) => void;
  setSelectedVoucherId: (voucherId: string | null) => void;
  reset: () => void;
  getCurrency: () => "GBP" | "JOD";
  getAmount: () => string;
  getDisplayAmount: () => string;
  getSubscriptionMonths: () => number | null;
}

type CheckoutState = CheckoutData & CheckoutActions;

const getDecimals = (country: Country | null) => (country === "Jordan" ? 3 : 2);

const formatAmount = (value: number, country: Country | null) =>
  value.toFixed(getDecimals(country));

const applyVoucher = (
  base: number,
  voucherId: string | null,
  decimals: number,
) => {
  if (!voucherId) return null;
  const voucher = VOUCHERS.find((v) => v.id === voucherId);
  if (!voucher) return null;
  const discounted =
    voucher.type === "percentage"
      ? base * (1 - voucher.discount / 100)
      : Math.max(0, base - voucher.discount);
  return discounted.toFixed(decimals);
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  ...initialState,
  setOperation: (operation) => set({ operation }),
  setCountry: (country) => set({ country }),
  setSelectedSubscriptionId: (subscriptionId) =>
    set({ selectedSubscriptionId: subscriptionId }),
  setProductSelections: (selections) => set({ productSelections: selections }),
  setSdkMode: (mode) => set({ sdkMode: mode }),
  setSelectedVoucherId: (voucherId) => set({ selectedVoucherId: voucherId }),
  updateProductQuantity: (productId, delta) =>
    set(({ productSelections }) => {
      const current = productSelections.find(
        (selection) => selection.productId === productId,
      );
      const nextQuantity = Math.max(0, (current?.quantity ?? 0) + delta);

      if (nextQuantity === 0) {
        return {
          productSelections: productSelections.filter(
            (selection) => selection.productId !== productId,
          ),
        };
      }

      return {
        productSelections: current
          ? productSelections.map((selection) =>
              selection.productId === productId
                ? { ...selection, quantity: nextQuantity }
                : selection,
            )
          : [...productSelections, { productId, quantity: nextQuantity }],
      };
    }),
  reset: () => set(initialState),
  getCurrency: () => {
    const { country } = get();
    return country ? CURRENCY_BY_COUNTRY[country] : "GBP";
  },
  getAmount: () => {
    const { operation, country, selectedSubscriptionId, productSelections } =
      get();
    if (!operation || !country) return "0.00";

    if (operation === "subscription") {
      const price =
        SUBSCRIPTIONS_BY_COUNTRY[country].find(
          (sub) => sub.id === selectedSubscriptionId,
        )?.price ?? 0;
      return formatAmount(price, country);
    }

    const total = productSelections.reduce((sum, { productId, quantity }) => {
      const price =
        PRODUCTS.find((p) => p.id === productId)?.price[country] ?? 0;
      return sum + price * quantity;
    }, 0);

    return formatAmount(total, country);
  },

  getDisplayAmount: () => {
    const { selectedVoucherId, country } = get();
    const amount = get().getAmount();
    return (
      applyVoucher(
        parseFloat(amount),
        selectedVoucherId,
        getDecimals(country),
      ) ?? amount
    );
  },

  getSubscriptionMonths: () => {
    const { operation, country, selectedSubscriptionId } = get();
    if (operation !== "subscription" || !country || !selectedSubscriptionId)
      return null;
    return (
      SUBSCRIPTIONS_BY_COUNTRY[country].find(
        (sub) => sub.id === selectedSubscriptionId,
      )?.period ?? null
    );
  },
}));
