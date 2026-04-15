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
  const [postulacionesNotice, setPostulacionesNotice] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [registerForm, setRegisterForm] = useState({ full_name: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoggingIn(true);
    try {
      const logged = await api.loginUser(loginForm);
      setUser(logged);
      saveUser(logged);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleResetUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setRegisterForm({ full_name: "", email: "", password: "" });
    setLoginForm({ email: "", password: "" });
  }

  function notifyDataChange() {
    setRefreshToken((prev) => prev + 1);
  }

  function goToPostulacionesWithNotice(notice) {
    setPostulacionesNotice(notice || "");
    setTab("postulaciones");
  }

  if (!user) {
    return (
      <div className="mx-auto grid min-h-screen w-full max-w-4xl place-items-center px-4">
        <Card className="w-full max-w-md p-6">
          <CardTitle className="text-2xl">Crea tu cuenta de candidato</CardTitle>
          <CardDescription className="mt-2">
            Ingresa con correo y contraseña. Si no tienes cuenta, regístrate.
          </CardDescription>

          <div className="mt-6 mb-3 flex gap-2">
            <Button type="button" variant={authMode === "login" ? "primary" : "secondary"} onClick={() => setAuthMode("login")}>
              Iniciar sesión
            </Button>
            <Button
              type="button"
              variant={authMode === "register" ? "primary" : "secondary"}
              onClick={() => setAuthMode("register")}
            >
              Registrarse
            </Button>
          </div>

          {authMode === "register" ? (
            <form className="space-y-4" onSubmit={handleRegister}>
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
                <Label htmlFor="register_email">Correo electrónico</Label>
                <Input
                  id="register_email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="register_password">Contraseña</Label>
                <Input
                  id="register_password"
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isRegistering}>
                Crear cuenta
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <Label htmlFor="login_email">Correo electrónico</Label>
                <Input
                  id="login_email"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login_password">Contraseña</Label>
                <Input
                  id="login_password"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isLoggingIn}>
                Ingresar
              </Button>
            </form>
          )}
          {error && <Alert tone="error">{error}</Alert>}
        </Card>
      </div>
    );
  }

  return (
    <Layout currentTab={tab} onTabChange={setTab} user={user} onReset={handleResetUser}>
      {tab === "home" && <HomePage userId={userId} refreshToken={refreshToken} />}
      {tab === "perfil" && (
        <ProfilePage userId={userId} onEvent={notifyDataChange} onGoToPostulaciones={goToPostulacionesWithNotice} />
      )}
      {tab === "postulaciones" && (
        <PostulacionesPage
          userId={userId}
          onEvent={notifyDataChange}
          initialNotice={postulacionesNotice}
          onNoticeConsumed={() => setPostulacionesNotice("")}
        />
      )}
      {tab === "seguimiento" && (
        <SeguimientoPage userId={userId} refreshToken={refreshToken} onEvent={notifyDataChange} />
      )}
    </Layout>
  );
}
