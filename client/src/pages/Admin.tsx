/* STYLE: Laboratório Solar — admin como sala de controlo: métricas legíveis, tabelas operacionais e laranja reservado para decisões. */
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, ClipboardList, FileText, MoreHorizontal, Package, Plus, Search, Settings2, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { assets, products, type Session } from "@/lib/fitData";
import { api, type AdminOverview, type AdminWorkout } from "@/lib/api";

// Nota de segurança: os números desta página (overview, treinos, stock) vêm
// sempre de /api/admin/*, protegidas no servidor por requireAdmin. Já não há
// mocks locais nem um "stock" que qualquer sessão forjada no browser conseguia
// inflacionar — se o pedido falhar (ex: a sessão afinal não é admin), não há
// dados nenhuns para mostrar.
export default function Admin({ session, onBack, onSignOut }: { session: Session; onBack: () => void; onSignOut: () => void }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [workouts, setWorkouts] = useState<AdminWorkout[]>([]);
  const [stockById, setStockById] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([api.adminOverview(), api.adminWorkouts(), api.adminInventory()])
      .then(([overviewRes, workoutsRes, inventoryRes]) => {
        if (!active) return;
        setOverview(overviewRes);
        setWorkouts(workoutsRes.workouts);
        setStockById(Object.fromEntries(inventoryRes.inventory.map((item) => [item.id, item.stock])));
      })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, []);

  const filteredWorkouts = workouts.filter((workout) => workout.title.toLowerCase().includes(search.toLowerCase()));
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };

  const incrementStock = async (productId: string, name: string) => {
    try {
      const { item } = await api.incrementStock(productId);
      setStockById((current) => ({ ...current, [item.id]: item.stock }));
      flash(`Stock de ${name} atualizado`);
    } catch {
      flash("Não foi possível atualizar o stock.");
    }
  };

  return <div className="admin-shell"><aside className="admin-sidebar"><a className="dashboard-brand" href="/" onClick={(event) => { event.preventDefault(); onBack(); }}><img src={assets.mark} alt="" /><span>Projeto <b>Fit</b></span></a><div className="admin-sidebar-title"><span>FIT OS</span><b>Admin console</b></div><nav><button className="active"><WalletCards size={16} /> Overview</button><button><ClipboardList size={16} /> Conteúdo</button><button><Package size={16} /> Inventário</button><button><Users size={16} /> Utilizadores</button><button><Settings2 size={16} /> Definições</button></nav><div className="admin-side-bottom"><span>SESSÃO ADMIN</span><b>{session.name}</b><button onClick={onSignOut}>Terminar sessão</button></div></aside><main className="admin-main"><header className="admin-topbar"><Button variant="ghost" className="admin-back" onClick={onBack}><ArrowLeft size={15} /> Voltar ao dashboard</Button><div className="admin-topbar-right"><span>ADMIN / 03 SET 2026</span><div className="admin-avatar">AD</div></div></header><div className="admin-content"><div className="admin-heading"><div><div className="fit-kicker"><i /> PAINEL DE GESTÃO / VISÃO GERAL</div><h1>O sistema<br /><em>em movimento.</em></h1></div><div className="admin-heading-note">Controlo de produto, conteúdo e comunidade num só lugar.<br /><span>Última sincronização · agora</span></div></div>{loadError && <div className="auth-error" role="alert">Não foi possível carregar os dados de administração — confirma que a tua conta tem mesmo permissões de administrador.</div>}<section className="admin-metrics"><Card className="admin-metric-card"><div><span>MRR ATUAL</span><WalletCards size={16} /></div><strong>{overview ? overview.mrr.toLocaleString("pt-PT") : "—"}<span>€</span></strong><p><b>+12,4%</b> vs. mês anterior <ArrowUpRight size={13} /></p><div className="metric-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></Card><Card className="admin-metric-card"><div><span>UTILIZADORES TOTAIS</span><Users size={16} /></div><strong>{overview ? overview.totalUsers.toLocaleString("pt-PT") : "—"}</strong><p><b>+{overview?.newSignupsThisMonth ?? 0}</b> novos este mês <ArrowUpRight size={13} /></p><div className="metric-spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></Card><Card className="admin-metric-card"><div><span>SESSÕES CONCLUÍDAS</span><Check size={16} /></div><strong>{overview ? overview.completedSessions.toLocaleString("pt-PT") : "—"}</strong><p><b>{overview?.completionRate ?? "—"}%</b> taxa de conclusão <ArrowUpRight size={13} /></p><div className="metric-ring"><span>{overview ? `${overview.completionRate}%` : "—"}</span></div></Card></section><section className="admin-table-section"><div className="admin-section-head"><div><div className="fit-kicker"><i /> CMS / CONTEÚDO DE TREINO</div><h2>Biblioteca de sessões.</h2></div><Button className="fit-btn fit-btn--orange" onClick={() => flash("Novo conteúdo: fluxo pronto para ligar ao CMS") }><Plus size={15} /> Novo treino</Button></div><div className="admin-table-tools"><div className="admin-search"><Search size={15} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar sessão..." /></div><span>{filteredWorkouts.length} de {workouts.length} entradas</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>SESSÃO</th><th>TIPO</th><th>FICHEIRO PDF</th><th>ESTADO</th><th /></tr></thead><tbody>{filteredWorkouts.map((workout) => <tr key={workout.id}><td><b>{workout.title}</b><small>{workout.owner}</small></td><td><span className="admin-type">{workout.type}</span></td><td><a href={`#${workout.pdf}`} onClick={() => flash(`${workout.pdf} selecionado`)}><FileText size={14} /> {workout.pdf}</a></td><td><span className={`admin-status ${workout.status === "Publicado" ? "published" : "draft"}`}><i /> {workout.status}</span></td><td><button className="table-more" aria-label={`Opções para ${workout.title}`}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div></section><section className="admin-table-section admin-inventory"><div className="admin-section-head"><div><div className="fit-kicker"><i /> LOJA / INVENTÁRIO</div><h2>O que está em stock.</h2></div><Button className="fit-btn fit-btn--outline" onClick={() => flash("Novo produto: fluxo pronto para ligar ao catálogo")}><Plus size={15} /> Adicionar produto</Button></div><div className="inventory-grid">{products.map((product) => <div className="inventory-item" key={product.id}><div className={`inventory-orb inventory-orb--${product.accent}`}>{product.id.slice(0, 1).toUpperCase()}</div><div><b>{product.name}</b><small>{product.price} · {product.description}</small></div><div className="inventory-stock"><span>STOCK</span><strong>{stockById[product.id] ?? "—"}</strong><button onClick={() => incrementStock(product.id, product.name)}>+1</button></div></div>)}</div></section></div><footer className="admin-footer"><span>Projeto Fit · Console interno</span><span>Treinos e ilustrações gentilmente disponibilizados por DAREBEE.com sob licença CC BY-NC-SA 4.0.</span></footer></main>{notice && <div className="fit-toast"><Check size={15} /> {notice}</div>}</div>;
}
