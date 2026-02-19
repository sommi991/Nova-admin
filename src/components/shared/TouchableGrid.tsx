import React from 'react'
import { motion } from 'framer-motion'
import { Touchable } from './Touchable'

interface TouchableGridProps<T> {
  items: T[]
  onItemTap?: (item: T, index: number) => void
  onItemDoubleTap?: (item: T, index: number) => void
  onItemLongPress?: (item: T, index: number) => void
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  columns?: number
  gap?: number
  className?: string
}

export function TouchableGrid<T>({
  items,
  onItemTap,
  onItemDoubleTap,
  onItemLongPress,
  renderItem,
  keyExtractor,
  columns = 3,
  gap = 16,
  className = ''
}: TouchableGridProps<T>) {
  return (
    <div
      className={`grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {items.map((item, index) => (
        <Touchable
          key={keyExtractor(item, index)}
          onTap={() => onItemTap?.(item, index)}
          onDoubleTap={() => onItemDoubleTap?.(item, index)}
          onLongPress={() => onItemLongPress?.(item, index)}
          scaleOnTap={true}
          hapticFeedback={true}
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="glass-card overflow-hidden"
          >
            {renderItem(item, index)}
          </motion.div>
        </Touchable>
      ))}
    </div>
  )
}
