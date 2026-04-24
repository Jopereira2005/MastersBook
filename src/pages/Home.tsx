import { ScrollText, Dices, Users, TrendingUp, Sparkles, Sword } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-rpg.jpg";
import { Link } from "react-router-dom";

const stats = [
  { label: "Fichas", value: 4, icon: ScrollText, hint: "Personagens ativos" },
  { label: "Mesas Ativas", value: 2, icon: Dices, hint: "Em campanhas" },
  { label: "Amizades", value: 12, icon: Users, hint: "Aliados de jornada" },
  { label: "Nível Médio", value: 7, icon: TrendingUp, hint: "Da sua party" },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Bem-vindo de volta</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
          Olá, <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Prepare-se para alcançar grandes feitos hoje.</p>
      </header>

      {/* Hero banner */}
      <section className="glow-card relative h-64 md:h-80">
        <img
          src={heroImage}
          alt="Castelo místico"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="relative z-10 flex h-full max-w-xl flex-col justify-center gap-4 p-6 md:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles size={14} /> Nova Campanha Disponível
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-glow">A Profecia das Sombras</h2>
          <p className="text-sm text-muted-foreground">
            Uma escuridão antiga desperta nas montanhas de Eldoria. Reúna sua party e parta nesta jornada épica.
          </p>
          <div className="flex gap-3">
            <Button asChild className="bg-gradient-primary shadow-glow">
              <Link to="/mesa">
                <Sword size={16} className="mr-2" /> Iniciar Aventura
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-primary/40">
              <Link to="/fichas">Ver Fichas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="glow-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon size={20} />
              </div>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      {/* Activity */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glow-card lg:col-span-2 p-6">
          <h3 className="font-display text-xl mb-4">Atividade Recente</h3>
          <ul className="space-y-3">
            {[
              { t: "Você criou a ficha de Aelin Ashryver — Ranger Nv. 8", c: "há 2 horas" },
              { t: "Mesa “Profecia das Sombras” iniciada", c: "ontem" },
              { t: "Bren entrou em sua party", c: "há 3 dias" },
              { t: "Loot épico encontrado: Lâmina de Vael'koth", c: "há 5 dias" },
            ].map((it, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-glow" />
                  <span className="text-sm">{it.t}</span>
                </div>
                <span className="text-xs text-muted-foreground">{it.c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glow-card p-6">
          <h3 className="font-display text-xl mb-4">Próxima Sessão</h3>
          <div className="rounded-xl bg-gradient-hero p-5 border border-primary/30">
            <p className="text-xs uppercase tracking-widest text-primary">Sábado · 20h</p>
            <p className="mt-2 font-display text-lg">Profecia das Sombras</p>
            <p className="text-xs text-muted-foreground mt-1">5 jogadores confirmados</p>
            <Button size="sm" className="mt-4 w-full bg-gradient-primary">Entrar na sessão</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
