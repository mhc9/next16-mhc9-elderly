'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { LayoutProvider } from '@/lib/contexts/LayoutContext'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LayoutProvider>
                <SessionProvider>{children}</SessionProvider>
            </LayoutProvider>
        </ThemeProvider>
    )
}
