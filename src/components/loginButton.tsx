"use client"
import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'

export default function LoginButton() {
  const { data: session } = useSession()
  
  if (session){
    return (
      <Button onClick={() => signOut}>Logout</Button>
    )
  }
  return (
    <>
      {/* <Avatar></Avatar> */}
      <Button onClick={() => signIn()} variant={"default"} className='cursor-pointer'>Login</Button>
    </>
  )
}