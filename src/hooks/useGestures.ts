import { useRef, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface GestureConfig {
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
  onPinch?: (scale: number) => void
  onRotate?: (angle: number) => void
  onPan?: (x: number, y: number) => void
  hapticFeedback?: boolean
  vibrationPattern?: number[]
}

export const useGestures = (config: GestureConfig) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTapRef = useRef<number>(0)
  const longPressTimerRef = useRef<NodeJS.Timeout>()
  const initialDistanceRef = useRef<number>(0)
  const initialAngleRef = useRef<number>(0)

  // Haptic feedback
  const triggerHaptic = (pattern: number[] = [30]) => {
    if (config.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Calculate distance between two touches
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Calculate angle between two touches
  const getAngle = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }

  // Touch start handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault?.()
    
    const touches = e.touches
    const touch = touches[0]

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    // Handle multi-touch gestures
    if (touches.length === 2) {
      initialDistanceRef.current = getDistance(touches[0], touches[1])
      initialAngleRef.current = getAngle(touches[0], touches[1])
    }

    // Long press detection
    longPressTimerRef.current = setTimeout(() => {
      if (config.onLongPress) {
        config.onLongPress()
        triggerHaptic([50, 30, 50]) // Distinct pattern for long press
        toast.success('Long press detected!', { icon: '👆', duration: 1000 })
      }
    }, 500)
  }, [config])

  // Touch move handler
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault?.()
    
    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    const touches = e.touches

    // Handle pinch gesture
    if (touches.length === 2 && config.onPinch) {
      const distance = getDistance(touches[0], touches[1])
      const scale = distance / initialDistanceRef.current
      config.onPinch(scale)
      triggerHaptic([10]) // Light feedback for pinch
    }

    // Handle rotate gesture
    if (touches.length === 2 && config.onRotate) {
      const angle = getAngle(touches[0], touches[1])
      const rotation = angle - initialAngleRef.current
      config.onRotate(rotation)
    }

    // Handle pan gesture
    if (touches.length === 1 && config.onPan && touchStartRef.current) {
      const dx = touches[0].clientX - touchStartRef.current.x
      const dy = touches[0].clientY - touchStartRef.current.y
      config.onPan(dx, dy)
    }
  }, [config])

  // Touch end handler
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault?.()
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    const timeDiff = Date.now() - touchStartRef.current.time
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Check for swipe
    if (distance > 50 && timeDiff < 300 && config.onSwipe) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) {
          config.onSwipe('right')
          triggerHaptic([20, 10, 20])
          toast.success('👉 Swiped right!', { duration: 800 })
        } else {
          config.onSwipe('left')
          triggerHaptic([20, 10, 20])
          toast.success('👈 Swiped left!', { duration: 800 })
        }
      } else {
        // Vertical swipe
        if (dy > 0) {
          config.onSwipe('down')
          triggerHaptic([20, 10, 20])
          toast.success('👇 Swiped down!', { duration: 800 })
        } else {
          config.onSwipe('up')
          triggerHaptic([20, 10, 20])
          toast.success('👆 Swiped up!', { duration: 800 })
        }
      }
    } 
    // Check for tap/double tap
    else if (distance < 10 && timeDiff < 200) {
      const now = Date.now()
      if (now - lastTapRef.current < 300 && config.onDoubleTap) {
        // Double tap
        config.onDoubleTap()
        triggerHaptic([20, 20, 20])
        toast.success('👆👆 Double tap!', { icon: '✨', duration: 1000 })
        lastTapRef.current = 0
      } else {
        // Single tap
        lastTapRef.current = now
        setTimeout(() => {
          if (lastTapRef.current === now) {
            if (config.onTap) {
              config.onTap()
              triggerHaptic([15])
              toast.success('👆 Tap!', { duration: 600 })
            }
            lastTapRef.current = 0
          }
        }, 300)
      }
    }

    touchStartRef.current = null
  }, [config])

  // Touch cancel handler
  const handleTouchCancel = useCallback((e: React.TouchEvent) => {
    e.preventDefault?.()
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    touchStartRef.current = null
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel
  }
}
