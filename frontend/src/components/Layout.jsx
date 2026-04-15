const tabs = [
  { id: "home", label: "Inicio", subtitle: "Métricas" },
  { id: "perfil", label: "Perfil", subtitle: "Onboarding" },
  { id: "postulaciones", label: "Postulaciones", subtitle: "Acciones" },
  { id: "seguimiento", label: "Seguimiento", subtitle: "Estados" }
];

export default function Layout({ currentTab, onTabChange, user, onReset, children }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5">
      <header className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Profile Manager</h1>
            <p className="mt-1 text-sm text-slate-600">Gestiona perfil, vacantes y seguimiento en una sola vista.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Sesión activa</p>
            <p className="text-sm font-medium text-slate-700">{user.full_name}</p>
            <button
              type="button"
              onClick={onReset}
              className="mt-2 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              Cambiar usuario
            </button>
          </div>
        </div>
      </header>

      <nav className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`rounded-md border px-3 py-1.5 text-left transition ${
              currentTab === tab.id
                ? "border-sky-300 bg-sky-50 text-sky-700"
                : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <p className="text-sm font-medium">{tab.label}</p>
          </button>
        ))}
      </nav>

      <main className="mt-5">{children}</main>
    </div>
  );
}
