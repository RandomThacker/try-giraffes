"use client";

import { useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { NavIcon } from "@/components/dashboard/nav-icons";

type OutlinedInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
  readOnly?: boolean;
  className?: string;
  type?: string;
  placeholder?: string;
};

export function OutlinedInput({
  label,
  value,
  onChange,
  trailing,
  readOnly,
  className = "",
  type = "text",
  placeholder,
}: OutlinedInputProps) {
  const id = useId();
  return (
    <div className={`relative rounded-[10px] border border-[#E0E0E0] bg-app-surface px-3.5 pb-2.5 pt-2 ${className}`}>
      <label htmlFor={id} className="absolute -top-2 left-3 bg-app-surface px-1 text-[12px] text-app-faint">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent pt-1 text-[14px] text-app-fg outline-none"
        />
        {trailing}
      </div>
    </div>
  );
}

type OutlinedSelectProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function OutlinedSelect({
  label,
  value,
  options,
  onChange,
  open,
  onOpenChange,
  className = "",
}: OutlinedSelectProps) {
  const id = useId();
  const isOpen = Boolean(open);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        onClick={() => onOpenChange?.(!isOpen)}
        className="relative flex w-full items-center justify-between rounded-[10px] border border-[#E0E0E0] bg-app-surface px-3.5 py-3 text-left"
      >
        <span className="absolute -top-2 left-3 bg-app-surface px-1 text-[12px] text-app-faint">{label}</span>
        <span className="pt-1 text-[14px] text-app-fg">{value}</span>
        <NavIcon name="chevron" className={`size-4 text-app-faint transition ${isOpen ? "-rotate-90" : "rotate-90"}`} />
      </button>
      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[12px] border border-app-border bg-app-surface py-2 shadow-[0_12px_30px_rgba(40,45,80,0.12)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                onOpenChange?.(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-[14px] ${
                option === value ? "bg-[#F3F4F8] text-app-fg" : "text-[#4F4F5F] hover:bg-app-muted-bg"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type OutlinedTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

export function OutlinedTextarea({
  label,
  value,
  onChange,
  rows = 4,
  className = "",
  placeholder,
  ...props
}: OutlinedTextareaProps) {
  const id = useId();
  return (
    <div className={`relative rounded-[10px] border border-[#E0E0E0] bg-app-surface px-3.5 pb-2.5 pt-3 ${className}`}>
      <label htmlFor={id} className="absolute -top-2 left-3 bg-app-surface px-1 text-[12px] text-app-faint">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none bg-transparent text-[14px] leading-6 text-app-fg outline-none placeholder:text-app-faint"
        {...props}
      />
    </div>
  );
}

export type ChipOption = {
  id: string;
  label: string;
  type: "user" | "group";
};

type ChipFieldProps = {
  label: string;
  values: ChipOption[];
  options: ChipOption[];
  onChange: (values: ChipOption[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ChipSelectField({ label, values, options, onChange, open, onOpenChange }: ChipFieldProps) {
  const isOpen = Boolean(open);

  function keyOf(option: ChipOption) {
    return `${option.type}:${option.id}`;
  }

  function toggle(option: ChipOption) {
    const exists = values.some((item) => keyOf(item) === keyOf(option));
    if (exists) {
      onChange(values.filter((item) => keyOf(item) !== keyOf(option)));
      return;
    }
    onChange([...values, option]);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange?.(!isOpen)}
        className="relative flex min-h-[54px] w-full items-center justify-between gap-3 rounded-[10px] border border-[#E0E0E0] bg-app-surface px-3.5 py-2.5 text-left"
      >
        <span className="absolute -top-2 left-3 bg-app-surface px-1 text-[12px] text-app-faint">{label}</span>
        <div className="flex flex-1 flex-wrap gap-2 pt-1">
          {values.map((value) => (
            <span
              key={keyOf(value)}
              className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FF] px-2.5 py-1 text-[12px] font-medium text-brand"
            >
              {value.label}
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(values.filter((item) => keyOf(item) !== keyOf(value)));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange(values.filter((item) => keyOf(item) !== keyOf(value)));
                  }
                }}
                className="inline-flex size-4 items-center justify-center rounded-full bg-white/70 text-brand"
              >
                ×
              </span>
            </span>
          ))}
        </div>
        <NavIcon name="chevron" className={`size-4 text-app-faint ${isOpen ? "-rotate-90" : "rotate-90"}`} />
      </button>
      {isOpen ? (
        <div className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-[12px] border border-app-border bg-app-surface py-2 shadow-[0_12px_30px_rgba(40,45,80,0.12)]">
          {options.map((option) => {
            const checked = values.some((item) => keyOf(item) === keyOf(option));
            return (
              <button
                key={keyOf(option)}
                type="button"
                onClick={() => toggle(option)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] ${
                  checked ? "bg-[#F3F4F8] text-app-fg" : "text-[#4F4F5F] hover:bg-app-muted-bg"
                }`}
              >
                <span
                  className={`inline-flex size-4 items-center justify-center rounded-[4px] border ${
                    checked ? "border-brand bg-brand text-white" : "border-[#C8C8D0]"
                  }`}
                >
                  {checked ? "✓" : null}
                </span>
                <span className="flex-1">{option.label}</span>
                <span className="text-[11px] uppercase tracking-[0.06em] text-app-faint">{option.type}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
