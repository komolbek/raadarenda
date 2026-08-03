'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-muted-foreground">{leftIcon}</span>
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-xl border border-input bg-card px-4 py-2 text-base transition-all duration-200',
              'placeholder:text-muted-foreground/70',
              'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12 focus:shadow-[0_2px_12px_-4px_rgba(242,86,41,0.25)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-muted-foreground">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-destructive">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
