"use client"

import { AlertTriangle, HelpCircle, Info, Trash2 } from 'lucide-react'
import React, { createContext, useContext, useState } from 'react'

import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'

interface ConfirmationOptions {
  title: string
  message: string
  type?: 'warning' | 'danger' | 'info'
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => void
  confirmDelete: (itemName: string, onConfirm: () => void | Promise<void>) => void
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const confirm = (confirmOptions: ConfirmationOptions) => {
    setOptions(confirmOptions)
    setIsOpen(true)
  }

  const confirmDelete = (itemName: string, onConfirm: () => void | Promise<void>) => {
    confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      type: 'danger',
      confirmLabel: 'Delete',
      confirmVariant: 'destructive',
      onConfirm
    })
  }

  const handleConfirm = async () => {
    if (!options) return

    try {
      setIsLoading(true)
      await options.onConfirm()
      setIsOpen(false)
      setOptions(null)
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (options?.onCancel) {
      options.onCancel()
    }
    setIsOpen(false)
    setOptions(null)
    setIsLoading(false)
  }

  const getIcon = () => {
    if (!options) return null

    switch (options.type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />
      default:
        return <HelpCircle className="w-6 h-6 text-muted-foreground" />
    }
  }

  return (
    <ConfirmationContext.Provider value={{ confirm, confirmDelete }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {getIcon()}
              {options?.title}
            </DialogTitle>
            <DialogDescription className="text-left">
              {options?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {options?.cancelLabel || 'Cancel'}
            </Button>
            <Button
              variant={options?.confirmVariant || 'default'}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (options?.confirmLabel || 'Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmationContext.Provider>
  )
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider')
  }
  return context
}