import React, { useRef } from 'react'
import { Box } from '@mui/material'

type Props = {
  options: string[]
  selected: string[]
  onChange: (value: string[]) => void
}

export const DragDropQuestion: React.FC<Props> = ({ options, selected, onChange }) => {
  const dragIndex = useRef<number | null>(null)

  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragIndex.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDropItem = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null) return
    
    const copy = [...(selected || options)]
    const [item] = copy.splice(from, 1)
    copy.splice(idx, 0, item)
    dragIndex.current = null
    onChange(copy)
  }

  const items = selected.length > 0 ? selected : options

  return (
    <Box component="ul" role="list" aria-label="Reorderable list" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((item: string, i: number) => (
        <Box
          component="li"
          key={item + i}
          draggable
          onDragStart={(e) => onDragStart(e, i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropItem(e, i)}
          aria-grabbed="false"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: 1,
            border: '1px solid #eee',
            bgcolor: 'background.paper',
            cursor: 'move',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box sx={{ opacity: 0.6, mr: 1 }}>☰</Box>
          <Box>{item}</Box>
        </Box>
      ))}
    </Box>
  )
}
