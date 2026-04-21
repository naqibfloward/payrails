import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { StepIndicator } from "@/components/checkout/step-indicator";
import { Card, CardContent } from "@/components/ui/card";
import { OperationPage } from "@/pages/operation";
import { CountryPage } from "@/pages/country";
import { ItemsPage } from "@/pages/items";
import { PaymentPage } from "@/pages/payment";
import { SuccessPage } from "@/pages/success";
import { ErrorPage } from "@/pages/error";

const STEP_MAP: Record<string, number> = {
  "/": 1,
  "/country": 2,
  "/items": 3,
  "/payment": 4,
  "/success": 5,
  "/error": 5,
};

const RouteStepIndicator = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const step = STEP_MAP[pathname] ?? 1;
  return <StepIndicator currentStep={step} />;
};

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-16 space-y-6 gap-4 flex flex-col">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Payrails Integration
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your transaction in a few easy steps
          </p>
        </div>
        <RouteStepIndicator />
        <Card className="shadow-sm border-border">
          <CardContent className="p-6 sm:p-8">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: OperationPage,
});

const countryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/country",
  component: CountryPage,
});

const itemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/items",
  component: ItemsPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment",
  component: PaymentPage,
});

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/success",
  component: SuccessPage,
});

const errorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/error",
  component: ErrorPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  countryRoute,
  itemsRoute,
  paymentRoute,
  successRoute,
  errorRoute,
]);

export const router = createRouter({ routeTree });
