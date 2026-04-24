import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Home, Dices, ScrollText, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const mobileItems = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/mesa", label: "Mesas", icon: Dices },
  { to: "/fichas", label: "Fichas", icon: ScrollText },
  { to: "/perfil", label: "Perfil", icon: UserCircle },
];

export const AppLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 min-w-0 pb-24 md:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur-xl">
        <div className="grid grid-cols-5">
          {mobileItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex flex-col items-center gap-1 py-3 text-[11px] text-muted-foreground"
          >
            <LogOut size={20} /> Sair
          </button>
        </div>
      </nav>
    </div>
  );
};
