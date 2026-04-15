import { useState } from "react";
import Button from "./ui/Button";
import { Card, CardDescription, CardTitle } from "./ui/Card";
import { Input, Label, TextArea } from "./ui/FormField";

export default function CVForm({ onExtract, onExtractFile }) {
  const [textoCV, setTextoCV] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    await onExtract(textoCV);
    setLoading(false);
  }

  async function handleFileSubmit(event) {
    event.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    await onExtractFile(selectedFile);
    setLoading(false);
  }

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <CardTitle>Carga inicial del CV</CardTitle>
          <CardDescription className="mt-1">
            Usa texto o archivo (PDF, DOCX, TXT) para extraer habilidades y generar un perfil base editable.
          </CardDescription>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="cv-text">Pegar texto del CV</Label>
            <TextArea
              id="cv-text"
              value={textoCV}
              onChange={(event) => setTextoCV(event.target.value)}
              placeholder="Ej. Desarrollador Fullstack con experiencia en Python, React y SQL..."
              rows={7}
              required
            />
          </div>
          <Button type="submit" isLoading={loading}>
            Extraer desde texto
          </Button>
        </form>

        <form className="space-y-3 border-t border-slate-200 pt-4" onSubmit={handleFileSubmit}>
          <div>
            <Label htmlFor="cv-file">Subir archivo del CV</Label>
            <Input
              id="cv-file"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              required
            />
            <p className="mt-1 text-xs text-slate-500">Formatos permitidos: PDF, DOCX, TXT.</p>
          </div>
          <Button type="submit" variant="secondary" isLoading={loading}>
            Extraer desde archivo
          </Button>
        </form>
      </div>
    </Card>
  );
}
