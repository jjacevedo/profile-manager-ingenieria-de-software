import { Card } from "./Card";

export function EmptyState({ title, description }) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </Card>
  );
}

export function LoadingState({ title = "Cargando información..." }) {
  return (
    <Card className="animate-pulse">
      <div className="h-4 w-1/3 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-11/12 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-8/12 rounded bg-slate-100" />
      <p className="mt-3 text-xs text-slate-500">{title}</p>
    </Card>
  );
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
