import React from "react";

export const ToggleSwitch = React.forwardRef(
  (
    {
      checked,
      onChange,
      className = "",
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => {
          if (disabled) return;
          if (onChange) onChange(!checked);
        }}
        className={`transition-colors focus:outline-none inline-flex items-center ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children ? (
          children
        ) : (
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        )}
      </button>
    );
  }
);

ToggleSwitch.displayName = "ToggleSwitch";