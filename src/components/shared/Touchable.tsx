import React, { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { useGestures } from '../../hooks/useGestures'

interface TouchableProps extends MotionProps {
  children: React.ReactNode
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
  onPinch?: (scale: number) => void
  onRotate?: (angle: number) => void
  onPan?: (x: number, y: number) => void
  hapticFeedback?: boolean
  scaleOnTap?: boolean
  scaleOnHover?: boolean
  className?: string
  disabled?: boolean
  feedbackColor?: string
}

export const Touchable = forwardRef<HTMLDivElement, TouchableProps>(({
  children,
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipe,
  onPinch,
  onRotate,
  onPan,
  hapticFeedback = true,
  scaleOnTap = true,
  scaleOnHover = true,
  className = '',
  disabled = false,
  feedbackColor = 'rgba(139, 92, 246, 0.3)',
  ...motionProps
}, ref) => {
  const [isPressed, setIsPressed] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [touchPosition, setTouchPosition] = React.useState({ x: 0, y: 0 })

  const gestureHandlers = useGestures({
    onTap: !disabled ? onTap : undefined,
    onDoubleTap: !disabled ? onDoubleTap : undefined,
    onLongPress: !disabled ? onLongPress : undefined,
    onSwipe: !disabled ? onSwipe : undefined,
    onPinch: !disabled ? onPinch : undefined,
    onRotate: !disabled ? onRotate : undefined,
    onPan: !disabled ? onPan : undefined,
    hapticFeedback: !disabled && hapticFeedback
  })

  return (
    <motion.div
      ref={ref}
      className={`relative cursor-pointer select-none touch-manipulation ${className}`}
      animate={{
        scale: isPressed && scaleOnTap && !disabled ? 0.98 : isHovered && scaleOnHover && !disabled ? 1.02 : 1,
        transition: { type: 'spring', stiffness: 400, damping: 30 }
      }}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => !disabled && setIsHovered(false)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => !disabled && setIsPressed(false)}
      {...gestureHandlers}
      {...motionProps}
    >
      {/* Touch ripple effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-inherit"
        animate={{
          boxShadow: isPressed ? `0 0 0 2px ${feedbackColor}` : 'none',
          background: isPressed ? `radial-gradient(circle at ${touchPosition.x}px ${touchPosition.y}px, ${feedbackColor}, transparent 70%)` : 'none'
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Touch position tracker */}
      <div
        className="absolute inset-0 pointer-events-none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          setTouchPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          })
        }}
      />

      {children}

      {/* Gesture hints for discovery */}
      {!disabled && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark-card text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          animate={{ opacity: isHovered ? 0.8 : 0 }}
        >
          Tap • Double tap • Long press • Swipe • Pinch • Rotate
        </motion.div>
      )}
    </motion.div>
  )
})

Touchable.displayName = 'Touchable'
