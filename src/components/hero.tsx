import React from 'react'
import { Button } from './ui/button'
import LoginButton from './loginButton'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <nav className="h-[10vh] w-screen px-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold italic">x00m</h1>
        <LoginButton />
      </nav>
      <span className='flex gap-10'>
        <Link href={"/createx00m"}>
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
