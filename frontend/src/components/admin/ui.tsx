import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useApp } from '../../context/AppContext';

/*
 * Shared building blocks for every admin screen. Visual rules:
 * - one accent (gold) used for focus, the active item and primary links
 * - panels use rounded-xl, controls use rounded-md, nothing is rounded-full except counters
 * - z-index scale: z-10 sticky bars, z-40 page header, z-50 dialogs
 */

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-navy/90 dark:bg-gold dark:text-slate-950 dark:hover:bg-gold/90',
  secondary:
    'border border-slate-300 text-nearblack hover:bg-slate-50 dark:border-white/15 dark:text-gray-100 dark:hover:bg-white/5',
  danger:
    'border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10',
  ghost: 'text-mediumgrey hover:bg-slate-100 hover:text-nearblack dark:hover:bg-white/5 dark:hover:text-white'
};

// Class string for anything that should look like a button (links included).
export const buttonClass = (variant: ButtonVariant = 'secondary', size: 'sm' | 'md' = 'md', extra?: string) =>
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md font-semibold transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-card',
    'disabled:cursor-not-allowed disabled:opacity-50',
    size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
    buttonVariants[variant],
    extra
  );

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

const badgeTones = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-gray-300',
  success: 'bg-sage/10 text-sage dark:bg-sage/25 dark:text-emerald-200',
  warning: 'bg-gold/15 text-amber-800 dark:bg-gold/20 dark:text-gold'
};

// Small status label such as Published, Draft or Pending.
export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof badgeTones; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', badgeTones[tone])}>
      {children}
    </span>
  );
}

// White surface that groups one screen's content.
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-dark-card', className)}>
      {children}
    </section>
  );
}

// Title, one line of context, and an optional primary action for a panel.
export function PanelHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-serif text-xl font-semibold text-nearblack dark:text-white">{title}</h2>
        {description && <p className="mt-1 max-w-prose text-sm text-mediumgrey dark:text-gray-400">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

// An empty list always names one clear next step.
export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="max-w-sm text-sm text-mediumgrey dark:text-gray-400">{message}</p>
      {action}
    </div>
  );
}

// Ruled list used for every record list instead of repeated cards.
export function RecordList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-slate-200 dark:divide-white/10">{children}</ul>;
}

export const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-nearblack dark:border-white/15 dark:bg-dark-input dark:text-gray-100';

// Label above a form control, with optional helper text.
export function Field({
  label,
  hint,
  children,
  className
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="block text-sm font-semibold text-nearblack dark:text-gray-200">{label}</span>
      {children}
      {hint && <span className="block text-xs text-mediumgrey dark:text-gray-400">{hint}</span>}
    </label>
  );
}

// Accessible modal (focus trap, Escape, scroll lock) for forms and read-only details.
export function AdminDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-slate-200 bg-white text-nearblack dark:border-white/10 dark:bg-dark-card dark:text-gray-100',
            wide ? 'max-w-2xl' : 'max-w-lg'
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
            <div className="min-w-0">
              <Dialog.Title className="font-serif text-xl font-semibold">{title}</Dialog.Title>
              <Dialog.Description className={description ? 'mt-1 text-sm text-mediumgrey dark:text-gray-400' : 'sr-only'}>
                {description || title}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" aria-label="Close Dialog" className="shrink-0">
                <X className="size-4" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto overscroll-contain p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Confirmation required before anything destructive; wraps the button that starts the action.
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-dark-card">
          <AlertDialog.Title className="font-serif text-xl font-semibold text-nearblack dark:text-white">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-mediumgrey dark:text-gray-400">{description}</AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button>{cancelLabel}</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="danger" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

// Compact either/or filter such as All / Pending; exposes the active option to assistive tech.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-slate-300 p-0.5 dark:border-white/15">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'cursor-pointer rounded px-3 py-1 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
            value === option.id
              ? 'bg-navy text-white dark:bg-gold dark:text-slate-950'
              : 'text-mediumgrey hover:text-nearblack dark:hover:text-white'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Shows the latest save error next to the buttons that triggered it, inside the dialog.
export function FormError() {
  const { error } = useApp();
  if (!error) return null;
  return (
    <p role="alert" className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
      {error}
    </p>
  );
}

// On/off setting with a label and what it does; reads as a switch to assistive tech.
export function Switch({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-nearblack dark:text-gray-200">{label}</p>
        <p className="text-sm text-mediumgrey dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-card',
          checked ? 'bg-navy dark:bg-gold' : 'bg-slate-300 dark:bg-white/20'
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform duration-150 dark:bg-slate-950',
            checked && 'translate-x-5',
            checked && 'dark:bg-slate-950'
          )}
        />
      </button>
    </div>
  );
}
