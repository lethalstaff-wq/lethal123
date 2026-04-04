"use client"

interface IconProps {
  className?: string
}

export function BitcoinIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        d="M22.5 14.2c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.8-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3l-2.2-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.1c0 0 .1 0 .1 0l-.1 0-1.1 4.4c-.1.2-.3.5-.7.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5 .3 5.9-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4 1-5.1.7l.9-3.7c1.1.3 4.7.8 4.2 3zm.5-5.3c-.5 1.9-3.4.9-4.3.7l.8-3.3c1 .2 4 .7 3.5 2.6z"
        fill="white"
      />
    </svg>
  )
}

export function EthereumIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16.5 4v8.9l7.5 3.3L16.5 4z" fill="white" fillOpacity="0.6" />
      <path d="M16.5 4L9 16.2l7.5-3.3V4z" fill="white" />
      <path d="M16.5 21.9v6.1l7.5-10.4-7.5 4.3z" fill="white" fillOpacity="0.6" />
      <path d="M16.5 28v-6.1L9 17.6l7.5 10.4z" fill="white" />
      <path d="M16.5 20.6l7.5-4.4-7.5-3.3v7.7z" fill="white" fillOpacity="0.2" />
      <path d="M9 16.2l7.5 4.4v-7.7L9 16.2z" fill="white" fillOpacity="0.6" />
    </svg>
  )
}

export function TetherIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        d="M17.9 17.1v0c-.1 0-.7.1-2 .1-1 0-1.7 0-2-.1v0c-3.9-.2-6.8-.9-6.8-1.8s2.9-1.6 6.8-1.8v2.9c.3 0 1 .1 2 .1s1.8-.1 2-.1v-2.9c3.9.2 6.8.9 6.8 1.8s-2.9 1.6-6.8 1.8zm0-3.9V10.8h5.6V7.6H8.5v3.2h5.5v2.4c-4.4.2-7.7 1.2-7.7 2.3s3.3 2.1 7.7 2.3v8.3h3.9v-8.3c4.4-.2 7.7-1.2 7.7-2.3s-3.3-2.1-7.7-2.3z"
        fill="white"
      />
    </svg>
  )
}

export function LitecoinIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#345D9D" />
      <path
        d="M10.5 24h11.7l.9-3.4H14l1.8-6.7 3.2-1.2.6-2.3-3.2 1.2 2.2-8H14.8L11.7 16l-2.3.8-.7 2.5 2.3-.8L10.5 24z"
        fill="white"
      />
    </svg>
  )
}

export function PayPalIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#003087" />
      <path d="M15.63 8.4c.08-.53.06-1.06-.15-1.54-.45-1.05-1.56-1.5-2.97-1.5h-3.85c-.27 0-.5.2-.55.46L6.77 14.5c-.03.2.12.38.32.38h2.3l.58-3.66-.02.12c.05-.27.28-.46.55-.46h1.14c2.25 0 4-0.91 4.52-3.56.02-.08.03-.15.04-.22-.07-.03-.07-.03 0 0 .15-.62.15-1.15-.57-1.7z" fill="#fff" fillOpacity="0.7" />
      <path d="M16.2 8.7c-.55 2.65-2.27 3.56-4.52 3.56H10.54c-.27 0-.5.2-.55.46l-.74 4.66h1.5c.24 0 .44-.17.48-.4l.02-.1.38-2.38.02-.14c.04-.24.24-.4.48-.4h.3c1.96 0 3.49-.8 3.94-3.1.19-.96.09-1.76-.41-2.32" fill="#fff" />
    </svg>
  )
}

export function DiscordIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#5865F2" />
      <path d="M17.2 8.1a11 11 0 00-2.7-.84l-.12.24a10.2 10.2 0 00-3.03 0l-.12-.24a11 11 0 00-2.7.84S6.5 10.8 6.1 14.8a11.2 11.2 0 003.1 1.57l.25-.31a7 7 0 01-1.56-.75l.18-.14a7.9 7.9 0 006.86 0l.18.14a7 7 0 01-1.56.75l.25.31a11.2 11.2 0 003.1-1.57c-.4-4-1.4-6.7-1.7-6.7zM10.4 14c-.5 0-.92-.47-.92-1.04s.41-1.04.92-1.04.93.47.92 1.04c0 .57-.41 1.04-.92 1.04zm3.2 0c-.5 0-.92-.47-.92-1.04s.41-1.04.92-1.04.93.47.92 1.04c0 .57-.41 1.04-.92 1.04z" fill="white" />
    </svg>
  )
}
