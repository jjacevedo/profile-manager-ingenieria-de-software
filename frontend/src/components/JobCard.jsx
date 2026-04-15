import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { Card, CardDescription, CardTitle } from "./ui/Card";

export default function JobCard({ recommendation, onApply, isApplied = false }) {
  const { job, score, reason } = recommendation;
  const scoreTone = score >= 75 ? "text-emerald-700" : score >= 45 ? "text-amber-700" : "text-rose-700";

  return (
    <Card className="h-full">
      <article className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription className="mt-1">
              {job.company} - {job.location}
            </CardDescription>
          </div>
          <Badge variant="highlight">Match {score}%</Badge>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{job.description}</p>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className={`text-sm font-medium ${scoreTone}`}>Compatibilidad estimada: {score}%</p>
          <p className="mt-1 text-xs text-slate-600">{reason}</p>
        </div>

        <Button
          type="button"
          className="mt-auto"
          onClick={() => onApply(job.id)}
          disabled={isApplied}
          variant={isApplied ? "secondary" : "primary"}
        >
          {isApplied ? "Postulado" : "Postular manualmente"}
        </Button>
      </article>
    </Card>
  );
}
