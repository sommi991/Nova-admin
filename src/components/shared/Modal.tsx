import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Maximize2, Minimize2, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, Info, AlertTriangle,
  HelpCircle, Loader, Copy, Download, Printer,
  Share2, Heart, Star, Flag, Trash2, Edit
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useClickOutside } from '../../hooks/useClickOutside'

// ============================================================================
// TYPES
// ============================================================================

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
export type ModalPosition = 'center' | 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
export type ModalAnimation = 'fade' | 'slide' | 'scale' | 'rotate' | 'flip' | 'bounce' | 'custom'
export type ModalTheme = 'dark' | 'light' | 'glass'

export interface ModalProps {
  // Core
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode

  // Content
  title?: string | React.ReactNode
  subtitle?: string | React.ReactNode
  icon?: React.ElementType
  footer?: React.ReactNode
  header?: React.ReactNode

  // Styling
  size?: ModalSize
  position?: ModalPosition
  theme?: ModalTheme
  className?: string
  overlayClassName?: string
  contentClassName?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
  closeButtonClassName?: string

  // Behavior
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  showHeader?: boolean
  showFooter?: boolean
  draggable?: boolean
  resizable?: boolean
  maximizable?: boolean
  fullscreen?: boolean
  blockScroll?: boolean
  preventClose?: boolean

  // Animations
  animation?: ModalAnimation
  animationDuration?: number
  animationDelay?: number

  // Callbacks
  onOpen?: () => void
  onCloseComplete?: () => void
  onMaximize?: () => void
  onMinimize?: () => void

  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
  role?: 'dialog' | 'alertdialog'

  // Custom
  portalElement?: HTMLElement
  zIndex?: number
  backdropBlur?: boolean
  backdropOpacity?: number
}

// ============================================================================
// SIZE MAPPING
// ============================================================================

const SIZE_CLASSES: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
}

// ============================================================================
// POSITION STYLES
// ============================================================================

const POSITION_STYLES: Record<ModalPosition, string> = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-10',
  right: 'items-center justify-end',
  bottom: 'items-end justify-center pb-10',
  left: 'items-center justify-start',
  'top-right': 'items-start justify-end',
  'top-left': 'items-start justify-start',
  'bottom-right': 'items-end justify-end',
  'bottom-left': 'items-end justify-start'
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const ANIMATION_VARIANTS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 50, opacity: 0 }
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  },
  rotate: {
    initial: { rotate: -10, scale: 0.9, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 10, scale: 0.9, opacity: 0 }
  },
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 }
  },
  bounce: {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.5 } },
    exit: { y: 50, opacity: 0 }
  }
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  help: HelpCircle,
  loading: Loader
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

