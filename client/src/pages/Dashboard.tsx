/* STYLE: Laboratório Solar — dashboard privado como um cockpit de treino: dados compactos, laranja para ação e progressão visível. */
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, Check, ChevronRight, Dumbbell, Flame, Home, LockKeyhole, LogOut, Menu, Plus, ShoppingBag, Sparkles, Store, Timer, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { assets, challenges, deepPrograms, products, quickWorkouts, tierLabel, type Session, type Tier } from "@/lib/fitData";
import { api, type ProgramsAccess } from "@/lib/api";

const navItems = [
  { id: "home", label: "Início", icon: Home },
  { id: "programs", label: "Programas", icon: Dumbbell },
  { id: "shop", label: "Loja de Suplementos", icon: Store },
  { id: "coach", label: "Treinador IA", icon: Bot },
];

type NavId = (typeof navItems)[number]["id"];

function Sidebar({ activeNav, setActiveNav, onAdmin, onSignOut, session, mobileOpen, setMobileOpen }: { activeNav: NavId; setActiveNav: (id: NavId) => void; onAdmin: () => void; onSignOut: () => void; session: Session; mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const navigate = (id: NavId) => { setActiveNav(id); setMobileOpen(false); };
  return <>
    <div className={`dashboard-overlay ${mobileOpen ? "is-open" : ""}`} onClick={() => setMobileOpen(false)} />
    <aside className={`dashboard-sidebar ${mobileOpen ? "is-open" : ""}`}>
      <div className="dashboard-sidebar-top"><a className="dashboard-brand" href="/" onClick={() => setMobileOpen(false)}><img src={assets.mark} alt="" /><span>Projeto <b>Fit</b></span></a><button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Fechar navegação"><X size={18} /></button></div>
      <div className="dashboard-side-label">Área privada</div>
      <nav className="dashboard-nav" aria-label="Navegação privada">
        {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={activeNav === id ? "active" : ""} onClick={() => navigate(id)}><Icon size={17} /><span>{label}</span>{id === "programs" && <small>01</small>}{id === "coach" && <small>BETA</small>}</button>)}
      </nav>
      <div className="dashboard-side-bottom"><div className="dashboard-side-label">Conta atual</div><div className="dashboard-account"><span>{session.name.slice(0, 1).toUpperCase()}</span><div><b>{session.name}</b><small>Plano {tierLabel[session.tier]}</small></div></div>{session.role === "admin" && <button className="dashboard-admin-link" onClick={onAdmin}><Zap size={15} /> Admin Panel <ChevronRight size={14} /></button>}<button className="dashboard-logout" onClick={onSignOut}><LogOut size={14} /> Terminar sessão</button></div>
    </aside>
  </>;
}

function ProgressSummary({ completed }: { completed: number[] }) {
  const percent = Math.round((completed.length / 30) * 100);
  return <div className="dashboard-stat-grid"><div className="dashboard-stat"><span>PROGRESSO IRONBORN</span><strong>{percent}<small>%</small></strong><div className="mini-progress"><i style={{ width: `${percent}%` }} /></div><b>{completed.length} de 30 sessões</b></div><div className="dashboard-stat"><span>STREAK ATUAL</span><strong>{completed.length ? Math.min(completed.length, 12) : 0}<small> dias</small></strong><p><Flame size={13} /> Mantém o ritmo</p></div><div className="dashboard-stat"><span>MINUTOS EM MOVIMENTO</span><strong>{completed.length * 32}<small> min</small></strong><p><Timer size={13} /> +32 no próximo treino</p></div></div>;
}

