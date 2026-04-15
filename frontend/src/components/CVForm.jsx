import { useState } from "react";
import Button from "./ui/Button";
import { Card, CardDescription, CardTitle } from "./ui/Card";
import { Label, TextArea } from "./ui/FormField";

export default function CVForm({ onExtract }) {
  const [textoCV, setTextoCV] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    await onExtract(textoCV);
    setLoading(false);
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <CardTitle>Carga inicial del CV</CardTitle>
          <CardDescription className="mt-1">
            Pega tu CV en texto plano para extraer habilidades y generar un perfil base editable.
          </CardDescription>
        </div>
        <div>
          <Label htmlFor="cv-text">Texto del CV</Label>
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
          Extraer habilidades
        </Button>
      </form>
    </Card>
  );
}
