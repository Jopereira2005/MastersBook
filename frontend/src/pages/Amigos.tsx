import { useState } from "react";

export default function Amigos() {
  const [friends, setFriends] = useState([
    { id: 1, name: "Gandalf" },
  ]);

  const [received, setReceived] = useState([
    { id: 2, name: "Aragorn" },
  ]);

  const [sent, setSent] = useState([]);

  const [newFriend, setNewFriend] = useState("");

  function handleAddFriend() {
    if (!newFriend) return;

    setSent([...sent, { id: Date.now(), name: newFriend }]);
    setNewFriend("");
  }

  function acceptFriend(id: number) {
    const friend = received.find(f => f.id === id);
    if (!friend) return;

    setFriends([...friends, friend]);
    setReceived(received.filter(f => f.id !== id));
  }

  function declineFriend(id: number) {
    setReceived(received.filter(f => f.id !== id));
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
            placeholder="Nome do amigo..."
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
            <div key={f.id}>{f.name}</div>
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
              <span>{f.name}</span>

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

      {/* ENVIADOS */}
      <div>
        <h2 className="text-lg mb-2">Convites enviados</h2>

        <div className="bg-sidebar-accent/30 rounded-xl p-3 space-y-2">
          {sent.length === 0 && <p>Nenhum convite enviado</p>}

          {sent.map((f) => (
            <div key={f.id} className="flex justify-between">
              <span>{f.name}</span>
              <span className="text-yellow-400 text-sm">Aguardando...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}