function ProgramHero({ completed, onSelectDay, onSeePrograms }: { completed: number[]; onSelectDay: (day: number) => void; onSeePrograms: () => void }) {
  const nextDay = completed.length ? Math.min(30, Math.max(...completed) + 1) : 1;
  const percent = Math.round((completed.length / 30) * 100);
  return <section className="program-hero-card"><div className="program-hero-image"><img src={assets.gym} alt="Atleta a treinar na academia" /><span>FIT / 026</span></div><div className="program-hero-copy"><div className="fit-kicker"><i /> PROGRAMA ATIVO / 01</div><div className="fit-chip">IRONBORN <b>/ ACADEMIA</b></div><h2>Ironborn<br /><em>Academia.</em></h2><p>Força com intenção. Segue o próximo protocolo e deixa a consistência fazer o trabalho pesado.</p><div className="program-hero-actions"><Button className="fit-btn fit-btn--orange" onClick={() => onSelectDay(nextDay)}>Abrir Dia {nextDay} <ArrowRight size={15} /></Button><button className="fit-text-link" onClick={onSeePrograms}>Ver todos os programas <ArrowRight size={15} /></button></div></div><div className="program-progress-card"><span>PROGRESSO TOTAL</span><strong>{percent}<small>%</small></strong><div className="program-progress-track"><i style={{ width: `${percent}%` }} /></div><div><b>{completed.length} / 30 sessões</b><span>{percent === 100 ? "CONCLUÍDO" : "EM MOVIMENTO"}</span></div></div></section>;
}

// A verdade sobre quais dias estão bloqueados vem do servidor (freeDaysLimit em
// /api/programs), calculada a partir do tier real do utilizador — não é só um
// número fixo escrito aqui no componente.
function DayGrid({ completed, onToggle, onOpen, tier, freeDaysLimit, onUpgrade }: { completed: number[]; onToggle: (day: number) => void; onOpen: (day: number) => void; tier: Tier; freeDaysLimit: number; onUpgrade: () => void }) {
  return <div className="day-grid-react">{Array.from({ length: 30 }, (_, index) => index + 1).map((day) => { const done = completed.includes(day); const next = !done && day === (completed.length ? Math.max(...completed) + 1 : 1); const locked = tier === "basic" && day > freeDaysLimit; return <button key={day} className={`day-tile ${done ? "done" : ""} ${next ? "next" : ""} ${locked ? "locked" : ""}`} onClick={() => locked ? onUpgrade() : (done ? onToggle(day) : onOpen(day))} aria-label={`Dia ${day}${locked ? ", bloqueado" : done ? ", concluído" : ", abrir treino"}`}><span className="day-tile-top">DIA {String(day).padStart(2, "0")}<span>{locked ? <LockKeyhole size={13} /> : done ? <Check size={14} /> : <span className="empty-check" />}</span></span><strong>Dia {day}</strong><small>{locked ? "Upgrade" : done ? "Concluído" : next ? "Próximo treino" : "Abrir sessão"}</small>{next && <em>A SEGUIR</em>}</button>; })}</div>;
}

