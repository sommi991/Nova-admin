import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Touchable } from './Touchable'

interface TouchableSliderProps {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  onRelease?: (value: number) => void
  showValue?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: number
  className?: string
}

export const TouchableSlider: React.FC<TouchableSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 50,
  onChange,
  onRelease,
  showValue = true,
  orientation = 'horizontal',
  size = 200,
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const currentValue = value ?? internalValue
  const percentage = ((currentValue - min) / (max - min)) * 100

  const handlePan = (x: number, y: number) => {
    if (!sliderRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    let newValue

    if (orientation === 'horizontal') {
      const dx = x
      const newPercentage = Math.max(0, Math.min(100, (dx / rect.width) * 100))
      newValue = min + (newPercentage / 100) * (max - min)
    } else {
      const dy = -y
      const newPercentage = Math.max(0, Math.min(100, (dy / rect.height) * 100))
      newValue = min + (newPercentage / 100) * (max - min)
    }

    // Round to step
    newValue = Math.round(newValue / step) * step
    newValue = Math.max(min, Math.min(max, newValue))

    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleRelease = () => {
    setIsDragging(false)
    onRelease?.(currentValue)
  }

  return (
    <div className={`flex items-center ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${className}`}>
      {/* Slider track */}
      <Touchable
        ref={sliderRef}
        onPan={(x, y) => handlePan(x, y)}
        onPanStart={() => setIsDragging(true)}
        onPanEnd={handleRelease}
        className={`relative ${
          orientation === 'horizontal'
            ? 'w-full h-12 cursor-grab active:cursor-grabbing'
            : 'h-full w-12 cursor-grab active:cursor-grabbing'
        }`}
        style={{
          width: orientation === 'horizontal' ? size : 48,
          height: orientation === 'horizontal' ? 48 : size
        }}
      >
        <div className={`absolute ${
          orientation === 'horizontal'
            ? 'top-1/2 left-0 right-0 h-2 -translate-y-1/2'
            : 'left-1/2 bottom-0 top-0 w-2 -translate-x-1/2'
        } bg-dark-hover rounded-full`}>
          {/* Filled track */}
          <div
            className={`absolute ${
              orientation === 'horizontal'
                ? 'left-0 top-0 bottom-0 bg-cosmic-purple rounded-full'
                : 'bottom-0 left-0 right-0 bg-cosmic-purple rounded-full'
            }`}
            style={{
              width: orientation === 'horizontal' ? `${percentage}%` : undefined,
              height: orientation === 'vertical' ? `${percentage}%` : undefined
            }}
          />
        </div>

        {/* Handle */}
        <motion.div
          className={`absolute ${
            orientation === 'horizontal'
              ? 'top-1/2 -translate-y-1/2'
              : 'left-1/2 -translate-x-1/2'
          } w-6 h-6 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing`}
          animate={{
            scale: isDragging ? 1.2 : 1,
            [orientation === 'horizontal' ? 'left' : 'bottom']: `${percentage}%`
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </Touchable>

      {/* Value display */}
      {showValue && (
        <div className={`${
          orientation === 'horizontal' ? 'ml-4' : 'mt-4'
        } glass-card px-4 py-2 rounded-lg`}>
          <p className="text-white font-medium">{currentValue.toFixed(0)}</p>
        </div>
      )}
    </div>
  )
}
