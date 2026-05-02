import React from "react";

interface StepProps {
  step: number;
  title: string;
  description: string;
  image: string;
  isAlternate?: boolean;
}

const HowItWorksStep: React.FC<StepProps> = ({
  step,
  title,
  description,
  image,
  isAlternate = false,
}) => {
  const stepNumber = String(step).padStart(2, "0");

  return (
    <div className="py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Text */}
        <div className={isAlternate ? "lg:order-last" : ""}>
          <div className="space-y-4">
            {/* Step Number */}
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded border"
              style={{
                backgroundColor: "var(--tool-bg)",
                borderColor: "var(--tool-muted)",
                color: "var(--tool-accent)",
              }}
            >
              <span className="text-sm font-medium">{stepNumber}</span>
            </div>

            {/* Title */}
            <h3
              className="text-3xl font-medium leading-tight"
              style={{ color: "var(--tool-text)" }}
            >
              {title}
            </h3>

            {/* Description */}
            <p
              className="text-lg leading-relaxed max-w-md"
              style={{ color: "var(--tool-muted)" }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Visual */}
        <div
          className={`flex items-center justify-center rounded border p-6 ${
            isAlternate ? "lg:order-first" : ""
          }`}
          style={{
            backgroundColor: "var(--tool-bg)",
            borderColor: "var(--tool-muted)",
          }}
        >
          <div className="w-full max-w-xl flex items-center justify-center">
            <img
              src={image}
              alt={`${title} step preview`}
              className="w-full h-auto object-contain opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface HowItWorksProps {
  title?: string;
  description?: string;
}

export const UserFlow: React.FC<HowItWorksProps> = ({
  title = "How It Works",
  description = "Follow these four simple steps to understand the complete workflow",
}) => {
  const steps = [
    {
      title: "Create",
      description:
        "Define individual steps and what each one is responsible for.",
      image: "./create.png",
    },
    {
      title: "Connect",
      description:
        "Describe how steps depend on each other and which can run in parallel.",
      image: "./connect.png",
    },
    {
      title: "Analyse",
      description:
        "Validate the workflow to understand execution order and unreachable steps.",
      image: "./analyse.png",
    },
    {
      title: "Execute",
      description:
        "Run the workflow locally with clear feedback and predictable behavior.",
      image: "./execute.png",
    },
  ];

  return (
    <section
      className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20 max-w-6xl mx-auto"
      style={{
        backgroundColor: "var(--tool-bg)",
        color: "var(--tool-text)",
      }}
    >
      {/* Header */}
      <div className="mb-12 lg:mb-16 space-y-4">
        <h2
          className="text-4xl sm:text-5xl font-medium leading-tight text-balance"
          style={{ color: "var(--tool-text)" }}
        >
          {title}
        </h2>
        <p
          className="text-lg leading-relaxed max-w-2xl"
          style={{ color: "var(--tool-muted)" }}
        >
          {description}
        </p>
      </div>

      {/* Steps */}
      <div>
        {steps.map((step, index) => (
          <div key={index}>
            <HowItWorksStep
              step={index + 1}
              title={step.title}
              description={step.description}
              image={step.image}
              isAlternate={index % 2 === 1}
            />

            {index < steps.length - 1 && (
              <div
                className="border-t"
                style={{ borderColor: "var(--tool-muted)" }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserFlow;