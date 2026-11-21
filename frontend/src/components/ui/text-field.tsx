import { useId, type ReactNode } from "react";

type TextFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  trailing?: ReactNode;
};

export function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  trailing,
}: TextFieldProps) {
  const id = useId();

  return (
    <div className="relative rounded-[8px] border border-[#E0E0E0] bg-white px-3.5 pb-2 pt-1.5 transition-colors focus-within:border-[#666CFF]">
      <label htmlFor={id} className="block text-[12px] leading-4 text-[#A3A3A3]">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent pr-7 text-[15px] leading-6 text-[#4f4f4f] outline-none"
      />
      {trailing ? (
        <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>
      ) : null}
    </div>
  );
}
