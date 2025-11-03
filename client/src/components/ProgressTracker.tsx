import { CheckCircle2, Circle, Clock } from "lucide-react";

export type ProgressStep = {
  number: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
};

type ProgressTrackerProps = {
  steps: ProgressStep[];
  currentStep: number;
};

export function ProgressTracker({ steps, currentStep }: ProgressTrackerProps) {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-6">
        {/* Desktop Progress */}
        <div className="hidden md:flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    currentStep > step.number
                      ? "bg-green-500 text-white shadow-lg"
                      : currentStep === step.number
                      ? "bg-[#0033A0] text-white shadow-lg ring-4 ring-[#0033A0]/20"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : currentStep === step.number ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>

                {/* Step Title */}
                <span
                  className={`text-sm font-semibold mt-2 transition-colors ${
                    currentStep >= step.number
                      ? "text-[#0033A0]"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>

                {/* Step Description */}
                <span className="text-xs text-gray-500 mt-1 text-center max-w-[120px]">
                  {step.description}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Progress */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0033A0]">
                Step {currentStep} of {steps.length}
              </h3>
              <p className="text-sm text-gray-600">
                {steps.find((s) => s.number === currentStep)?.title}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#0033A0]">
                {Math.round((currentStep / steps.length) * 100)}%
              </span>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#0033A0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>

          {/* Mobile Step List */}
          <div className="mt-4 space-y-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center gap-3 p-2 rounded ${
                  currentStep === step.number
                    ? "bg-[#0033A0]/5 border-l-4 border-[#0033A0]"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep > step.number
                      ? "bg-green-500 text-white"
                      : currentStep === step.number
                      ? "bg-[#0033A0] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      currentStep >= step.number
                        ? "text-[#0033A0]"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
