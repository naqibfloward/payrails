import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Operation" },
  { number: 2, label: "Country" },
  { number: 3, label: "Items Selection" },
  { number: 4, label: "Payment" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, index) => (
        <div
          key={step.number}
          className="flex items-center flex-1 last:flex-none"
        >
          <div className="flex flex-col items-center gap-1 w-16 shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                currentStep > step.number
                  ? "bg-primary text-primary-foreground"
                  : currentStep === step.number
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {currentStep > step.number ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium text-center hidden sm:block w-full",
                currentStep === step.number
                  ? "text-primary"
                  : currentStep > step.number
                    ? "text-primary/70"
                    : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2 mb-4 transition-colors",
                currentStep > step.number ? "bg-primary" : "bg-border",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};
