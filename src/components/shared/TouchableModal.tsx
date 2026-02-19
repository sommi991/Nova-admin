import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Touchable } from './Touchable'
import { X } from 'lucide-react'

interface TouchableModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  showCloseButton?: boolean
  closeOnBackdropTap?: boolean
  closeOnSwipeDown?: boolean
  className?: string
}

export const TouchableModal: React.FC<TouchableModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  closeOnBackdropTap = true,
  closeOnSwipeDown = true,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <Touchable
            onTap={closeOnBackdropTap ? onClose : undefined}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            />
          </Touchable>

          {/* Modal */}
          <Touchable
            onSwipe={closeOnSwipeDown ? (direction) => {
              if (direction === 'down') onClose()
            } : undefined}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 30 }}
              className={`relative glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 pointer-events-auto ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-dark-card/50 backdrop-blur-xl p-4 -m-6 mb-0 border-b border-dark-border">
                {title && (
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                )}
                
                {showCloseButton && (
                  <Touchable
                    onTap={onClose}
                    hapticFeedback
                    className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </Touchable>
                )}
              </div>

              {/* Content */}
              <div className="mt-6">
                {children}
              </div>

              {/* Swipe down hint */}
              {closeOnSwipeDown && (
                <div className="mt-4 text-center">
                  <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto" />
                  <p className="text-xs text-gray-500 mt-2">Swipe down to close</p>
                </div>
              )}
            </motion.div>
          </Touchable>
        </>
      )}
    </AnimatePresence>
  )
}
