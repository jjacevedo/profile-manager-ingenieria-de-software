const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-sky-200 bg-sky-50 text-sky-700"
};

export default function Alert({ children, tone = "info" }) {
  return <div className={`rounded-md border px-3 py-2 text-sm ${toneClasses[tone] || toneClasses.info}`}>{children}</div>;
}