export const Modal: React.FC<ModalProps> = ({
  // Core
  isOpen,
  onClose,
  children,

  // Content
  title,
  subtitle,
  icon: Icon,
  footer,
  header,

  // Styling
  size = 'md',
  position = 'center',
  theme = 'glass',
  className = '',
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  closeButtonClassName = '',

  // Behavior
  closeOnClickOutside = true,
  closeOnEscape = true,
  showCloseButton = true,
  showHeader = true,
  showFooter = true,
  draggable = false,
  resizable = false,
  maximizable = false,
  fullscreen = false,
  blockScroll = true,
  preventClose = false,

  // Animations
  animation = 'scale',
  animationDuration = 0.2,
  animationDelay = 0,

  // Callbacks
  onOpen,
  onCloseComplete,
  onMaximize,
  onMinimize,

  // Accessibility
  ariaLabel,
  ariaDescribedBy,
  role = 'dialog',

  // Custom
  portalElement,
  zIndex = 50,
  backdropBlur = true,
  backdropOpacity = 0.8
}) => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  const [isMaximized, setIsMaximized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [positionOffset, setPositionOffset] = useState({ x: 0, y: 0 })
  const [sizeOffset, setSizeOffset] = useState({ width: 0, height: 0 })
  const [mounted, setMounted] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const initialMousePos = useRef({ x: 0, y: 0 })
  const initialModalPos = useRef({ x: 0, y: 0 })
  const initialModalSize = useRef({ width: 0, height: 0 })

  // ==========================================================================
  // HOOKS
  // ==========================================================================

  useLockBodyScroll(blockScroll && isOpen)
  useEscapeKey(closeOnEscape && !preventClose ? onClose : undefined)

  useClickOutside(
    modalRef,
    () => {
      if (closeOnClickOutside && !preventClose && !isDragging && !isResizing) {
        onClose()
      }
    },
    [isDragging, isResizing]
  )

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      onOpen?.()
    }
  }, [isOpen, onOpen])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleMaximize = () => {
    setIsMaximized(!isMaximized)
    if (isMaximized) {
      onMinimize?.()
    } else {
      onMaximize?.()
    }
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if (!draggable || isMaximized || fullscreen) return

    e.preventDefault()
    setIsDragging(true)
    initialMousePos.current = { x: e.clientX, y: e.clientY }
    initialModalPos.current = { ...positionOffset }
  }

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - initialMousePos.current.x
    const dy = e.clientY - initialMousePos.current.y

    setPositionOffset({
      x: initialModalPos.current.x + dx,
      y: initialModalPos.current.y + dy
    })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!resizable || isMaximized || fullscreen) return

    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    initialMousePos.current = { x: e.clientX, y: e.clientY }
    
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect()
      initialModalSize.current = { width: rect.width, height: rect.height }
    }
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const dx = e.clientX - initialMousePos.current.x
    const dy = e.clientY - initialMousePos.current.y

    setSizeOffset({
      width: Math.max(300, initialModalSize.current.width + dx),
      height: Math.max(200, initialModalSize.current.height + dy)
    })
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
  }

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
    }
  }, [isDragging])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove)
      window.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isResizing])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence onExitComplete={onCloseComplete}>
      {isOpen && (
        <div
          className={`fixed inset-0 flex ${POSITION_STYLES[position]} p-4`}
          style={{ zIndex }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            className={`absolute inset-0 ${
              backdropBlur ? 'backdrop-blur-sm' : ''
            } ${overlayClassName}`}
            style={{ backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` }}
            onClick={closeOnClickOutside && !preventClose ? onClose : undefined}
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            variants={ANIMATION_VARIANTS[animation]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: animationDuration,
              delay: animationDelay,
              type: animation === 'bounce' ? 'spring' : 'tween'
            }}
            className={`relative ${className}`}
            style={{
              transform: draggable && !isMaximized && !fullscreen
                ? `translate(${positionOffset.x}px, ${positionOffset.y}px)`
                : undefined,
              width: fullscreen || isMaximized ? '100%' : sizeOffset.width || 'auto',
              height: fullscreen || isMaximized ? '100%' : sizeOffset.height || 'auto',
              maxWidth: fullscreen || isMaximized ? 'none' : SIZE_CLASSES[size]
            }}
            role={role}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-modal="true"
          >
            {/* Modal Content */}
            <div
              ref={contentRef}
              className={`relative w-full ${
                theme === 'glass'
                  ? 'glass-card'
                  : theme === 'dark'
                  ? 'bg-dark-card border border-dark-border'
                  : 'bg-white border border-gray-200'
              } rounded-2xl shadow-2xl overflow-hidden ${contentClassName}`}
            >
              {/* Resize Handles */}
              {resizable && !isMaximized && !fullscreen && (
                <>
                  <div
                    className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'nw')}
                  />
                  <div
                    className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'ne')}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'sw')}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'se')}
                  />
                  <div
                    className="absolute top-0 left-4 right-4 h-1 cursor-n-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'n')}
                  />
                  <div
                    className="absolute bottom-0 left-4 right-4 h-1 cursor-s-resize"
                    onMouseDown={(e) => handleResizeStart(e, 's')}
                  />
                  <div
                    className="absolute left-0 top-4 bottom-4 w-1 cursor-w-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'w')}
                  />
                  <div
                    className="absolute right-0 top-4 bottom-4 w-1 cursor-e-resize"
                    onMouseDown={(e) => handleResizeStart(e, 'e')}
                  />
                </>
              )}

              {/* Custom Header */}
              {header}

              {/* Default Header */}
              {showHeader && !header && (
                <div
                  ref={dragRef}
                  onMouseDown={handleDragStart}
                  className={`flex items-center justify-between px-6 py-4 border-b border-dark-border cursor-move ${headerClassName}`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {Icon && (
                      <div className="flex-shrink-0">
                        <Icon className="w-5 h-5 text-cosmic-purple" />
                      </div>
                    )}
                    <div className="min-w-0">
                      {title && (
                        <h3 className="text-lg font-semibold text-white truncate">
                          {title}
                        </h3>
                      )}
                      {subtitle && (
                        <p className="text-sm text-gray-400 truncate">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {maximizable && (
                      <button
                        onClick={handleMaximize}
                        className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                        aria-label={isMaximized ? 'Minimize' : 'Maximize'}
                      >
                        {isMaximized ? (
                          <Minimize2 className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}

                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        disabled={preventClose}
                        className={`p-2 hover:bg-dark-hover rounded-lg transition-colors ${
                          preventClose ? 'opacity-50 cursor-not-allowed' : ''
                        } ${closeButtonClassName}`}
                        aria-label="Close modal"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className={`px-6 py-4 ${bodyClassName}`}>
                {children}
              </div>

              {/* Footer */}
              {showFooter && footer && (
                <div className={`px-6 py-4 border-t border-dark-border ${footerClassName}`}>
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // Render in portal
  return portalElement
    ? createPortal(modalContent, portalElement)
    : modalContent
}

// ============================================================================
// CONFIRM MODAL
// ============================================================================

export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'icon'> {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning'
  cancelVariant?: 'default' | 'danger' | 'success' | 'warning'
  icon?: 'success' | 'error' | 'warning' | 'info' | 'help' | 'loading'
  onConfirm: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  cancelVariant = 'default',
  icon = 'help',
  onConfirm,
  onCancel,
  isLoading = false,
  ...props
}) => {
  const IconComponent = ICON_MAP[icon] || HelpCircle

  const variantClasses = {
    primary: 'bg-cosmic-purple hover:bg-electric-blue',
    danger: 'bg-error-red hover:bg-error-red/80',
    success: 'bg-success-green hover:bg-success-green/80',
    warning: 'bg-warning-orange hover:bg-warning-orange/80',
    default: 'bg-dark-hover hover:bg-dark-card text-gray-300'
  }

  const iconColors = {
    success: 'text-success-green',
    error: 'text-error-red',
    warning: 'text-warning-orange',
    info: 'text-electric-blue',
    help: 'text-cosmic-purple',
    loading: 'text-cosmic-purple'
  }

  return (
    <Modal
      size="sm"
      showCloseButton={false}
      onClose={() => onCancel?.()}
      {...props}
    >
      <div className="text-center">
        <div className={`inline-flex p-3 rounded-full bg-opacity-20 mb-4 ${
          icon === 'success' ? 'bg-success-green' :
          icon === 'error' ? 'bg-error-red' :
          icon === 'warning' ? 'bg-warning-orange' :
          icon === 'info' ? 'bg-electric-blue' :
          'bg-cosmic-purple'
        }`}>
          {isLoading ? (
            <Loader className={`w-8 h-8 animate-spin ${iconColors[icon]}`} />
          ) : (
            <IconComponent className={`w-8 h-8 ${iconColors[icon]}`} />
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>

        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${variantClasses[cancelVariant]}`}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${variantClasses[confirmVariant]} ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================================================
// FORM MODAL
// ============================================================================

export interface FormModalProps extends ModalProps {
  title: string
  onSubmit: (e: React.FormEvent) => void
  submitLabel?: string
  cancelLabel?: string
  submitVariant?: 'primary' | 'success' | 'danger'
  isValid?: boolean
  isSubmitting?: boolean
}

export const FormModal: React.FC<FormModalProps> = ({
  title,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitVariant = 'primary',
  isValid = true,
  isSubmitting = false,
  children,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-cosmic-purple hover:bg-electric-blue',
    success: 'bg-success-green hover:bg-success-green/80',
    danger: 'bg-error-red hover:bg-error-red/80'
  }

  return (
    <Modal
      size="lg"
      title={title}
      footer={
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={props.onClose}
            className="px-4 py-2 bg-dark-hover text-gray-300 rounded-lg hover:bg-dark-card transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            form="modal-form"
            disabled={!isValid || isSubmitting}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              variantClasses[submitVariant]
            } ${(!isValid || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      }
      {...props}
    >
      <form id="modal-form" onSubmit={onSubmit}>
        {children}
      </form>
    </Modal>
  )
}

// ============================================================================
// DRAWER MODAL
// ============================================================================

export interface DrawerModalProps extends ModalProps {
  side?: 'left' | 'right' | 'top' | 'bottom'
  width?: number | string
}

export const DrawerModal: React.FC<DrawerModalProps> = ({
  side = 'right',
  width = 400,
  children,
  ...props
}) => {
  const positionMap = {
    left: 'justify-start',
    right: 'justify-end',
    top: 'items-start',
    bottom: 'items-end'
  }

  const animationMap = {
    left: { x: -100, opacity: 0 },
    right: { x: 100, opacity: 0 },
    top: { y: -100, opacity: 0 },
    bottom: { y: 100, opacity: 0 }
  }

  const sizeStyles = {
    left: { width, height: '100vh', maxWidth: '90vw' },
    right: { width, height: '100vh', maxWidth: '90vw' },
    top: { height: width, width: '100vw', maxHeight: '90vh' },
    bottom: { height: width, width: '100vw', maxHeight: '90vh' }
  }

  return (
    <Modal
      position={side as ModalPosition}
      animation="custom"
      className="m-0"
      contentClassName="rounded-none"
      closeOnClickOutside={true}
      {...props}
    >
      <motion.div
        initial={animationMap[side]}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={animationMap[side]}
        transition={{ type: 'spring', damping: 30 }}
        style={sizeStyles[side]}
        className="h-full"
      >
        {children}
      </motion.div>
    </Modal>
  )
}

// ============================================================================
// WIZARD MODAL
// ============================================================================

export interface WizardStep {
  title: string
  content: React.ReactNode
  validate?: () => boolean
}

export interface WizardModalProps extends ModalProps {
  steps: WizardStep[]
  onComplete: () => void
  completeLabel?: string
  nextLabel?: string
  prevLabel?: string
}

export const WizardModal: React.FC<WizardModalProps> = ({
  steps,
  onComplete,
  completeLabel = 'Complete',
  nextLabel = 'Next',
  prevLabel = 'Back',
  ...props
}) => {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (steps[currentStep].validate?.() !== false) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        onComplete()
      }
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Modal
      size="lg"
      title={steps[currentStep].title}
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-cosmic-purple w-4'
                    : index < currentStep
                    ? 'bg-success-green'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-dark-hover text-gray-300 rounded-lg hover:bg-dark-card transition-colors flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{prevLabel}</span>
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue transition-colors flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? completeLabel : nextLabel}</span>
              {currentStep < steps.length - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      }
      {...props}
    >
      {steps[currentStep].content}
    </Modal>
  )
}

// ============================================================================
// MEDIA MODAL
// ============================================================================

export interface MediaModalProps extends ModalProps {
  src: string
  type?: 'image' | 'video' | 'iframe'
  alt?: string
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
}

export const MediaModal: React.FC<MediaModalProps> = ({
  src,
  type = 'image',
  alt,
  controls = true,
  autoPlay = false,
  loop = false,
  ...props
}) => {
  return (
    <Modal
      size={type === 'image' ? '4xl' : '3xl'}
      position="center"
      showHeader={false}
      closeOnClickOutside={true}
      {...props}
    >
      <div className="relative">
        {type === 'image' && (
          <img
            src={src}
            alt={alt}
            className="w-full h-auto rounded-lg"
          />
        )}

        {type === 'video' && (
          <video
            src={src}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            className="w-full h-auto rounded-lg"
          />
        )}

        {type === 'iframe' && (
          <iframe
            src={src}
            title={alt}
            className="w-full h-[70vh] rounded-lg"
          />
        )}
      </div>
    </Modal>
  )
}

// ============================================================================
// EXPORT
// ============================================================================

export default Modal
