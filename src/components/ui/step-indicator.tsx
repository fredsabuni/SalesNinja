/**
 * StepIndicator component for multi-step forms
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    {
                      'border-primary-500 bg-primary-500 text-white': isActive || isCompleted,
                      'border-neutral-300 bg-white text-neutral-400': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Title */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center',
                    {
                      'text-primary-600': isActive || isCompleted,
                      'text-neutral-400': isUpcoming,
                    }
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    {
                      'bg-primary-500': stepNumber < currentStep,
                      'bg-neutral-200': stepNumber >= currentStep,
                    }
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export { StepIndicator };