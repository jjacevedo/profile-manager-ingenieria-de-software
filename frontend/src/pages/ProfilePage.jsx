import { useEffect, useState } from "react";

import { api } from "../api/client";
import CVForm from "../components/CVForm";
import Button from "../components/ui/Button";
import { Card, CardDescription, CardTitle } from "../components/ui/Card";
import { Input, Label, TextArea } from "../components/ui/FormField";
import Alert from "../components/ui/Alert";
import { LoadingState, SectionHeader } from "../components/ui/StateBlocks";

function skillsToString(skills) {
  return Array.isArray(skills) ? skills.join(", ") : "";
}

export default function ProfilePage({ userId, onEvent }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    summary: "",
    skills: "",
    experience_years: 0,
    education: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await api.getProfile(userId);
      setProfile(data);
      setForm({
        summary: data.summary,
        skills: skillsToString(data.skills),
        experience_years: data.experience_years,
        education: data.education
      });
      setError("");
    } catch (err) {
      setProfile(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function handleExtract(textoCV) {
    try {
      const data = await api.extractProfile({ user_id: userId, texto_cv: textoCV });
      setProfile(data);
      setForm({
        summary: data.summary,
        skills: skillsToString(data.skills),
        experience_years: data.experience_years,
        education: data.education
      });
      setMessage("Perfil extraído y actualizado correctamente.");
      setError("");
      onEvent();
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    const skillsList = form.skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    try {
      const data = await api.updateProfile(userId, {
        summary: form.summary,
        skills: skillsList,
        experience_years: Number(form.experience_years),
        education: form.education
      });
      setProfile(data);
      setMessage("Perfil guardado.");
      setError("");
      onEvent();
    } catch (err) {
      setError(err.message);
      setMessage("");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState title="Cargando perfil..." />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Perfil profesional"
        description="Actualiza tu información para mejorar la calidad del match de vacantes."
      />

      <CVForm onExtract={handleExtract} />

      <Card>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <CardTitle>Editar información del perfil</CardTitle>
            <CardDescription className="mt-1">
              Mantén estos datos actualizados para recibir recomendaciones más precisas.
            </CardDescription>
          </div>

          <div>
            <Label htmlFor="summary">Resumen profesional</Label>
            <TextArea
              id="summary"
              rows={4}
              value={form.summary}
              onChange={(event) => setForm({ ...form, summary: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="skills">Habilidades (separadas por coma)</Label>
              <Input
                id="skills"
                value={form.skills}
                onChange={(event) => setForm({ ...form, skills: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="experience_years">Años de experiencia</Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
                max="50"
                value={form.experience_years}
                onChange={(event) => setForm({ ...form, experience_years: event.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="education">Formación</Label>
            <Input
              id="education"
              value={form.education}
              onChange={(event) => setForm({ ...form, education: event.target.value })}
            />
          </div>

          <Button type="submit" isLoading={saving}>
            Guardar perfil
          </Button>
        </form>
      </Card>

      {profile && (
        <Card>
          <strong>Última actualización:</strong> {new Date(profile.updated_at).toLocaleString()}
        </Card>
      )}
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
