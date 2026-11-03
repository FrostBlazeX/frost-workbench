import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const base = [
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium",
  "transition-colors duration-150 ease-snappy",
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
  "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress",
  "[&_svg]:size-4 [&_svg]:shrink-0",
].join(" ");

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

// Record<ButtonVariant, string> makes TypeScript check every variant has a class string, and no extras.
const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "border border-line bg-surface text-fg hover:bg-surface-muted",
  ghost: "text-fg hover:bg-surface-muted",
  danger: "bg-danger text-danger-fg hover:bg-danger-hover",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-10",
};

export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render the single child element (e.g. a link) with button styles instead of a `<button>`. */ asChild?: boolean;
  /** Show a spinner, mark the button busy and block clicks. */
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  loading = false,
  disabled,
  type,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      // A bare <button> inside a <form> defaults to "submit"; default to "button" to avoid surprises.
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
