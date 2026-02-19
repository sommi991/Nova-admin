import React, { useState } from 'react'
import { Touchable } from './Touchable'
import { motion } from 'framer-motion'

interface TouchableColorPickerProps {
  colors?: string[]
  value?: string
  onChange?: (color: string) => void
  columns?: number
  className?: string
}

const DEFAULT_COLORS = [
  '#8B5CF6', '#2DD4BF', '#F97316', '#10B981',
  '#EF4444', '#3B82F6', '#EC4899', '#F59E0B',
  '#6366F1', '#14B8A6', '#8B5CF6', '#2DD4BF'
]

export const TouchableColorPicker: React.FC<TouchableColorPickerProps> = ({
  colors = DEFAULT_COLORS,
  value,
  onChange,
  columns = 4,
  className = ''
}) => {
  const [selectedColor, setSelectedColor] = useState(value || colors[0])

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    onChange?.(color)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Color grid */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`
        }}
      >
        {colors.map((color, index) => (
          <Touchable
            key={index}
            onTap={() => handleColorSelect(color)}
            hapticFeedback
            scaleOnTap
            className="relative"
          >
            <motion.div
              className="w-full aspect-square rounded-lg cursor-pointer"
              style={{ backgroundColor: color }}
              animate={{
                scale: selectedColor === color ? 1.1 : 1,
                boxShadow: selectedColor === color
                  ? `0 0 0 2px white, 0 0 0 4px ${color}`
                  : 'none'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </Touchable>
        ))}
      </div>

      {/* Selected color display */}
      <div className="glass-card p-4 flex items-center space-x-4">
        <div
          className="w-12 h-12 rounded-lg"
          style={{ backgroundColor: selectedColor }}
        />
        <div>
          <p className="text-white text-sm font-medium">Selected Color</p>
          <p className="text-gray-400 text-xs mt-1">{selectedColor}</p>
        </div>
      </div>
    </div>
  )
}
