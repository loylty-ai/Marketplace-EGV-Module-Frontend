import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function SelectBox({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  className = "",
  label,
  error,
  required = false,
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <Select
        value={value ?? undefined}
        onValueChange={onChange}   // 👈 IMPORTANT: pass directly
        disabled={disabled}
      >
        <SelectTrigger
          className={`
            flex h-9 w-full items-center justify-between
            rounded-md border bg-white px-3 py-2 text-sm shadow-sm
            focus:outline-none
            ${
              error
                ? "border-red-500"
                : "border-neutral-300 focus:border-emerald-500"
            }
          `}
        >
          <SelectValue placeholder={placeholder} />
         
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={String(opt.value)}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
}   