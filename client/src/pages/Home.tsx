/* STYLE: Laboratório Solar — landing dark-first, neo-editorial, laranja solar como ação e produto visível desde o primeiro ecrã. */
import { ArrowRight, Check, Dumbbell, Menu, Sparkles, Timer, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { assets, plans, type Tier } from "@/lib/fitData";

export default function Home({ onAuth, onDashboard }: { onAuth: (tier?: Tier) => void; onDashboard: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fit-app fit-landing">
      <header className="fit-header">
        <a className="fit-brand" href="#top" onClick={() => go("top")}><img src={assets.mark} alt="" /><span>Projeto <b>Fit</b></span></a>
        <nav className={`fit-nav ${menuOpen ? "fit-nav--open" : ""}`}>
          <button onClick={() => go("metodo")}>O método</button>
          <button onClick={() => go("treinos")}>Treinos</button>
          <button onClick={() => go("precos")}>Preços</button>
        </nav>
        <div className="fit-header-actions">
          <Button variant="ghost" className="fit-login" onClick={() => onAuth("medium")}>Entrar / Registar</Button>
          <Button className="fit-btn fit-btn--orange" onClick={() => onAuth("medium")}>Começar agora <ArrowRight size={16} /></Button>
          <button className="fit-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </header>

      <main id="top">
        <section className="fit-hero">
          <div className="fit-hero-glow" />
          <div className="fit-hero-content fit-wrap">
            <div className="fit-hero-copy">
              <div className="fit-kicker"><i /> INTELIGÊNCIA PARA O TEU MOVIMENTO</div>
              <div className="fit-protocol">FIT / AI <b>VERÃO 026</b></div>
              <h1>O teu corpo de verão<br /><em>não espera.</em></h1>
              <p>Treina onde quiseres. A IA transforma o teu tempo, o teu objetivo e a tua energia num plano que consegues cumprir.</p>
              <div className="fit-hero-actions"><Button className="fit-btn fit-btn--orange fit-btn--large" onClick={() => onAuth("medium")}>Montar o meu plano <ArrowRight size={17} /></Button><button className="fit-text-link" onClick={() => go("metodo")}>Ver o método <ArrowRight size={16} /></button></div>
              <div className="fit-proof"><span>CASA OU ACADEMIA</span><i /> <span>12—45 MINUTOS</span><i /> <span>IA ADAPTATIVA</span></div><div className="fit-heat-line fit-heat-line--hero"><i /><span>PLAN INPUT</span><b>GOAL / TIME / ENERGY</b><i /></div>
            </div>
            <div className="fit-hero-visual"><img src={assets.hero} alt="Atleta a treinar com um halter num espaço de luz solar" /><div className="fit-hero-overlay" /><div className="fit-hero-card"><div><span className="fit-live-dot" /> PLANO DE HOJE <b>07:30</b></div><strong>Full body / força</strong><small>32 min · nível 04 <ArrowRight size={14} /></small></div><div className="fit-hero-mark"><img src={assets.mark} alt="" /><span>FIT / AI<br /><b>PROTOCOL 026</b></span></div></div>
          </div>
          <div className="fit-hero-footer fit-wrap"><span>PROJETO FIT — INTELIGÊNCIA QUE SE MOVE CONTIGO</span><span>SCROLL TO TRAIN ↓</span></div>
        </section>

        <section className="fit-manifesto" id="metodo"><div className="fit-ghost">01</div><div className="fit-wrap fit-manifesto-grid"><span className="fit-section-number">01 <b>/ 04</b></span><div><div className="fit-kicker fit-kicker--dark">MENOS DESCULPAS. MAIS SISTEMA.</div><div className="fit-chip fit-chip--dark">INPUT <b>OBJETIVO + TEMPO + ENERGIA</b></div><div className="fit-heat-line fit-heat-line--dark"><i /><span>FIT SIGNAL</span><b>01 / 04</b><i /></div><h2>Treinar bem não devia depender de <em>adivinhar.</em></h2></div><div className="fit-manifesto-note"><p>O Projeto Fit lê o teu dia e entrega o próximo passo com clareza. Sem planos impossíveis, sem excesso de informação — só uma rotina que cabe na vida real.</p><button className="fit-round-button" onClick={() => go("treinos")}><ArrowRight size={18} /></button></div></div></section>

        <section className="fit-benefits" id="treinos"><div className="fit-wrap"><div className="fit-section-header"><div><div className="fit-kicker">O MÉTODO FIT</div><div className="fit-chip">IA / CASA / ACADEMIA</div><h2>Um plano que<br /><em>acompanha.</em></h2></div><p>O essencial para entrares em movimento. A inteligência para continuares.</p></div><div className="fit-benefit-grid"><div className="fit-feature-image"><img src={assets.home} alt="Atleta a fazer exercício em casa" /><span>01 / CASA</span><div><b>COMEÇA ONDE ESTÁS</b><ArrowRight size={16} /></div></div><div className="fit-benefit-list"><article><div className="fit-benefit-icon"><Dumbbell size={20} /></div><div><small>PROTOCOLOS VISUAIS</small><h3>Treinos simples de seguir</h3><p>Sessões objetivas e visuais, com progressão para casa ou academia.</p></div></article><article><div className="fit-benefit-icon"><Sparkles size={20} /></div><div><small>ADAPTAÇÃO DIÁRIA</small><h3>Ajustados por IA</h3><p>O plano muda com o teu objetivo, o teu tempo e a energia do dia.</p></div></article><article><div className="fit-benefit-icon"><Timer size={20} /></div><div><small>12—45 MINUTOS</small><h3>Consistência que cabe</h3><p>Menos decisão. Mais movimento. Uma rotina que não pede motivação perfeita.</p></div></article></div></div></div></section>

        <section className="fit-pricing" id="precos"><div className="fit-ghost fit-ghost--light">03</div><div className="fit-wrap"><div className="fit-pricing-top"><span className="fit-section-number">03 <b>/ 04</b></span><span className="fit-kicker fit-kicker--dark">ESCOLHE O TEU RITMO</span><span className="fit-chip fit-chip--dark">7 DIAS PARA TESTAR</span></div><div className="fit-section-header fit-section-header--pricing"><div><h2>Começar é uma<br /><em>decisão simples.</em></h2><p>Escolhe o plano que acompanha o teu próximo mês.</p></div><span className="fit-price-note">CANCELA QUANDO QUISERES</span></div><div className="fit-heat-line fit-heat-line--dark fit-heat-line--pricing"><i /><span>PRICING PROTOCOL</span><b>3 TIERS / 1 DECISÃO</b><i /></div><div className="fit-plan-grid">{plans.map((plan) => <article key={plan.id} className={`fit-plan ${plan.popular ? "fit-plan--popular" : ""}`}><div className="fit-plan-top"><span>0{plan.id === "basic" ? "1" : plan.id === "medium" ? "2" : "3"}</span>{plan.popular && <b>MAIS POPULAR</b>}</div><small>{plan.description}</small><h3>{plan.name}</h3><div className="fit-plan-price"><strong>{plan.price}</strong><span>/mês</span></div><div className="fit-plan-line" /> <ul>{plan.features.map((feature) => <li key={feature}><span><Check size={12} /></span>{feature}</li>)}</ul><Button className={`fit-btn fit-plan-btn ${plan.popular ? "fit-btn--orange" : "fit-btn--outline"}`} onClick={() => onAuth(plan.id)}>{plan.popular ? "Escolher Médio" : "Experimentar"} <ArrowRight size={15} /></Button></article>)}</div></div></section>
      </main>

      <footer className="fit-footer"><div className="fit-wrap fit-footer-main"><div><a className="fit-brand" href="#top"><img src={assets.mark} alt="" /><span>Projeto <b>Fit</b></span></a><p>Inteligência que se move contigo.</p></div><div className="fit-footer-links"><div><small>NAVEGAR</small><button onClick={() => go("metodo")}>O método</button><button onClick={() => go("treinos")}>Treinos</button><button onClick={() => go("precos")}>Preços</button></div><div><small>ÁREA PRIVADA</small><button onClick={onDashboard}>Dashboard</button><button onClick={() => onAuth("medium")}>Entrar / Registar</button></div></div></div><div className="fit-wrap fit-footer-bottom"><p>Treinos e ilustrações gentilmente disponibilizados por <a href="https://darebee.com" target="_blank" rel="noreferrer">DAREBEE.com</a> sob licença <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a>.</p><span>© 2026 PROJETO FIT</span></div></footer>
    </div>
  );
}
