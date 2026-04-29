import { Sparkles, Sword } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-rpg.jpg";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">
          Bem-vindo de volta
        </p>

        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
          Olá,{" "}
          <span className="gradient-text">
            {user?.name?.split(" ")[0]}
          </span>{" "}
        </h1>

        <p className="mt-3 text-muted-foreground">
          Pronto para continuar sua jornada épica?
        </p>

        {/* AÇÃO PRINCIPAL */}
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="bg-gradient-primary shadow-glow">
            <Link to="/mesa">
              <Sword size={16} className="mr-2" /> Ver Mesas
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-primary/40">
            <Link to="/fichas">Minhas Fichas</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="glow-card relative h-64 md:h-80">
        <img
          src={heroImage}
          alt="Castelo místico"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />

        <div className="relative z-10 flex h-full max-w-xl flex-col justify-center gap-4 p-6 md:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles size={14} /> Campanha em destaque
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-glow">
            A Profecia das Sombras
          </h2>

          <p className="text-sm text-muted-foreground">
            Uma escuridão antiga desperta nas montanhas de Eldoria.
            Reúna sua party e embarque nessa jornada épica.
          </p>
        </div>
      </section>

      {/* Mensagem final */}
      <section className="text-center">
        <h2 className="text-xl font-semibold">
          Seu mundo de aventuras começa aqui
        </h2>

        <p className="mt-2 text-muted-foreground">
          Crie personagens, participe de campanhas e viva histórias épicas com sua party.
        </p>
      </section>
    </div>
  );
};

export default Home;