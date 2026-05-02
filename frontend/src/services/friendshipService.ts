const API_URL = "https://mastersbook-api.onrender.com/api";

export async function getFriends(userId: string) {
  const res = await fetch(`${API_URL}/friendships/friends/${userId}`);
  return res.json();
}

export async function getPending(userId: string) {
  const res = await fetch(`${API_URL}/friendships/pending/${userId}`);
  return res.json();
}

export async function sendInvite(senderId: string, receiverIdentifier: string) {
  const res = await fetch(`${API_URL}/friendships/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId,
      receiverIdentifier,
    }),
  });

  return res.json();
}

export async function acceptInvite(id: string) {
  await fetch(`${API_URL}/friendships/accept/${id}`, {
    method: "PATCH",
  });
}

export async function declineInvite(id: string) {
  await fetch(`${API_URL}/friendships/decline/${id}`, {
    method: "DELETE",
  });
}