function ProgramsView({ completed, onToggle, onOpen, session, access, onUpgrade, setActiveNav }: { completed: number[]; onToggle: (day: number) => void; onOpen: (day: number) => void; session: Session; access: ProgramsAccess | null; onUpgrade: (tier: Tier) => void; setActiveNav: (id: NavId) => void }) {
  const freeDaysLimit = access?.freeDaysLimit ?? 7;
  return <div className="dashboard-page"><div className="dashboard-page-head"><div><div className="fit-kicker"><i /> BIBLIOTECA FIT / 03 ROTAS</div><h1>Programas que<br /><em>acompanham.</em></h1></div><div className="page-head-note">Escolhe a duração. A IA trata do resto.</div></div><Tabs defaultValue="quick" className="fit-tabs"><TabsList><TabsTrigger value="quick">Workouts Avulsos</TabsTrigger><TabsTrigger value="challenges">Desafios Rápidos</TabsTrigger><TabsTrigger value="deep">Programas de Academia & Casa</TabsTrigger></TabsList><TabsContent value="quick"><div className="quick-grid">{quickWorkouts.map((workout) => <article className="quick-card" key={workout.id}><img src={workout.image} alt="" /><div className="quick-card-content"><small>{workout.meta}</small><h3>{workout.title}</h3><p>{workout.level}</p><button onClick={() => onOpen(1)}>Abrir treino <ArrowRight size={14} /></button></div></article>)}</div></TabsContent><TabsContent value="challenges"><div className="challenge-grid">{challenges.map((challenge) => <article className={`challenge-card challenge-card--${challenge.tone}`} key={challenge.id}><span>DESAFIO / {challenge.duration.toUpperCase()}</span><h3>{challenge.title}</h3><p>{challenge.focus}</p><button onClick={() => onOpen(1)}>Começar desafio <ArrowRight size={14} /></button></article>)}</div></TabsContent><TabsContent value="deep"><div className="deep-list">{deepPrograms.map((program) => {
    // Desbloqueio decidido pelo servidor (access.unlocked), não recalculado aqui.
    // Enquanto a resposta não chega, assume-se bloqueado (falha para o lado seguro).
    const unlocked = access?.unlocked[program.id] ?? false;
    return <article className="deep-program" key={program.id}><img src={program.image} alt="" /><div><span>{program.context} · {program.duration}</span><h3>{program.title}</h3><p>{program.detail}</p></div><div className="deep-program-action">{unlocked ? <Button className="fit-btn fit-btn--orange" onClick={() => onOpen(1)}>Continuar <ArrowRight size={15} /></Button> : <Button className="fit-btn fit-btn--outline" onClick={() => onUpgrade(program.required)}>Desbloquear <LockKeyhole size={14} /></Button>}</div></article>;
  })}</div><div className="active-program-block"><div className="active-program-heading"><div><div className="fit-kicker"><i /> IRONBORN / PROGRESSO</div><h2>30 dias de <em>ferro.</em></h2></div><span>{completed.length}/30 CONCLUÍDOS</span></div><DayGrid completed={completed} onToggle={onToggle} onOpen={onOpen} tier={session.tier} freeDaysLimit={freeDaysLimit} onUpgrade={() => onUpgrade("medium")} /></div></TabsContent></Tabs></div>;
}

function FitBot({ tier, onUpgrade, full = false }: { tier: Tier; onUpgrade: () => void; full?: boolean }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "bot", text: "Olá. Sou o FitBot. Diz-me como estás e penso no próximo passo contigo." }]);
  const isBasic = tier === "basic";
  const send = () => { if (!input.trim() || isBasic) return; const question = input.trim(); setMessages((items) => [...items, { role: "user", text: question }, { role: "bot", text: `Para "${question}", começa com 8 minutos de mobilidade e hidrata-te. Se o corpo responder bem, avança para uma sessão moderada. Vê também a nossa sugestão de recuperação na loja.` }]); setInput(""); };
  return <section className={`fitbot-card ${full ? "fitbot-card--full" : ""}`}><div className="fitbot-head"><div className="fitbot-avatar"><Bot size={18} /></div><div><span>FITBOT / IA</span><b>O teu treinador de bolso <i /></b></div><Sparkles size={17} className="fitbot-spark" /></div><div className="fitbot-messages">{messages.map((message, index) => <div className={`fitbot-message ${message.role}`} key={`${message.text}-${index}`}>{message.text}{message.role === "bot" && index > 0 && <a href="#shop">Ver recomendação <ArrowRight size={12} /></a>}</div>)}{isBasic && <div className="fitbot-paywall"><LockKeyhole size={16} /><div><b>FitBot completo é Médio.</b><p>Faz upgrade para perguntas de recuperação, nutrição e recomendações personalizadas.</p><button onClick={onUpgrade}>Ver planos <ArrowRight size={13} /></button></div></div>}</div><div className="fitbot-input"><Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder={isBasic ? "Upgrade para falar com o FitBot" : "Como recupero melhor hoje?"} disabled={isBasic} /><Button size="icon" className="fit-btn fit-btn--orange" onClick={send} disabled={isBasic}><ArrowRight size={16} /></Button></div><small className="fitbot-disclaimer">Respostas educativas. Não substitui aconselhamento médico.</small></section>;
}

