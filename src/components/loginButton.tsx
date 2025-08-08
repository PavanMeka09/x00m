"use client"
import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'

export default function LoginButton() {
  const { data: session } = useSession()
  if (session){
    return (
        <Button onClick={() => signOut()} variant={"secondary"} className='cursor-pointer'>Logout</Button>
    )
  }
  return (
    <Button onClick={() => signIn()} variant={"default"} className='cursor-pointer'>Login</Button>
  )
}