import { Card, CardDescription, CardTitle } from "./ui/Card";
import { EmptyState } from "./ui/StateBlocks";
import Badge from "./ui/Badge";

function statusTone(status) {
  if (status === "Postulado") return "bg-slate-100 text-slate-700 border-slate-200";
  if (status === "En revisión") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "Entrevista") return "bg-sky-100 text-sky-700 border-sky-200";
  if (status === "Rechazado") return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function StatusBoard({ applications, jobsById }) {
  if (applications.length === 0) {
    return (
      <EmptyState
        title="Sin postulaciones por ahora"
        description="Inicia en la sección de postulaciones para aplicar y comenzar el seguimiento."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {applications.map((application) => {
        const job = jobsById[application.job_id];
        const current = application.simulated_status || application.status;
        const history = application.simulated_history || [];
        return (
          <Card key={application.id}>
            <article className="space-y-3">
              <div>
                <CardTitle>{job ? job.title : "Vacante"}</CardTitle>
                <CardDescription className="mt-1">{job ? `${job.company} - ${job.location}` : "Sin detalle"}</CardDescription>
              </div>

              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <span className="text-slate-500">Fuente</span>
                <span className="font-medium text-slate-700">Actualización automática (simulada)</span>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Estado actual</p>
                <div className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(current)}`}>
                  {current}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Última actualización: {new Date(application.simulated_last_updated_at || application.updated_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Timeline compacta</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Postulado", "En revisión", "Entrevista", "Rechazado"].map((step) => (
                    <Badge key={step} variant={step === current ? "highlight" : "default"}>
                      {step}
                    </Badge>
                  ))}
                </div>
              </div>

              <details className="rounded-md border border-slate-200 bg-white p-2">
                <summary className="cursor-pointer text-xs font-medium text-slate-700">Ver detalle del historial</summary>
                <div className="mt-2 space-y-2">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin transiciones registradas aún.</p>
                  ) : (
                    history.slice(0, 8).map((event, index) => (
                      <div key={`${event.timestamp}-${index}`} className="rounded border border-slate-100 bg-slate-50 px-2 py-1.5">
                        <p className="text-xs text-slate-700">
                          {event.from ? `${event.from} -> ${event.to}` : event.to}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(event.timestamp).toLocaleString()} · {event.source}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </details>
            </article>
          </Card>
        );
      })}
    </div>
  );
}
