import { useRef, useEffect } from "react";
import { Activity, Info } from "lucide-react";
import { IMessage } from "@/interfaces/message";

interface SystemLogsProps {
  messages: IMessage[];
}

export function SystemLogs({ messages }: SystemLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Filtramos apenas as mensagens de sistema (LOG)
  const logs = messages.filter(m => m.type === "LOG");

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full w-full bg-black/20">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-50 space-y-2 select-none">
            <Activity size={32} />
            <p className="text-xs">Nenhum evento registado...</p>
          </div>
        ) : (
          logs.map((msg, idx) => {
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <div key={msg.id || idx} className="flex items-start gap-2 bg-black/40 border border-white/5 rounded-lg p-2.5 animate-in fade-in slide-in-from-left-2">
                <div className="mt-0.5 text-primary/50 shrink-0">
                  <Info size={14} />
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Sistema</span>
                    <span className="text-[8px] text-zinc-600">{time}</span>
                  </div>
                  <span className="text-xs text-zinc-300 leading-snug">
                    {msg.content}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}