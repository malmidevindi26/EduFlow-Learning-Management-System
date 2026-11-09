'use client'

import { BookOpen } from 'lucide-react'
import { useState } from 'react'

export default function Thumbnail({
    src,
    title,
    gradient
}: {
    src: string | null
    title: string
    gradient: string
}) {
    const [failed, setFailed] = useState(false)
    
    if(!src || failed){
        return (
          <div className={`flex h-40 items-center justify-center bg-linear-to-br ${gradient} text-white`}>
            <BookOpen size={44} className="opacity-90" />
          </div>
        );
    }

    return (
        <img src={src} alt={title} onError={() => setFailed(true)} className="h-40 w-full object-cover" />
    )
}