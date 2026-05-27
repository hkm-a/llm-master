import React, { type ReactElement } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  asChild?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const variantStyles = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  secondary: "bg-secondary-200 text-secondary-900 hover:bg-secondary-300",
  ghost: "bg-transparent hover:bg-secondary-100",
  outline: "border border-secondary-300 hover:bg-secondary-50",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  asChild = false,
  ...props
}: ButtonProps) {
  const baseClassName = cn(
    "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as ReactElement, {
      className: cn(children.props.className, baseClassName),
      ...props,
    });
  }

  return (
    <button className={baseClassName} {...props}>
      {children}
    </button>
  );
}