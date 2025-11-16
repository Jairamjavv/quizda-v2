import React, { useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

interface Opt { id?: string; label?: string }
interface Props { data: { question: string; options?: (Opt | string)[] } }

const DragDrop: React.FC<Props> = ({ data }) => {
  const initial = data.options || [];
  const [items, setItems] = useState<(Opt | string)[]>(initial.slice());
  const dragIndex = useRef<number | null>(null);

  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null) return;
    const copy = items.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(idx, 0, moved);
    setItems(copy);
    dragIndex.current = null;
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.question}
        </Typography>
        <Stack spacing={1}>
          {items.map((it, i) => (
            <Paper
              key={(typeof it === 'string' ? it : (it.id || it.label)) || `${i}`}
              elevation={1}
              sx={{ p: 1, cursor: 'grab' }}
              draggable
              onDragStart={(e) => onDragStart(e, i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, i)}
              role="listitem"
              aria-label={`draggable-${i}`}
            >
              {typeof it === 'string' ? it : it.label || it.id}
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DragDrop;
