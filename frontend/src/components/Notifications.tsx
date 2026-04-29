import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const ref = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 1,
      text: "Aragorn enviou pedido de amizade",
      link: "/amigos",
    },
    {
      id: 2,
      text: "Você foi convidado para uma mesa",
      link: "/mesa",
    },
    {
      id: 3,
      text: "Novo evento de RPG disponível",
      link: "/home",
    },
  ];

  function handleClick(notification: any) {
    navigate(notification.link);
    setOpen(false);
  }

  // 👇 FECHAR AO CLICAR FORA
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* BOTÃO */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-sidebar-accent"
      >
        <Bell size={20} />

        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-sidebar border border-sidebar-border rounded-xl shadow-lg z-50">
          <div className="p-3 border-b border-sidebar-border font-semibold">
            Notificações
          </div>

          <div className="max-h-60 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className="p-3 text-sm hover:bg-sidebar-accent cursor-pointer"
              >
                {n.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}