function ShopView({ onAdd }: { onAdd: (name: string) => void }) {
  const [added, setAdded] = useState<string[]>([]);
  const add = (name: string) => { setAdded((items) => [...items, name]); onAdd(name); };
  return <div className="dashboard-page" id="shop"><div className="dashboard-page-head"><div><div className="fit-kicker"><i /> SUPLEMENTAÇÃO / SELEÇÃO FIT</div><h1>O que apoia<br /><em>o teu esforço.</em></h1></div><div className="page-head-note">Ingredientes claros. Sem promessas mágicas.</div></div><div className="shop-grid">{products.map((product) => <article className={`shop-card shop-card--${product.accent}`} key={product.id}><div className="shop-product-orb"><span>{product.id === "whey" ? "W" : product.id === "creatine" ? "C" : product.id === "glutamine" ? "G" : "B"}</span></div><div className="shop-card-copy"><small>{product.category}</small><h3>{product.name}</h3><p>{product.description}</p><div className="shop-card-bottom"><strong>{product.price}</strong><Button className="fit-btn fit-btn--outline" onClick={() => add(product.name)}>{added.includes(product.name) ? <><Check size={14} /> Adicionado</> : <><Plus size={14} /> Adicionar</>}</Button></div></div></article>)}</div><div className="shop-note"><ShoppingBag size={17} /><span>Compra demonstrativa · Checkout real pode ser ligado ao Shopify ou Stripe numa próxima fase.</span></div></div>;
}

function HomeView({ completed, onOpen, onToggle, session, onUpgrade, setActiveNav, onAdd }: { completed: number[]; onOpen: (day: number) => void; onToggle: (day: number) => void; session: Session; onUpgrade: () => void; setActiveNav: (id: NavId) => void; onAdd: (name: string) => void }) {
  const nextDay = completed.length ? Math.min(30, Math.max(...completed) + 1) : 1;
  return <div className="dashboard-page"><div className="dashboard-page-head"><div><div className="fit-kicker"><i /> SESSÃO DE HOJE / 01</div><h1>O teu ritmo,<br /><em>o teu programa.</em></h1></div><div className="dashboard-date">QUARTA · 03 SET 2026</div></div><ProgressSummary completed={completed} /><ProgramHero completed={completed} onSelectDay={onOpen} onSeePrograms={() => setActiveNav("programs")} /><div className="dashboard-home-lower"><section className="today-card"><div className="today-head"><div><div className="fit-kicker"><i /> PRÓXIMO PROTOCOLO</div><h2>Dia {nextDay} <em>/ força</em></h2></div><span>32 MIN · NÍVEL 04</span></div><div className="today-exercises">{["Agachamento goblet", "Remada unilateral", "Prancha ativa"].map((item, index) => <button key={item} onClick={() => onOpen(nextDay)}><span>0{index + 1}</span><b>{item}</b><small>{index === 2 ? "3 × 35s" : "3 × 12 reps"}</small><ChevronRight size={15} /></button>)}</div><Button className="fit-btn fit-btn--orange" onClick={() => onOpen(nextDay)}>Abrir treino completo <ArrowRight size={15} /></Button></section><FitBot tier={session.tier} onUpgrade={onUpgrade} /></div><section className="shop-mini"><div><div className="fit-kicker"><i /> LOJA / RECUPERAÇÃO</div><h2>Pequenos apoios.<br /><em>Boa consistência.</em></h2></div><div className="shop-mini-products">{products.slice(0, 3).map((product) => <button key={product.id} onClick={() => setActiveNav("shop")}><span>{product.name}</span><b>{product.price}</b><ArrowRight size={14} /></button>)}</div></section></div>;
}

