import { useEffect, useState, useRef } from 'react'
import { cn } from '../../lib/utils'

interface RadialMenuProps {
  x: number
  y: number
  visible: boolean
  onClose: () => void
  onAction: (action: 'add' | 'edit' | 'move' | 'delete') => void
  hasSelection: boolean
}

export function RadialMenu({ x, y, visible, onClose, onAction, hasSelection }: RadialMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (visible) {
      const menuWidth = 160
      const menuHeight = 220
      let posX = x
      let posY = y

      if (posX + menuWidth > window.innerWidth) {
        posX = window.innerWidth - menuWidth - 20
      }
      if (posX < 20) posX = 20
      if (posY + menuHeight > window.innerHeight) {
        posY = window.innerHeight - menuHeight - 20
      }
      if (posY < 20) posY = 20

      setPosition({ x: posX, y: posY })
    }
  }, [x, y, visible])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, onClose])

  if (!visible) return null

  const actions = [
    { id: 'add' as const, label: 'Add', icon: '+' },
    { id: 'edit' as const, label: 'Edit', icon: '✎', disabled: !hasSelection },
    { id: 'move' as const, label: 'Move', icon: '↔', disabled: !hasSelection },
    { id: 'delete' as const, label: 'Delete', icon: '×', disabled: !hasSelection, danger: true },
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-50"
      style={{ left: position.x, top: position.y }}
    >
      <div className="relative w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              onAction(action.id)
              onClose()
            }}
            disabled={action.disabled}
            className={cn(
              'w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors',
              action.danger
                ? 'text-red-400 hover:bg-red-900/30'
                : 'text-slate-200 hover:bg-slate-800',
              action.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
            )}
            style={{ borderBottom: index < actions.length - 1 ? '1px solid #334155' : 'none' }}
          >
            <span className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded text-xs">
              {action.icon}
            </span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}