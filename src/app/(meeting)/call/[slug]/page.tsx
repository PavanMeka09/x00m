"use client"

import { use } from "react"

export default function page({
  params,
}: {
  params: Promise<{ slug: string }>
})
{
  const { slug } = use(params)
  return (
    <div>
      <h1>{slug}</h1>
    </div>
  )
}