export default function Dashboard({ session, onSignOut, onAdmin, onUpgrade }: { session: Session; onSignOut: () => void; onAdmin: () => void; onUpgrade: (tier: Tier) => void }) {
  const [activeNav, setActiveNav] = useState<NavId>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [access, setAccess] = useState<ProgramsAccess | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState("");
  const selectedWorkout = useMemo(() => selectedDay ? { day: selectedDay } : null, [selectedDay]);

  // O progresso e o desbloqueio de programas passam a viver no servidor —
  // já não é possível "completar" 30 dias ou desbloquear planos pagos editando
  // localStorage no browser.
  useEffect(() => {
    let active = true;
    api.progress().then((res) => { if (active) setCompleted(res.completedDays); }).catch(() => {});
    api.programs().then((res) => { if (active) setAccess(res); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const toggleDay = async (day: number) => {
    try {
      const { completedDays } = await api.toggleProgress(day);
      setCompleted(completedDays);
    } catch {
      setToast("Não foi possível guardar o progresso. Tenta novamente.");
      window.setTimeout(() => setToast(""), 2500);
    }
  };

  const addProduct = (name: string) => { setCartCount((count) => count + 1); setToast(`${name} adicionado ao saco`); window.setTimeout(() => setToast(""), 2500); };

  return <div className="dashboard-shell"><Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onAdmin={onAdmin} onSignOut={onSignOut} session={session} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /><main className="dashboard-main"><header className="dashboard-topbar"><button className="dashboard-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={19} /></button><div className="dashboard-breadcrumb"><span>PROJETO FIT</span><b>/</b> {activeNav === "home" ? "PAINEL DE TREINO" : navItems.find((item) => item.id === activeNav)?.label.toUpperCase()}</div><div className="dashboard-user"><div><b>{session.name}</b><small>PLANO {tierLabel[session.tier].toUpperCase()}</small></div><span>{session.name.slice(0, 1).toUpperCase()}</span>{cartCount > 0 && <button className="cart-bubble" onClick={() => setActiveNav("shop")} aria-label={`${cartCount} produtos no saco`}><ShoppingBag size={14} />{cartCount}</button>}</div></header><div className="dashboard-content">{activeNav === "home" && <HomeView completed={completed} onOpen={setSelectedDay} onToggle={toggleDay} session={session} onUpgrade={() => onUpgrade("medium")} setActiveNav={setActiveNav} onAdd={addProduct} />}{activeNav === "programs" && <ProgramsView completed={completed} onToggle={toggleDay} onOpen={setSelectedDay} session={session} access={access} onUpgrade={onUpgrade} setActiveNav={setActiveNav} />}{activeNav === "shop" && <ShopView onAdd={addProduct} />}{activeNav === "coach" && <div className="dashboard-page"><div className="dashboard-page-head"><div><div className="fit-kicker"><i /> FITBOT / TREINADOR IA</div><h1>Pergunta.<br /><em>Ajusta.</em></h1></div><div className="page-head-note">Inteligência que responde ao teu momento.</div></div><FitBot tier={session.tier} onUpgrade={() => onUpgrade("medium")} full /></div>}</div><footer className="dashboard-footer-react"><span>Treinos e ilustrações gentilmente disponibilizados por DAREBEE.com sob licença CC BY-NC-SA 4.0.</span><span>SESSÃO SINCRONIZADA COM O SERVIDOR</span></footer></main>{selectedWorkout && <Dialog open={Boolean(selectedWorkout)} onOpenChange={(open) => !open && setSelectedDay(null)}><DialogContent className="workout-dialog"><DialogHeader><span className="fit-kicker"><i /> IRONBORN / SESSÃO {String(selectedWorkout.day).padStart(2, "0")}</span><DialogTitle>Dia {selectedWorkout.day} <em>/ Full body</em></DialogTitle><DialogDescription>32 minutos · Força com controlo · Academia</DialogDescription></DialogHeader><div className="workout-dialog-grid">{[{ name: "Agachamento goblet", detail: "4 séries · 10 repetições", cue: "Peito aberto, joelhos acompanham os pés." }, { name: "Remada unilateral", detail: "3 séries · 12 por lado", cue: "Puxa o cotovelo para trás." }, { name: "Press de ombros", detail: "3 séries · 10 repetições", cue: "Expira na subida." }, { name: "Prancha ativa", detail: "3 séries · 35 segundos", cue: "Costelas para dentro, respira." }].map((exercise, index) => <div className="workout-exercise" key={exercise.name}><span>0{index + 1}</span><div><b>{exercise.name}</b><small>{exercise.detail}</small><p>{exercise.cue}</p></div><Dumbbell size={16} /></div>)}</div><Button className="fit-btn fit-btn--orange workout-complete" onClick={async () => { await toggleDay(selectedWorkout.day); setSelectedDay(null); }}>Marcar como concluído <Check size={15} /></Button></DialogContent></Dialog>}{toast && <div className="fit-toast"><Check size={15} /> {toast}</div>}</div>;
}
