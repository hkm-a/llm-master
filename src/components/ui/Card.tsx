import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "outline";
  children: ReactNode;
}

const variantStyles = {
  default: "bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700",
  hover: "bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 card-hover",
  outline: "border-2 border-secondary-300 dark:border-secondary-600",
};

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 shadow-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-2", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold dark:text-secondary-100", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-secondary-600 dark:text-secondary-400", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}