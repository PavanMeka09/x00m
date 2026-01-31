"use client"

import { Button } from './ui/button'
import LoginButton from './loginButton'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Hero() {

  const { data: session } = useSession()

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <nav className="h-[10vh] w-screen px-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold italic">x00m</h1>

        <div className='flex justify-center items-center gap-2'>
          {session && (<><img className='rounded-full h-10' src={session?.user?.image} alt="profile pic" />
          <h1>{session?.user?.name}</h1></>)
          }
          <LoginButton />
        </div>
      </nav>
      <span className='flex gap-10'>
        <Link href={"/create"}>
          <Button variant={"outline"} className='cursor-pointer'>
            create a meeting
          </Button>
        </Link>
        <Link href={"/join"}>
          <Button variant={"outline"} className='cursor-pointer'>
            join a meeting x00m
          </Button>
        </Link>
      </span>
      <div className="h-[90vh] w-screen flex items-center justify-evenly text-2xl font-extralight">
        <span className="h-60 w-100 border-2 rounded flex justify-center items-center">Video Call</span>
        <span className="h-60 w-100 border-2 rounded flex justify-center items-center">Sketch</span>
      </div>
    </div>
  )
}
