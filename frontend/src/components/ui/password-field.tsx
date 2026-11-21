"use client";

import { useState } from "react";
import { EyeIcon } from "@/components/icons";
import { TextField } from "@/components/ui/text-field";
import { Tooltip } from "@/components/ui/tooltip";

type PasswordFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
};

export function PasswordField({ label, name, value, onChange, autoComplete }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      trailing={
        <Tooltip label={visible ? `Hide ${label}` : `Show ${label}`}>
          <button
            type="button"
            className="cursor-pointer text-[#9a9a9a] hover:text-[#666CFF]"
            aria-label={visible ? `Hide ${label}` : `Show ${label}`}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            <EyeIcon className="size-[18px]" off={visible} />
          </button>
        </Tooltip>
      }
    />
  );
}
