const STORAGE_PREFIX = "pm-tracking-sim";
const FLOW = ["Postulado", "En revisión", "Entrevista", "Rechazado"];

function nowIso() {
  return new Date().toISOString();
}

function nextStatus(status) {
  const idx = FLOW.indexOf(status);
  if (idx < 0 || idx >= FLOW.length - 1) return status;
  return FLOW[idx + 1];
}

function storageKey(userId) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function loadSimulationState(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSimulationState(userId, state) {
  localStorage.setItem(storageKey(userId), JSON.stringify(state));
}

function ensureEntry(state, app) {
  if (!state[app.id]) {
    state[app.id] = {
      currentStatus: app.status,
      lastUpdatedAt: app.updated_at || app.created_at || nowIso(),
      history: [
        {
          from: null,
          to: app.status,
          timestamp: app.created_at || nowIso(),
          source: "Inicial"
        }
      ]
    };
  }
  return state[app.id];
}

function advanceOne(entry, source) {
  const next = nextStatus(entry.currentStatus);
  if (next === entry.currentStatus) return false;
  const ts = nowIso();
  entry.history.unshift({
    from: entry.currentStatus,
    to: next,
    timestamp: ts,
    source
  });
  entry.currentStatus = next;
  entry.lastUpdatedAt = ts;
  return true;
}

export function mergeApplicationsWithSimulation(applications, simulationState) {
  return applications.map((app) => {
    const entry = simulationState[app.id];
    return {
      ...app,
      simulated_status: entry?.currentStatus || app.status,
      simulated_last_updated_at: entry?.lastUpdatedAt || app.updated_at || app.created_at,
      simulated_history: entry?.history || []
    };
  });
}

export function initializeSimulation(userId, applications) {
  const state = loadSimulationState(userId);
  applications.forEach((app) => {
    ensureEntry(state, app);
  });
  saveSimulationState(userId, state);
  return state;
}

export function runSimulationTick(userId, applications, source = "Automático") {
  const state = loadSimulationState(userId);
  const ordered = applications.map((app) => ensureEntry(state, app));
  if (ordered.length === 0) return state;

  // Avanza como máximo la mitad de candidaturas por ciclo para hacerlo más realista.
  const maxSteps = Math.max(1, Math.floor(ordered.length / 2));
  let moved = 0;
  for (const entry of ordered) {
    if (moved >= maxSteps) break;
    if (advanceOne(entry, source)) moved += 1;
  }
  saveSimulationState(userId, state);
  return state;
}
