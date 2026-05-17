import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: string;
}

const sizeClasses = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading,
      icon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low",
      ghost: "text-on-surface-variant hover:bg-surface-container-high hover:text-primary",
      danger: "bg-error text-on-error hover:opacity-90 rounded-xl px-6 py-2.5",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
        ) : icon ? (
          <span className="material-symbols-outlined text-lg">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
