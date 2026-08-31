import React from "react";

const Input = React.forwardRef(
  ({ className = "", type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`
          w-full
          rounded-lg
          border border-gray-300
          bg-white
          px-4
          py-2
          text-gray-900
          placeholder:text-gray-400
          outline-none
          transition-all
          focus:border-orange-500
          focus:ring-2
          focus:ring-orange-500/20
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;