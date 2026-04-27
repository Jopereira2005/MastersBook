export interface User {
  id: string;
  name: string;
  email: string;
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
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) throw new Error("Email ou senha inválidos");

    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    return user;
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const users = getUsers();

    if (users.find(u => u.email === email)) {
      throw new Error("Email já cadastrado");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };

    users.push(newUser);
    saveUsers(users);

    localStorage.setItem(CURRENT_KEY, JSON.stringify(newUser));

    return newUser;
  },

  logout() {
    localStorage.removeItem(CURRENT_KEY);
  },

  update(user: User) {
    const users = getUsers().map(u => (u.id === user.id ? user : u));
    saveUsers(users);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  },
};