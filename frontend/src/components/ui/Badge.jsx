export default function Badge({ children, variant = "default" }) {
  const classes =
    variant === "highlight"
      ? "bg-sky-100 text-sky-700 border-sky-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}>{children}</span>;
}
