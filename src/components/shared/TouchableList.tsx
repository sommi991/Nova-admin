import React, { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Touchable } from './Touchable'
import { GripVertical, ChevronRight } from 'lucide-react'

interface TouchableListItem {
  id: string
  [key: string]: any
}

interface TouchableListProps<T extends TouchableListItem> {
  items: T[]
  onReorder?: (items: T[]) => void
  onItemTap?: (item: T) => void
  onItemDoubleTap?: (item: T) => void
  onItemLongPress?: (item: T) => void
  onItemSwipeLeft?: (item: T) => void
  onItemSwipeRight?: (item: T) => void
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
  reorderable?: boolean
  className?: string
}

export function TouchableList<T extends TouchableListItem>({
  items,
  onReorder,
  onItemTap,
  onItemDoubleTap,
  onItemLongPress,
  onItemSwipeLeft,
  onItemSwipeRight,
  renderItem,
  keyExtractor,
  reorderable = true,
  className = ''
}: TouchableListProps<T>) {
  const [listItems, setListItems] = useState(items)

  const handleReorder = (newOrder: T[]) => {
    setListItems(newOrder)
    onReorder?.(newOrder)
  }

  return (
    <Reorder.Group
      axis="y"
      values={listItems}
      onReorder={handleReorder}
      className={`space-y-2 ${className}`}
    >
      {listItems.map((item) => (
        <Reorder.Item
          key={keyExtractor(item)}
          value={item}
          className="relative"
        >
          <Touchable
            onTap={() => onItemTap?.(item)}
            onDoubleTap={() => onItemDoubleTap?.(item)}
            onLongPress={() => onItemLongPress?.(item)}
            onSwipe={(direction) => {
              if (direction === 'left') onItemSwipeLeft?.(item)
              if (direction === 'right') onItemSwipeRight?.(item)
            }}
            className="w-full"
          >
            <motion.div
              layout
              className="glass-card p-4 flex items-center space-x-3"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {reorderable && (
                <div className="cursor-move text-gray-400 hover:text-white">
                  <GripVertical className="w-5 h-5" />
                </div>
              )}
              
              <div className="flex-1">
                {renderItem(item)}
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </Touchable>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
