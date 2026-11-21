import { useId } from "react";
import { ChevronDownIcon } from "@/components/icons";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export function SelectField({ label, name, value, options, onChange }: SelectFieldProps) {
  const id = useId();

  return (
    <div className="relative rounded-[8px] border border-[#E0E0E0] bg-white px-3.5 pb-2 pt-1.5 transition-colors focus-within:border-[#666CFF]">
      <label htmlFor={id} className="block text-[12px] leading-4 text-[#A3A3A3]">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none bg-transparent pr-7 text-[15px] leading-6 text-[#4f4f4f] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8d8d8d]" />
    </div>
  );
}
