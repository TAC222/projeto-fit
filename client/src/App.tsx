/* STYLE: Laboratório Solar — shell multi-view dark-first, navegação direta e hierarquia de produto consistente. */
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
import { type Session, type Tier } from "./lib/fitData";
import { api, ApiError } from "./lib/api";

function RouteLoading() {
  return <div className="route-loading"><span className="route-loading-mark">P</span><span>A preparar o próximo passo…</span></div>;
}

export default function App() {
  const [location, setLocation] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  // Enquanto isto é true ainda não sabemos se há sessão válida no servidor —
  // evita expulsar por engano alguém que só ainda não recebeu a resposta de /api/auth/me.
  const [checkingSession, setCheckingSession] = useState(true);
  const [selectedTier, setSelectedTier] = useState<Tier>("medium");

  // Segurança: a única fonte de verdade sobre "quem estou logado e com que
  // permissões" é o servidor. Ao carregar a app, perguntamos-lhe diretamente —
  // nunca reconstruímos isto a partir de algo guardado no browser.
  useEffect(() => {
    let active = true;
    api
      .me()
      .then((user) => { if (active) setSession(user); })
      .catch(() => { if (active) setSession(null); })
      .finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (checkingSession) return;
    if ((location === "/dashboard" || location === "/admin") && !session) {
      setLocation("/auth");
      return;
    }
    // Defesa adicional no cliente: quem não é admin nem sequer chega a renderizar
    // a página. A proteção real, no entanto, está no servidor (rotas /api/admin/*
    // devolvem 403 a quem não tiver role="admin"), por isso mesmo que alguém
    // contorne isto localmente não vê dados nenhuns.
    if (location === "/admin" && session && session.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [location, session, checkingSession, setLocation]);

  const openAuth = (tier: Tier = "medium") => {
    setSelectedTier(tier);
    setLocation("/auth");
  };

  const completeAuth = (nextSession: Session) => {
    setSession(nextSession);
    setLocation("/dashboard");
  };

  // Upgrade de plano para quem já tem sessão ativa — chama o servidor
  // diretamente em vez de passar outra vez pelo formulário de registo.
  const handleUpgrade = async (tier: Tier) => {
    try {
      const updated = await api.upgrade(tier);
      setSession(updated);
    } catch (err) {
      console.error(err instanceof ApiError ? err.message : err);
    }
  };

  const signOut = () => {
    api.logout().catch(() => {});
    setSession(null);
    setLocation("/");
  };

  if (checkingSession) {
    return <RouteLoading />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<RouteLoading />}>
            <Switch>
            <Route path="/">
              <Home onAuth={openAuth} onDashboard={() => session ? setLocation("/dashboard") : openAuth("medium")} />
            </Route>
            <Route path="/auth">
              <AuthPage initialTier={selectedTier} onComplete={completeAuth} onBack={() => setLocation("/")} />
            </Route>
            <Route path="/dashboard">
              {session ? <Dashboard session={session} onSignOut={signOut} onAdmin={() => setLocation("/admin")} onUpgrade={handleUpgrade} /> : <AuthPage initialTier="medium" onComplete={completeAuth} onBack={() => setLocation("/")} />}
            </Route>
            <Route path="/admin">
              {session && session.role === "admin" ? <Admin session={session} onBack={() => setLocation("/dashboard")} onSignOut={signOut} /> : <AuthPage initialTier="medium" onComplete={completeAuth} onBack={() => setLocation("/")} />}
            </Route>
            <Route>
              <Home onAuth={openAuth} onDashboard={() => setLocation("/")} />
            </Route>
            </Switch>
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
