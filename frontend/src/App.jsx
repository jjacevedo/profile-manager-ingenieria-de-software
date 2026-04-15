import { useMemo, useState } from "react";

import { api } from "./api/client";
import Layout from "./components/Layout";
import Button from "./components/ui/Button";
import { Card, CardDescription, CardTitle } from "./components/ui/Card";
import { Input, Label } from "./components/ui/FormField";
import Alert from "./components/ui/Alert";
import HomePage from "./pages/HomePage";
import PostulacionesPage from "./pages/PostulacionesPage";
import ProfilePage from "./pages/ProfilePage";
import SeguimientoPage from "./pages/SeguimientoPage";

const USER_STORAGE_KEY = "profile-manager-user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [user, setUser] = useState(readStoredUser);
  const [refreshToken, setRefreshToken] = useState(0);
  const [registerForm, setRegisterForm] = useState({ full_name: "", email: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const userId = useMemo(() => (user ? user.id : null), [user]);

  async function handleRegister(event) {
    event.preventDefault();
    setIsRegistering(true);
    try {
      const created = await api.createUser(registerForm);
      setUser(created);
      saveUser(created);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  }

  function handleResetUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setRegisterForm({ full_name: "", email: "" });
  }

  function notifyDataChange() {
    setRefreshToken((prev) => prev + 1);
  }

  if (!user) {
    return (
      <div className="mx-auto grid min-h-screen w-full max-w-4xl place-items-center px-4">
        <Card className="w-full max-w-md p-6">
          <CardTitle className="text-2xl">Crea tu cuenta de candidato</CardTitle>
          <CardDescription className="mt-2">
            Este paso inicia tu onboarding para personalizar recomendaciones y seguimiento laboral.
          </CardDescription>

          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            <div>
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                placeholder="Ej. Juan Acevedo"
                value={registerForm.full_name}
                onChange={(event) => setRegisterForm({ ...registerForm, full_name: event.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" isLoading={isRegistering}>
              Crear cuenta
            </Button>
            {error && <Alert tone="error">{error}</Alert>}
          </form>
        </Card>
      </div>
    );
  }

  return (
    <Layout currentTab={tab} onTabChange={setTab} user={user} onReset={handleResetUser}>
      {tab === "home" && <HomePage userId={userId} refreshToken={refreshToken} />}
      {tab === "perfil" && <ProfilePage userId={userId} onEvent={notifyDataChange} />}
      {tab === "postulaciones" && <PostulacionesPage userId={userId} onEvent={notifyDataChange} />}
      {tab === "seguimiento" && (
        <SeguimientoPage userId={userId} refreshToken={refreshToken} onEvent={notifyDataChange} />
      )}
    </Layout>
  );
}
