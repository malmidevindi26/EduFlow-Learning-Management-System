'use client'

import { AlertTriangle, HelpCircle } from "lucide-react"
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react"
import { primaryBtn, secondaryBtn } from "@/lib/ui"

interface ConfirmOptions {
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
}

type ConfirmFn = (Options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

const dangerBtn = 'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98]'

export function ConfirmProvider({ children }: { children: ReactNode }){
    const [options, setOptions] = useState<ConfirmOptions | null>(null)
    const resolver = useRef<((value: boolean) => void) | null>(null)
    const cancelRef = useRef<HTMLButtonElement>(null)

    const confirm = useCallback<ConfirmFn>((opts) => {
        resolver.current?.(false)
        return new Promise<boolean>((resolve) => {
            resolver.current = resolve
            setOptions(opts)
        })
    }, [])

    const close = useCallback((result: boolean) => {
        resolver.current?.(result)
        resolver.current = null
        setOptions(null)
    }, [])

    useEffect(() => {
        if(!options) return
        cancelRef.current?.focus()
        const onKey = (e: KeyboardEvent) => {
            if(e.key === 'Escape') close(false)
        }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    }, [options, close])

    return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => close(false)} />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="relative w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  options.danger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}
              >
                {options.danger ? <AlertTriangle size={22} /> : <HelpCircle size={22} />}
              </span>
              <div className="min-w-0">
                <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
                  {options.title}
                </h2>
                {options.message && <p className="mt-1 text-sm text-slate-600">{options.message}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button ref={cancelRef} type="button" onClick={() => close(false)} className={secondaryBtn}>
                {options.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={options.danger ? dangerBtn : primaryBtn}
              >
                {options.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
  export function useConfirm(){
    const confirm = useContext(ConfirmContext)
    if(!confirm) throw new Error('useConfirm must be used inside ConfirmProvider')
        return confirm 
  }
