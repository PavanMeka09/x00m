"use client"

import Link from 'next/link'
import React from 'react'

export default function page() {
  const asd = "Ad"
  return (
    <div>
      <Link href={`/call/${asd}`}>Join</Link>
    </div>
  )
}
