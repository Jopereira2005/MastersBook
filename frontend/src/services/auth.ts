export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  password: string;
}

const STORAGE_KEY = "rpg_users";
const CURRENT_KEY = "rpg_current_user";

function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const authService = {
  current(): User | null {
    const data = localStorage.getItem(CURRENT_KEY);
    return data ? JSON.parse(data) : null;
  },

async login(email: string, password: string): Promise<User> {
  const res = await fetch("https://mastersbook-api.onrender.com/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
console.log("REGISTER RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.error || "Erro ao fazer login");
  }

  const user: User = {
    id: data.user.id,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    email: data.user.email,
    avatarUrl: data.user.avatarUrl || "",
    password: "" // não precisa guardar senha
  };

  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));

  return user;
},

async register(firstName: string, lastName: string, email: string, password: string): Promise<User> {
  const username = `${firstName}_${lastName}`.toLowerCase();

  const res = await fetch("https://mastersbook-api.onrender.com/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
    username,
    firstName,
    lastName,
    email,
    password
  })
});

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro ao cadastrar");
  }

  const user: User = {
    id: data.user.id,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    email: data.user.email,
    avatarUrl: data.user.avatarUrl || "",
    password: ""
  };

  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));

  return user;
},

  logout() {
    localStorage.removeItem(CURRENT_KEY);
  },

  update(user: User) {
    const users = getUsers().map(u => (u.id === user.id ? user : u));
    saveUsers(users);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  },

  async updateProfile(
    id: string,
    firstName: string,
    lastName: string,
    avatar: string
  ): Promise<User> {
    const username = `${firstName}_${lastName}`.toLowerCase();

    const res = await fetch(`https://mastersbook-api.onrender.com/api/users/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        firstName,
        lastName,
        avatarUrl: avatar
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao atualizar perfil");
    }

    const updatedUser: User = {
      id: data.user.id,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      email: data.user.email,
      avatarUrl: data.user.avatarUrl || "",
      password: ""
    };

    localStorage.setItem(CURRENT_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  },
};