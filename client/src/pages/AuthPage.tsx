/* STYLE: Laboratório Solar — auth como ritual de entrada: focada, compacta e com o tier visível como decisão. */
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assets, plans, type Session, type Tier } from "@/lib/fitData";
import { api, ApiError } from "@/lib/api";

export default function AuthPage({ initialTier, onComplete, onBack }: { initialTier: Tier; onComplete: (session: Session) => void; onBack: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [tier, setTier] = useState<Tier>(initialTier);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session =
        mode === "register"
          ? await api.register({ name: name.trim(), email: email.trim(), password, tier })
          : await api.login({ email: email.trim(), password });
      onComplete(session);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível ligar ao servidor. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view">
      <div className="auth-noise" />
      <header className="auth-header"><button className="auth-back" onClick={onBack}><ArrowLeft size={15} /> Voltar à página inicial</button><a className="fit-brand" href="/" onClick={(event) => { event.preventDefault(); onBack(); }}><img src={assets.mark} alt="" /><span>Projeto <b>Fit</b></span></a><span className="auth-meta">ACESSO SEGURO / FIT OS</span></header>
      <main className="auth-layout">
        <section className="auth-intro"><div className="fit-kicker"><i /> A TUA PRÓXIMA FASE</div><h1>Entra.<br /><em>Move-te.</em></h1><p>O teu plano espera por ti. Guarda o progresso, consulta os teus treinos e deixa a IA tratar do próximo passo.</p><div className="auth-stats"><span><b>30</b> dias</span><i /><span><b>3</b> tiers</span><i /><span><b>1</b> rotina</span></div></section>
        <section className="auth-card">
          <div className="auth-tabs"><button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Criar conta</button><button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Entrar</button></div>
          <div className="auth-card-heading"><span className="auth-step">01 / 02</span><h2>{mode === "register" ? "Começa a tua rotina." : "Bom ver-te de volta."}</h2><p>{mode === "register" ? "Escolhe um plano e abre o teu espaço Fit." : "Continua de onde ficaste."}</p></div>
          <form onSubmit={submit}>
            {mode === "register" && <label>Nome<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Como te chamamos?" required minLength={2} /></label>}
            <label>Email<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" required /></label>
            <label>Password<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres, com letras e números" minLength={8} required /></label>
            {mode === "register" && <div className="tier-picker"><span>O TEU PLANO</span><div>{plans.map((plan) => <button type="button" key={plan.id} className={tier === plan.id ? "active" : ""} onClick={() => setTier(plan.id)}><b>{plan.name}</b><small>{plan.price}/mês</small>{plan.popular && <em>popular</em>}</button>)}</div></div>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            <Button type="submit" className="fit-btn fit-btn--orange auth-submit" disabled={loading}>
              {loading ? "Um momento…" : mode === "register" ? `Criar conta · ${plans.find((plan) => plan.id === tier)?.name}` : "Entrar no meu painel"}
              <ArrowRight size={16} />
            </Button>
          </form>
          <div className="auth-note"><LockKeyhole size={14} /> {mode === "register" ? "Conta protegida por password com hash — sem pagamento real ligado nesta versão." : "A tua sessão é validada no servidor a cada pedido."}</div>
        </section>
      </main>
    </div>
  );
}
