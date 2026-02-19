import React, { useState } from 'react'
import { Touchable } from './Touchable'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface TouchableRatingProps {
  value?: number
  max?: number
  size?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  className?: string
}

export const TouchableRating: React.FC<TouchableRatingProps> = ({
  value = 0,
  max = 5,
  size = 32,
  onChange,
  readOnly = false,
  className = ''
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const displayValue = hoverValue !== null ? hoverValue : value

  const handleStarTap = (index: number) => {
    if (readOnly) return
    onChange?.(index)
  }

  const handleStarHover = (index: number) => {
    if (readOnly || isDragging) return
    setHoverValue(index)
  }

  const handleStarLeave = () => {
    if (readOnly || isDragging) return
    setHoverValue(null)
  }

  const handlePan = (x: number) => {
    if (readOnly) return
    
    setIsDragging(true)
    const starIndex = Math.floor((x / (size * max)) * max) + 1
    const newValue = Math.max(1, Math.min(max, starIndex))
    setHoverValue(newValue)
    onChange?.(newValue)
  }

  const handlePanEnd = () => {
    setIsDragging(false)
    setHoverValue(null)
  }

  return (
    <Touchable
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      className={`inline-flex items-center space-x-1 ${className}`}
    >
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= displayValue
        const isHalf = !isFilled && starValue - 0.5 <= displayValue

        return (
          <Touchable
            key={index}
            onTap={() => handleStarTap(starValue)}
            onHoverStart={() => handleStarHover(starValue)}
            onHoverEnd={handleStarLeave}
            hapticFeedback={!readOnly}
            scaleOnTap={!readOnly}
            disabled={readOnly}
          >
            <motion.div
              animate={{
                scale: isFilled ? 1.1 : 1,
                rotate: isFilled ? [0, -10, 10, 0] : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <Star
                size={size}
                className={`transition-colors ${
                  isFilled
                    ? 'fill-gold text-gold'
                    : isHalf
                    ? 'fill-gold/50 text-gold'
                    : 'text-gray-600'
                }`}
              />
            </motion.div>
          </Touchable>
        )
      })}
    </Touchable>
  )
}
