"use client"

import Link from 'next/link'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'

export default function page() {
  const [meetingId, setMeetingId] = useState('');

  return (
    <div>
      <Input type="text" name="" id="" className='w-100' maxLength={8} placeholder='meeting id' onChange={(e) => {
        setMeetingId(e.target.value)
      }}/>
      <Link href={`/room/${meetingId}`}>Join</Link>
    </div>
  )
}
