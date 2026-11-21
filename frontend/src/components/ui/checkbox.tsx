import { useId } from "react";

type CheckboxProps = {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Checkbox({ label, name, checked, onChange }: CheckboxProps) {
  const id = useId();

  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-[#5f5f5f]">
      <span className="relative inline-flex size-[18px]">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-[18px] cursor-pointer appearance-none rounded-[3px] border border-[#C8C8C8] bg-white checked:border-[#666CFF] checked:bg-[#666CFF]"
        />
        <svg
          viewBox="0 0 16 16"
          className="pointer-events-none absolute inset-0 hidden size-[18px] text-white peer-checked:block"
          aria-hidden="true"
        >
          <path
            d="M3.5 8.2 6.4 11l6.1-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label}
    </label>
  );
}
