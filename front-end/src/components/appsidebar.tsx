import { NavLink, useNavigate } from "react-router-dom";
import { Home, Dices, ScrollText, UserCircle, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/mesa", label: "Mesas", icon: Dices },
  { to: "/fichas", label: "Fichas", icon: ScrollText },
  { to: "/perfil", label: "Perfil", icon: UserCircle },
];

export const AppSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="hidden md:flex sticky top-0 h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display text-lg leading-none gradient-text">Eldritch</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Quest</p>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Navegação</p>
        <ul className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4.5 w-4.5" size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-sidebar-accent/50 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
};
