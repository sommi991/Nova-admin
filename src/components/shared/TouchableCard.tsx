import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Touchable } from './Touchable'
import { 
  Maximize2, Minimize2, X, Check, Copy, 
  Edit, Trash2, Share2, Heart, Star 
} from 'lucide-react'

interface TouchableCardProps {
  children: React.ReactNode
  title?: string
  image?: string
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onRotate?: (angle: number) => void
  actions?: {
    icon: React.ElementType
    label: string
    onTap: () => void
    color?: string
  }[]
  expandable?: boolean
  deletable?: boolean
  editable?: boolean
  shareable?: boolean
  favoritable?: boolean
  className?: string
}

export const TouchableCard: React.FC<TouchableCardProps> = ({
  children,
  title,
  image,
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onRotate,
  actions = [],
  expandable = false,
  deletable = false,
  editable = false,
  shareable = false,
  favoritable = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  return (
    <Touchable
      onTap={onTap}
      onDoubleTap={onDoubleTap || (() => setIsExpanded(!isExpanded))}
      onLongPress={onLongPress || (() => console.log('Long press'))}
      onSwipe={(direction) => {
        switch(direction) {
          case 'left': onSwipeLeft?.(); break
          case 'right': onSwipeRight?.(); break
          case 'up': onSwipeUp?.(); break
          case 'down': onSwipeDown?.(); break
        }
      }}
      onPinch={(s) => {
        setScale(s)
        onPinch?.(s)
      }}
      onRotate={(r) => {
        setRotation(r)
        onRotate?.(r)
      }}
      className={`group ${className}`}
    >
      <motion.div
        className="glass-card overflow-hidden"
        animate={{
          scale,
          rotateZ: rotation,
          height: isExpanded ? 'auto' : 'auto'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Image section */}
        {image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Overlay with quick actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              {favoritable && (
                <Touchable
                  onTap={() => setIsFavorite(!isFavorite)}
                  hapticFeedback
                  className="p-2 bg-dark-card rounded-full"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-error-red text-error-red' : 'text-white'}`} />
                </Touchable>
              )}
              
              <div className="flex items-center space-x-2">
                {shareable && (
                  <Touchable
                    onTap={() => console.log('Share')}
                    hapticFeedback
                    className="p-2 bg-dark-card rounded-full"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </Touchable>
                )}
                
                {expandable && (
                  <Touchable
                    onTap={() => setIsExpanded(!isExpanded)}
                    hapticFeedback
                    className="p-2 bg-dark-card rounded-full"
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-5 h-5 text-white" />
                    ) : (
                      <Maximize2 className="w-5 h-5 text-white" />
                    )}
                  </Touchable>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content section */}
        <div className="p-6">
          {title && (
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
          )}
          
          {children}

          {/* Action buttons */}
          {(actions.length > 0 || editable || deletable) && (
            <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-dark-border">
              {actions.map((action, index) => (
                <Touchable
                  key={index}
                  onTap={action.onTap}
                  hapticFeedback
                  className={`p-2 rounded-lg transition-colors ${
                    action.color ? `bg-${action.color}/20 text-${action.color}` : 'bg-dark-hover text-gray-400 hover:text-white'
                  }`}
                >
                  <action.icon className="w-5 h-5" />
                </Touchable>
              ))}
              
              {editable && (
                <Touchable
                  onTap={() => console.log('Edit')}
                  hapticFeedback
                  className="p-2 bg-dark-hover text-gray-400 hover:text-white rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </Touchable>
              )}
              
              {deletable && (
                <Touchable
                  onTap={() => console.log('Delete')}
                  hapticFeedback
                  className="p-2 bg-dark-hover text-gray-400 hover:text-error-red rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </Touchable>
              )}
            </div>
          )}
        </div>

        {/* Gesture hint overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-dark-card text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <span className="w-1 h-1 bg-cosmic-purple rounded-full animate-pulse" />
            <span>Interactive</span>
          </div>
        </div>
      </motion.div>
    </Touchable>
  )
}
