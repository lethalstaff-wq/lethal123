"use client"

import { useState, useEffect } from "react"
import { ShoppingBag } from "lucide-react"

// Плавный набор заказов: начинается с 0, растет на 2-3 заказа в час, максимум 25-49 в день
export function OrdersCounter() {
  const [orders, setOrders] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Вычисляем заказы на основе текущего времени дня
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const hoursPassed = (now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60)
    
    // 2-3 заказа в час, но с небольшой рандомизацией
    // Используем seed на основе даты чтобы число было одинаковым для всех пользователей в один момент
    const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
    const baseOrdersPerHour = 2 + (dateSeed % 2) // 2 или 3 заказа в час в зависимости от дня
    
    // Вычисляем базовое количество заказов
    let calculatedOrders = Math.floor(hoursPassed * baseOrdersPerHour)
    
    // Добавляем небольшую вариацию на основе часа (чтобы не было слишком линейно)
    const hourVariation = Math.floor(Math.sin(hoursPassed * 0.5) * 3 + 3)
    calculatedOrders += hourVariation
    
    // Ограничиваем максимум 25-49 (в зависимости от дня)
    const maxOrders = 12 + (dateSeed % 6) // 25-49
    calculatedOrders = Math.min(calculatedOrders, maxOrders)
    calculatedOrders = Math.max(calculatedOrders, 0)
    
    setOrders(calculatedOrders)
    
    // Обновляем каждые 20-40 минут с добавлением 1-2 заказов
    const interval = setInterval(() => {
      setOrders(prev => {
        const increment = Math.random() < 0.6 ? 1 : 2
        const newOrders = prev + increment
        // Проверяем максимум
        const currentMax = 12 + (dateSeed % 6)
        return Math.min(newOrders, currentMax)
      })
    }, (20 + Math.random() * 20) * 60 * 1000) // 20-40 минут
    
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/15 border border-primary/30 text-primary">
      <ShoppingBag className="h-3.5 w-3.5" />
      <span className="animate-pulse">{orders} orders today</span>
    </div>
  )
}
