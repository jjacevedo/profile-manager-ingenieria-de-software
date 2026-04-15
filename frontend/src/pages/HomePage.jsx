import { useEffect, useState } from "react";

import { api } from "../api/client";
import Badge from "../components/ui/Badge";
import { Card, CardDescription, CardTitle } from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import { LoadingState, SectionHeader } from "../components/ui/StateBlocks";

export default function HomePage({ userId, refreshToken }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api.getHome(userId);
        if (active) {
          setSummary(data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [userId, refreshToken]);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!summary) return <LoadingState title="Preparando dashboard..." />;

  const stats = [
    { label: "Postulaciones", value: summary.total_postulaciones },
    { label: "Progreso", value: `${summary.progreso_porcentaje}%` },
    { label: "En revisión", value: summary.por_estado["En revisión"] || 0 }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Resumen de actividad"
        description="Visualiza tu estado actual y enfócate en las mejores oportunidades."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardDescription>{item.label}</CardDescription>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardTitle>Estado de postulaciones</CardTitle>
          <CardDescription className="mt-1">Distribución por etapa del proceso.</CardDescription>
          <div className="mt-4 space-y-2">
            {Object.entries(summary.por_estado).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">{status}</span>
                <Badge>{count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Recomendaciones destacadas</CardTitle>
          <CardDescription className="mt-1">Top oportunidades según tu perfil actual.</CardDescription>
          <div className="mt-4 space-y-3">
            {summary.recomendaciones_destacadas.length === 0 ? (
              <p className="text-sm text-slate-500">No hay recomendaciones todavía.</p>
            ) : (
              summary.recomendaciones_destacadas.map((item) => (
                <article key={item.job.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.job.title}</h4>
                      <p className="text-sm text-slate-500">
                        {item.job.company} - {item.job.location}
                      </p>
                    </div>
                    <Badge variant="highlight">{item.score}%</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.reason}</p>
                </article>
              ))
            )}
          </div>
        </Card>
      </section>

      <Card>
        <CardTitle>Tu progreso</CardTitle>
        <CardDescription className="mt-1">Indicador general basado en avance de estados.</CardDescription>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${summary.progreso_porcentaje}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{summary.progreso_porcentaje}% completado</p>
      </Card>
    </div>
  );
}
