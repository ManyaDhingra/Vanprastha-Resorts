type User = {
  id: string
  name: string
  email: string
  password: string
  token?: string
}

// simple in-memory mock user store for development only
export const users: User[] = [
  {
    id: 'u-1',
    name: 'Test User',
    email: 'guest@vanprastha.example',
    password: 'password123',
    token: 'token-guest'
  }
]

export function findUserByEmail(email: string) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function findUserByToken(token?: string) {
  if (!token) return undefined
  return users.find((u) => u.token === token)
}

export function createUser({ name, email, password }: { name: string; email: string; password: string }) {
  const id = `u-${Date.now().toString(36)}`
  const token = `token-${id}`
  const user = { id, name, email, password, token }
  users.push(user)
  return user
}
