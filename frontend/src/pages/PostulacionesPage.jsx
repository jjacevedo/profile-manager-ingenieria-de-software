import { useEffect, useState } from "react";

import { api } from "../api/client";
import JobCard from "../components/JobCard";
import Button from "../components/ui/Button";
import { Card, CardDescription, CardTitle } from "../components/ui/Card";
import { Input, Label } from "../components/ui/FormField";
import Alert from "../components/ui/Alert";
import { EmptyState, LoadingState, SectionHeader } from "../components/ui/StateBlocks";

const defaultConfig = {
  enabled: false,
  min_postulations: 1,
  max_postulations: 3,
  frequency: "daily",
  keyword: "",
  location_filter: ""
};

export default function PostulacionesPage({ userId, onEvent, initialNotice = "", onNoticeConsumed }) {
  const [recommendations, setRecommendations] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [assistedLoading, setAssistedLoading] = useState(false);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [recs, automationConfig, applications] = await Promise.all([
        api.getRecommendations(userId),
        api.getAutomationConfig(userId),
        api.getApplications(userId)
      ]);
      setRecommendations(recs);
      setConfig(automationConfig);
      setAppliedJobIds(applications.map((app) => app.job_id));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    if (!initialNotice) return;
    setMessage(initialNotice);
    if (onNoticeConsumed) onNoticeConsumed();
  }, [initialNotice, onNoticeConsumed]);

  async function handleManualApply(jobId) {
    try {
      await api.manualApply({ user_id: userId, job_id: jobId });
      setMessage("Postulación manual registrada.");
      setAppliedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
      setError("");
      onEvent();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAssistedApply() {
    setAssistedLoading(true);
    try {
      const created = await api.assistedApply({ user_id: userId, limit: 2 });
      setMessage(`Postulación asistida completada: ${created.length} creada(s).`);
      setError("");
      onEvent();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssistedLoading(false);
    }
  }

  async function handleSaveConfig(event) {
    event.preventDefault();
    try {
      const updated = await api.updateAutomationConfig(userId, {
        enabled: Boolean(config.enabled),
        min_postulations: Number(config.min_postulations),
        max_postulations: Number(config.max_postulations),
        frequency: config.frequency,
        keyword: config.keyword,
        location_filter: config.location_filter
      });
      setConfig(updated);
      setMessage("Configuración automática guardada.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRunAutomation() {
    setAutomationLoading(true);
    try {
      const created = await api.runAutomation(userId);
      setMessage(`Automatización ejecutada: ${created.length} postulación(es) nueva(s).`);
      setError("");
      onEvent();
    } catch (err) {
      setError(err.message);
    } finally {
      setAutomationLoading(false);
    }
  }

  if (loading) return <LoadingState title="Cargando postulaciones..." />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gestión de postulaciones"
        description="Aplica de forma manual, asistida o automática según tu estrategia de búsqueda."
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription className="mt-1">Optimiza tu tiempo con funciones automáticas.</CardDescription>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" onClick={handleAssistedApply} isLoading={assistedLoading}>
              Postulación asistida
            </Button>
            <Button type="button" variant="secondary" onClick={handleRunAutomation} isLoading={automationLoading}>
              Ejecutar automática
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>Estado del módulo</CardTitle>
          <CardDescription className="mt-1">Validación rápida del flujo actual.</CardDescription>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Vacantes sugeridas: {recommendations.length}</p>
            <p>Automatización: {config.enabled ? "Activa" : "Inactiva"}</p>
            <p>Frecuencia: {config.frequency || "daily"}</p>
          </div>
        </Card>
      </section>

      <form className="space-y-4 rounded-md border border-slate-200 bg-white p-4" onSubmit={handleSaveConfig}>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Configuración de postulación automática</h3>
          <p className="mt-1 text-sm text-slate-600">Define límites y filtros para que el sistema aplique por ti.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 bg-white"
            checked={Boolean(config.enabled)}
            onChange={(event) => setConfig({ ...config, enabled: event.target.checked })}
          />
          Activar automatización
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Mínimo diario</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={config.min_postulations}
              onChange={(event) => setConfig({ ...config, min_postulations: event.target.value })}
            />
          </div>
          <div>
            <Label>Máximo diario</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={config.max_postulations}
              onChange={(event) => setConfig({ ...config, max_postulations: event.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label>Frecuencia</Label>
            <Input value={config.frequency} onChange={(event) => setConfig({ ...config, frequency: event.target.value })} />
          </div>
          <div>
            <Label>Palabra clave</Label>
            <Input value={config.keyword} onChange={(event) => setConfig({ ...config, keyword: event.target.value })} />
          </div>
          <div>
            <Label>Filtro de ubicación</Label>
            <Input
              value={config.location_filter}
              onChange={(event) => setConfig({ ...config, location_filter: event.target.value })}
            />
          </div>
        </div>

        <Button type="submit" variant="secondary">
          Guardar configuración
        </Button>
      </form>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Vacantes recomendadas</h2>
        {recommendations.length === 0 ? (
          <EmptyState
            title="Aún no hay recomendaciones"
            description="Completa tu perfil y carga CV para mejorar el ranking de vacantes."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((recommendation) => (
              <JobCard
                key={recommendation.job.id}
                recommendation={recommendation}
                onApply={handleManualApply}
                isApplied={appliedJobIds.includes(recommendation.job.id)}
              />
            ))}
          </div>
        )}
      </section>

      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
