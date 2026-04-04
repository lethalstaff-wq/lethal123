"use client"

import { Button } from "@/components/ui/button"
import { Mail, Zap, Shield, Headphones, ArrowRight } from "lucide-react"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export function ContactSection() {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        {/* CTA Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Ready to <span className="text-primary">dominate</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join hundreds of gamers who trust Lethal Solutions. Our team is available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Discord - Primary */}
          <a
            href="https://discord.gg/lethaldma"
            target="_blank"
            rel="noopener noreferrer"
            className="group col-span-1 md:col-span-2 block"
          >
            <div className="relative rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-8 hover:bg-primary/10 transition-all duration-300 hover:border-primary/50 h-full">
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-2xl bg-primary text-primary-foreground group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                  <DiscordIcon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Join our Discord</h3>
                  <p className="text-muted-foreground text-sm mb-4">Open a ticket in #contact-us for purchases, setup help, or any questions.</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-primary" />
                      Fastest response
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3 w-3 text-primary" />
                      Secure
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Headphones className="h-3 w-3 text-primary" />
                      24/7
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform mt-1 hidden sm:block" />
              </div>
            </div>
          </a>

          {/* Email */}
          <a href="mailto:support@lethalsolutions.me" className="group block">
            <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 hover:border-primary/30 transition-all duration-300 h-full flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Email</h3>
                <p className="text-sm text-muted-foreground">support@lethalsolutions.me</p>
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Send email <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
