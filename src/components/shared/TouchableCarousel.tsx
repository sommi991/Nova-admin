import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Touchable } from './Touchable'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TouchableCarouselProps {
  items: React.ReactNode[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  infinite?: boolean
  onItemTap?: (index: number) => void
  onItemDoubleTap?: (index: number) => void
  onItemLongPress?: (index: number) => void
  className?: string
}

export const TouchableCarousel: React.FC<TouchableCarouselProps> = ({
  items,
  autoPlay = false,
  autoPlayInterval = 3000,
  showArrows = true,
  showDots = true,
  infinite = true,
  onItemTap,
  onItemDoubleTap,
  onItemLongPress,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const autoplayTimerRef = useRef<NodeJS.Timeout>()

  const next = () => {
    setDirection(1)
    setCurrentIndex((prev) => {
      if (prev === items.length - 1) {
        return infinite ? 0 : prev
      }
      return prev + 1
    })
  }

  const prev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return infinite ? items.length - 1 : prev
      }
      return prev - 1
    })
  }

  // Auto-play
  React.useEffect(() => {
    if (autoPlay && !isPaused) {
      autoplayTimerRef.current = setInterval(next, autoPlayInterval)
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
      }
    }
  }, [autoPlay, autoPlayInterval, isPaused, items.length])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main carousel */}
      <AnimatePresence initial={false} custom={direction}>
        <Touchable
          key={currentIndex}
          onTap={() => onItemTap?.(currentIndex)}
          onDoubleTap={() => onItemDoubleTap?.(currentIndex)}
          onLongPress={() => onItemLongPress?.(currentIndex)}
          onSwipe={(swipeDirection) => {
            if (swipeDirection === 'left') next()
            if (swipeDirection === 'right') prev()
          }}
          className="w-full"
        >
          <motion.div
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {items[currentIndex]}
          </motion.div>
        </Touchable>
      </AnimatePresence>

      {/* Arrows */}
      {showArrows && (
        <>
          <Touchable
            onTap={prev}
            hapticFeedback
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-dark-card/80 backdrop-blur-sm rounded-full hover:bg-dark-card transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Touchable>

          <Touchable
            onTap={next}
            hapticFeedback
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-dark-card/80 backdrop-blur-sm rounded-full hover:bg-dark-card transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </Touchable>
        </>
      )}

      {/* Dots */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
          {items.map((_, index) => (
            <Touchable
              key={index}
              onTap={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              hapticFeedback
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-cosmic-purple'
                  : 'bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
