const variants = {
  primary:
    "bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 focus-visible:ring-sky-200 disabled:bg-slate-300 disabled:text-slate-500",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-sky-200 disabled:text-slate-400 disabled:border-slate-200",
  ghost:
    "bg-transparent text-slate-600 hover:bg-sky-50 active:bg-sky-100 focus-visible:ring-sky-200 disabled:text-slate-400"
};

const sizes = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-sm"
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  ...props
}) {
  const style = `${variants[variant] || variants.primary} ${sizes[size] || sizes.md}`;
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 ${style} ${className}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  );
}
