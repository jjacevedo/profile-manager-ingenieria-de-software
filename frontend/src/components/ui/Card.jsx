export function Card({ className = "", children }) {
  return <div className={`rounded-md border border-slate-200 bg-white p-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h3 className={`text-base font-semibold text-slate-900 ${className}`}>{children}</h3>;
}

export function CardDescription({ className = "", children }) {
  return <p className={`text-sm text-slate-600 ${className}`}>{children}</p>;
}
