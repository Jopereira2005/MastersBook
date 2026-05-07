import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { Home, Dices, ScrollText, UserCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Notifications from "@/components/Notifications";

const mobileItems = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/fichas", label: "Fichas", icon: ScrollText },
  { to: "/mesa", label: "Mesas", icon: Dices },
  { to: "/amigos", label: "Amigos", icon: Users },
  { to: "/perfil", label: "Perfil", icon: UserCircle }
];

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 min-w-0 pb-24 md:pb-0">
        <div className="flex justify-end p-4">
          <Notifications />
        </div>
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
        </div>
      </nav>
    </div>
  );
};
