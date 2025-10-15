"use client";
import clsx from "clsx";
import { PropsWithChildren, ButtonHTMLAttributes } from "react";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"ghost"; size?: "sm"|"md"; isLoading?: boolean; };
const base="rounded-2xl px-4 h-10 shadow-card transition active:scale-[.99]";
const variants={ primary:"bg-primary/90 hover:bg-primary text-white", ghost:"bg-white/10 hover:bg-white/20 text-white" } as const;
const sizes={ sm:"h-9 text-sm", md:"h-10 text-base" } as const;
export function Button({ variant="primary", size="md", isLoading=false, className, children, ...rest }: PropsWithChildren<ButtonProps>){
  return <button className={clsx(base, variants[variant], sizes[size], className)} disabled={isLoading||rest.disabled} aria-busy={isLoading?"true":"false"} aria-disabled={isLoading||!!rest.disabled?"true":"false"} {...rest}>{isLoading?"…":children}</button>;
}
