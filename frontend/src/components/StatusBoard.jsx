import { Card, CardDescription, CardTitle } from "./ui/Card";
import { Label, Select } from "./ui/FormField";
import { EmptyState } from "./ui/StateBlocks";

const statusOptions = ["Postulado", "En revisión", "Entrevista", "Rechazado"];

export default function StatusBoard({ applications, jobsById, onStatusChange }) {
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
        return (
          <Card key={application.id}>
            <article className="space-y-3">
              <div>
                <CardTitle>{job ? job.title : "Vacante"}</CardTitle>
                <CardDescription className="mt-1">{job ? `${job.company} - ${job.location}` : "Sin detalle"}</CardDescription>
              </div>

              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <span className="text-slate-500">Fuente</span>
                <span className="font-medium text-slate-700 capitalize">{application.source}</span>
              </div>

              <div>
                <Label htmlFor={`status-${application.id}`}>Estado del proceso</Label>
                <Select
                  id={`status-${application.id}`}
                  value={application.status}
                  onChange={(event) => onStatusChange(application.id, event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            </article>
          </Card>
        );
      })}
    </div>
  );
}
