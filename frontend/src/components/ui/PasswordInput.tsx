'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { inputClass } from '@/lib/ui';

export default function PasswordInput({
    id,
    value,
    onChange,
    autoComplete,
    minLength
}: {
    id: string
    value: string
    onChange: (value: string) => void
    autoComplete: string
    minLength?: number
}){
    const [show, setShow] = useState(false)

    return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        maxLength={72}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-600"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}