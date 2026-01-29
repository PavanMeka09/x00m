import { auth } from '@/lib/auth'

export const getCurrentUser = async () => {
  const session = await auth()
  return {
    name: session?.user.name,
    email: session?.user.email,
    image: session?.user.image
  }
}