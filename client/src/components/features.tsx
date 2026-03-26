import { cn } from "./lib/utils";
import {
  IconTerminal2,
  IconRouteAltLeft,
  IconAdjustmentsBolt,
  IconPlayerPlay,
  IconGitBranch,
  IconFileExport,
  IconAlertTriangle,
  IconEye,
} from "@tabler/icons-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Step-based workflow definition",
      description:
        "Define executable steps using simple commands and working directories. No YAML or pipeline DSLs required.",
      icon: <IconTerminal2 size={22} />,
    },
    {
      title: "Explicit dependency rules",
      description:
        "Describe execution constraints between steps to control order and parallelism with intention.",
      icon: <IconRouteAltLeft size={22} />,
    },
    {
      title: "Workflow validation",
      description:
        "Detect circular rules, unreachable steps, and invalid execution paths before running anything.",
      icon: <IconAlertTriangle size={22} />,
    },
    {
      title: "Execution planning",
      description:
        "Preview the resolved execution order and parallel groups to understand what will run and why.",
      icon: <IconEye size={22} />,
    },
    {
      title: "Local workflow execution",
      description:
        "Execute workflows locally with predictable behavior and controlled parallelism.",
      icon: <IconPlayerPlay size={22} />,
    },
    {
      title: "Failure isolation",
      description:
        "Failed steps block only their dependents. Independent branches continue executing safely.",
      icon: <IconGitBranch size={22} />,
    },
    {
      title: "YAML export & portability",
      description:
        "Export workflows as YAML for sharing, versioning, or inspection outside the UI.",
      icon: <IconFileExport size={22} />,
    },
    {
      title: "Intention-driven UX",
      description:
        "Users interact with steps and goals, not graphs. Graph logic remains an internal detail.",
      icon: <IconAdjustmentsBolt size={22} />,
    },
  ];

  return (
    <section
      className="relative z-10 min-h-screen flex flex-col justify-center"
      style={{ backgroundColor: "var(--tool-bg)" }}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
        <h2
          className="text-4xl sm:text-5xl font-medium leading-tight mb-4"
          style={{ color: "var(--tool-text)" }}
        >
          What Orchestra provides
        </h2>
        <p
          className="text-lg max-w-2xl"
          style={{ color: "var(--tool-muted)" }}
        >
          A focused set of tools for defining, validating, and executing workflows
          with clarity and correctness.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto px-6 lg:px-8">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col py-12 relative group/feature",
        "border-neutral-700",
        "lg:border-r",
        (index === 0 || index === 4) && "lg:border-l",
        index < 4 && "lg:border-b"
      )}
      style={{ borderColor: "var(--tool-muted)" }}
    >
      {/* Hover background (kept, colors adjusted) */}
      {index < 4 && (
        <div
          className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(225,244,243,0.06), transparent)",
          }}
        />
      )}
      {index >= 4 && (
        <div
          className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(225,244,243,0.06), transparent)",
          }}
        />
      )}

      {/* Icon */}
      <div
        className="mb-6 relative z-10 px-8"
        style={{ color: "var(--tool-muted)" }}
      >
        {icon}
      </div>

      {/* Title */}
      <div className="text-lg font-medium mb-3 relative z-10 px-8">
        <div
          className="absolute left-0 inset-y-0 w-1 rounded-tr-full rounded-br-full transition-all duration-200"
          style={{
            backgroundColor: "var(--tool-muted)",
          }}
        />
        <span
          className="inline-block transition duration-200 group-hover/feature:translate-x-2"
          style={{ color: "var(--tool-text)" }}
        >
          {title}
        </span>
      </div>

      {/* Description */}
      <p
        className="text-sm leading-relaxed max-w-xs relative z-10 px-8"
        style={{ color: "var(--tool-muted)" }}
      >
        {description}
      </p>
    </div>
  );
};