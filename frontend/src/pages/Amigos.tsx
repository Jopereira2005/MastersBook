import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getFriends,
  getPending,
  sendInvite,
  acceptInvite,
  declineInvite,
} from "@/services/friendshipService";

export default function Amigos() {
  const { user } = useAuth();

  const [friends, setFriends] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [newFriend, setNewFriend] = useState("");

  // 🔥 função central de reload
  async function loadData() {
    if (!user) return;

    const friendsData = await getFriends(user.id);
    const pendingData = await getPending(user.id);

    setFriends(friendsData);
    setReceived(pendingData);
  }

  // 🔄 carregar ao entrar
  useEffect(() => {
    loadData();
  }, [user]);

  // ➕ enviar convite
  async function handleAddFriend() {
    if (!newFriend || !user) return;

    await sendInvite(user.id, newFriend);

    setNewFriend("");

    // 🔥 recarrega dados reais
    loadData();
  }

  // ✅ aceitar
  async function acceptFriend(id: number) {
    await acceptInvite(id.toString());

    // 🔥 atualiza tudo
    loadData();
  }

  // ❌ recusar
  async function declineFriend(id: number) {
    await declineInvite(id.toString());

    // 🔥 atualiza tudo
    loadData();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Amizades</h1>

      {/* ADICIONAR */}
      <div className="bg-sidebar-accent/30 rounded-xl p-4 space-y-2">
        <h2 className="text-lg">Adicionar amigo</h2>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Username ou email..."
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            className="flex-1 rounded-lg bg-background px-3 py-2 text-sm"
          />

          <button
            onClick={handleAddFriend}
            className="px-3 py-2 rounded-lg bg-primary text-white text-sm"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* AMIGOS */}
      <div>
        <h2 className="text-lg mb-2">Seus amigos</h2>

        <div className="bg-sidebar-accent/30 rounded-xl p-3 space-y-2">
          {friends.length === 0 && <p>Nenhum amigo ainda</p>}

          {friends.map((f) => (
            <div key={f.id}>
              {f.user1?.name || f.user2?.name || "Usuário"}
            </div>
          ))}
        </div>
      </div>

      {/* RECEBIDOS */}
      <div>
        <h2 className="text-lg mb-2">Pedidos recebidos</h2>

        <div className="bg-sidebar-accent/30 rounded-xl p-3 space-y-2">
          {received.length === 0 && <p>Nenhum pedido</p>}

          {received.map((f) => (
            <div key={f.id} className="flex justify-between">
              <span>{f.user1?.name || "Usuário"}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => acceptFriend(f.id)}
                  className="text-green-400 text-sm"
                >
                  Aceitar
                </button>

                <button
                  onClick={() => declineFriend(f.id)}
                  className="text-red-400 text-sm"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}