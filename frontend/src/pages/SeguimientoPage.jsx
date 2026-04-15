import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import StatusBoard from "../components/StatusBoard";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import { Card, CardDescription, CardTitle } from "../components/ui/Card";
import { LoadingState, SectionHeader } from "../components/ui/StateBlocks";
import {
  initializeSimulation,
  mergeApplicationsWithSimulation,
  runSimulationTick
} from "../utils/trackingSimulator";

export default function SeguimientoPage({ userId, refreshToken, onEvent }) {
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simTick, setSimTick] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [apps, recs] = await Promise.all([api.getApplications(userId), api.getRecommendations(userId)]);
      const state = initializeSimulation(userId, apps);
      setApplications(mergeApplicationsWithSimulation(apps, state));
      setRecommendations(recs);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [userId, refreshToken, simTick, loadData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const apps = await api.getApplications(userId);
        runSimulationTick(userId, apps, "Automático");
        setSimTick((prev) => prev + 1);
      } catch {
        // Evita romper la UI si hay una falla temporal de red.
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [userId]);

  const jobsById = useMemo(() => {
    const index = {};
    recommendations.forEach((item) => {
      index[item.job.id] = item.job;
    });
    return index;
  }, [recommendations]);

  async function handleSimulateCompanyUpdate() {
    try {
      const apps = await api.getApplications(userId);
      runSimulationTick(userId, apps, "Evento empresa");
      setMessage("Empresa simulada: se recibieron nuevas actualizaciones de estado.");
      setError("");
      setSimTick((prev) => prev + 1);
      onEvent();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <LoadingState title="Cargando tablero de seguimiento..." />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Seguimiento de postulaciones"
        description="Monitorea avance reportado por la empresa. Los estados se actualizan automáticamente (simulado)."
        action={
          <Button type="button" variant="secondary" onClick={handleSimulateCompanyUpdate}>
            Simular actualización de empresa
          </Button>
        }
      />
      <Card>
        <CardTitle>Resumen rápido</CardTitle>
        <CardDescription className="mt-1">
          Postulaciones totales: {applications.length}. El usuario no edita estados: el sistema refleja notificaciones externas simuladas.
        </CardDescription>
      </Card>
      <StatusBoard applications={applications} jobsById={jobsById} />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
