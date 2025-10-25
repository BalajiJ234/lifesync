'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface LogoProps {
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    animated?: boolean
}

export default function Logo({ size = 'md', showText = true, animated = true }: LogoProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationFrameRef = useRef<number | undefined>(undefined)

    const sizes = {
        sm: { canvas: 32, text: 'text-lg' },
        md: { canvas: 40, text: 'text-2xl' },
        lg: { canvas: 48, text: 'text-3xl' },
    }

    const config = sizes[size]

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        const canvasSize = config.canvas

        canvas.width = canvasSize * dpr
        canvas.height = canvasSize * dpr
        canvas.style.width = `${canvasSize}px`
        canvas.style.height = `${canvasSize}px`

        ctx.scale(dpr, dpr)

        let rotation = 0
        let pulsePhase = 0

        const draw = () => {
            ctx.clearRect(0, 0, canvasSize, canvasSize)

            const centerX = canvasSize / 2
            const centerY = canvasSize / 2

            // Animated pulse effect
            if (animated) {
                pulsePhase += 0.05
                const pulse = Math.sin(pulsePhase) * 0.1 + 1
                ctx.save()
                ctx.translate(centerX, centerY)
                ctx.scale(pulse, pulse)
                ctx.translate(-centerX, -centerY)
            }

            // Gradient background circle
            const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize)
            gradient.addColorStop(0, '#10b981')
            gradient.addColorStop(1, '#059669')

            ctx.beginPath()
            ctx.arc(centerX, centerY, canvasSize * 0.42, 0, Math.PI * 2)
            ctx.fillStyle = gradient
            ctx.fill()

            // Shield outline (privacy symbol)
            ctx.save()
            ctx.translate(centerX, centerY)

            if (animated) {
                rotation += 0.01
                ctx.rotate(rotation)
            }

            // Shield path
            ctx.beginPath()
            ctx.moveTo(0, -canvasSize * 0.3)
            ctx.lineTo(-canvasSize * 0.22, -canvasSize * 0.18)
            ctx.lineTo(-canvasSize * 0.22, 0)
            ctx.quadraticCurveTo(-canvasSize * 0.22, canvasSize * 0.2, 0, canvasSize * 0.32)
            ctx.quadraticCurveTo(canvasSize * 0.22, canvasSize * 0.2, canvasSize * 0.22, 0)
            ctx.lineTo(canvasSize * 0.22, -canvasSize * 0.18)
            ctx.closePath()

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
            ctx.lineWidth = 1.5
            ctx.stroke()

            ctx.restore()

            if (animated) {
                ctx.restore()
            }

            // Sync arrows (circular arrows showing data sync)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.lineWidth = 2
            ctx.lineCap = 'round'

            // Top arrow
            ctx.beginPath()
            ctx.arc(centerX, centerY, canvasSize * 0.15, -Math.PI * 0.7, -Math.PI * 0.3, false)
            ctx.stroke()

            // Arrow head
            ctx.beginPath()
            ctx.moveTo(centerX + canvasSize * 0.08, centerY - canvasSize * 0.12)
            ctx.lineTo(centerX + canvasSize * 0.12, centerY - canvasSize * 0.08)
            ctx.lineTo(centerX + canvasSize * 0.06, centerY - canvasSize * 0.08)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.fill()

            // Bottom arrow
            ctx.beginPath()
            ctx.arc(centerX, centerY, canvasSize * 0.15, Math.PI * 0.3, Math.PI * 0.7, false)
            ctx.stroke()

            // Arrow head
            ctx.beginPath()
            ctx.moveTo(centerX - canvasSize * 0.08, centerY + canvasSize * 0.12)
            ctx.lineTo(centerX - canvasSize * 0.12, centerY + canvasSize * 0.08)
            ctx.lineTo(centerX - canvasSize * 0.06, centerY + canvasSize * 0.08)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.fill()

            // Central dot
            ctx.beginPath()
            ctx.arc(centerX, centerY, canvasSize * 0.05, 0, Math.PI * 2)
            ctx.fillStyle = 'white'
            ctx.fill()

            if (animated) {
                animationFrameRef.current = requestAnimationFrame(draw)
            }
        }

        draw()

        if (!animated) {
            // Draw once if not animated
            return
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [animated, config.canvas])

    return (
        <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
            <canvas
                ref={canvasRef}
                className="transition-transform group-hover:scale-110"
            />
            {showText && (
                <span className={`${config.text} font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent`}>
                    LifeSync
                </span>
            )}
        </Link>
    )
}
