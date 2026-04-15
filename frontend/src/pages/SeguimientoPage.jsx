import { useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import StatusBoard from "../components/StatusBoard";
import Alert from "../components/ui/Alert";
import { Card, CardDescription, CardTitle } from "../components/ui/Card";
import { LoadingState, SectionHeader } from "../components/ui/StateBlocks";

export default function SeguimientoPage({ userId, refreshToken, onEvent }) {
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [apps, recs] = await Promise.all([api.getApplications(userId), api.getRecommendations(userId)]);
      setApplications(apps);
      setRecommendations(recs);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [userId, refreshToken]);

  const jobsById = useMemo(() => {
    const index = {};
    recommendations.forEach((item) => {
      index[item.job.id] = item.job;
    });
    return index;
  }, [recommendations]);

  async function handleStatusChange(applicationId, status) {
    try {
      await api.updateApplicationStatus(applicationId, { status });
      setMessage("Estado actualizado.");
      setError("");
      await loadData();
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
        description="Monitorea avance, cambia estados y mantén el proceso actualizado."
      />
      <Card>
        <CardTitle>Resumen rápido</CardTitle>
        <CardDescription className="mt-1">
          Postulaciones totales: {applications.length}. Actualiza estados para reflejar tu progreso real.
        </CardDescription>
      </Card>
      <StatusBoard applications={applications} jobsById={jobsById} onStatusChange={handleStatusChange} />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
