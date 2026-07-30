import { loginWithMagicLink, loginWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { Mail } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; type?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;
  const messageType = resolvedSearchParams?.type ?? 'error';

  return (
    <div className="flex-1 flex flex-col w-full px-4 sm:px-8 justify-center gap-2 mx-auto min-h-screen max-w-md">
      {/* Logo & Brand */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          <Logo className="w-16 h-16" showShadow={false} />
        </div>
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">
          <span className="text-[#3D2436]">Besok</span>
          <span className="text-[#C22C63]">Aja</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
          Manajemen tugas yang cerdas & terpusat
        </p>
      </div>

      {/* Login Card */}
      <div 
        className="relative bg-[var(--clay)] p-8 sm:p-10 rounded-[var(--r-lg)] flex flex-col gap-6 w-full mt-4" 
        style={{ boxShadow: '20px 20px 40px var(--shadow-dark), -20px -20px 40px var(--shadow-light)' }}
      >
        <div className="text-center">
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Selamat Datang
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Masuk atau daftar untuk mulai mengelola tugas
          </p>
        </div>

        <form className="flex flex-col w-full gap-4 text-foreground">
          
          {/* Google OAuth Button */}
          <Button
            formAction={loginWithGoogle}
            formNoValidate
            className="w-full h-[48px] text-[14px] font-[700] text-[var(--ink)] bg-[var(--clay-raised)] hover:bg-white transition-all duration-200 border-none rounded-[var(--r-md)]"
            style={{ boxShadow: '5px 5px 12px var(--shadow-dark), -5px -5px 12px var(--shadow-light)' }}
            type="submit"
          >
            <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Lanjut dengan Google
          </Button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--clay)] px-3 text-muted-foreground font-[600]">
                Atau gunakan Magic Link
              </span>
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-[600] text-[var(--ink-soft)]" htmlFor="email">
              Email
            </label>
            <Input
              className="rounded-[var(--r-sm)] bg-[var(--clay-raised)] border-none h-[48px] px-[16px] focus-visible:ring-2 focus-visible:ring-[var(--blossom)] text-[var(--ink)] font-[500] placeholder:text-[var(--ink-faint)]"
              style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}
              name="email"
              id="email"
              type="email"
              placeholder="Masukan Email Anda"
              required
              autoComplete="email"
            />
          </div>
          
          {/* Magic Link Button */}
          <Button
            formAction={loginWithMagicLink}
            className="w-full h-[48px] text-[14px] font-[700] text-white bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] hover:brightness-110 active:scale-95 transition-all rounded-[var(--r-md)] mt-2"
            style={{ boxShadow: '5px 5px 12px var(--shadow-dark), -5px -5px 12px var(--shadow-light)' }}
            type="submit"
          >
            <Mail className="w-4 h-4 mr-2 shrink-0" />
            Kirim Magic Link
          </Button>

          {/* Message Display */}
          {message && (
            <div className={`mt-2 p-4 text-center text-sm rounded-clay shadow-clay-inset leading-relaxed
              ${message.startsWith('✅') 
                ? 'bg-success/10 text-success font-medium' 
                : 'bg-destructive/10 text-destructive font-medium'
              }`}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        Dengan masuk, Anda menyetujui bahwa data tugas Anda disimpan secara aman di cloud.
      </p>
    </div>
  )
}
