"use client"

import Image from "next/image"

interface IconProps {
  className?: string
}

export function BitcoinIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Image src="/images/icons/bitcoin.svg" alt="Bitcoin" width={32} height={32} className={className} />
  )
}

export function EthereumIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Image src="/images/icons/ethereum.svg" alt="Ethereum" width={32} height={32} className={className} />
  )
}

export function TetherIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Image src="/images/icons/tether.svg" alt="Tether" width={32} height={32} className={className} />
  )
}

export function LitecoinIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Image src="/images/icons/litecoin.svg" alt="Litecoin" width={32} height={32} className={className} />
  )
}

export function PayPalIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Image src="/images/icons/paypal.svg" alt="PayPal" width={24} height={24} className={className} />
  )
}

export function DiscordIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Image src="/images/icons/discord.svg" alt="Discord" width={24} height={24} className={className} />
  )
}
