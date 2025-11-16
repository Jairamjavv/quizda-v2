import React, { useState, useRef } from 'react'
import { Paper, Box, Typography, Radio, Checkbox, Button, TextField, Select, MenuItem } from '@mui/material'

export type QuestionType =
  | 'mcq'
  | 'truefalse'
  | 'multiple'
  | 'fill'
  | 'matching'
  | 'dragdrop'
  | 'hotspot'
  | 'assertion';

export interface HotspotArea { id: string; x: number; y: number; w: number; h: number; label?: string }

export interface Question {
  id?: string;
  type: QuestionType;
  text: string;
  options?: string[]; // for mcq, multiple, dragdrop
  leftMatch?: string[]; // matching left column
  rightMatch?: string[]; // matching right column (select options)
  image?: string; // for hotspot
  hotspots?: HotspotArea[]; // normalized percentages (0-100)
  assertion?: { A: string; R: string };
}

interface Props {
  question: Question;
  onAnswerChange?: (answer: any) => void;
}

const QuestionCard: React.FC<Props> = ({ question, onAnswerChange }) => {
  const id = question.id || 'q-' + Math.random().toString(36).slice(2, 9)
  const [selected, setSelected] = useState<any>(question.type === 'multiple' ? [] : question.type === 'dragdrop' ? question.options || [] : '')

  // For drag/drop ordering
  const dragIndex = useRef<number | null>(null);

  const handleChange = (value: any) => {
    setSelected(value);
    onAnswerChange?.(value);
  };

  // Basic drag handlers for reordering a list
  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDropItem = (e: React.DragEvent, idx: number, list: string[]) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null) return;
    const copy = [...list];
    const [item] = copy.splice(from, 1);
    copy.splice(idx, 0, item);
    dragIndex.current = null;
    handleChange(copy);
  };

  const renderOptions = () => {
    switch (question.type) {
      case 'mcq':
        return (
          <Box role="group" aria-label="Multiple choice options" sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '6px' }}>
            {(question.options || []).map((opt, i) => (
              <Box key={i} component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '6px', borderRadius: '6px' }}>
                <Radio checked={selected === opt} onChange={() => handleChange(opt)} name={id} inputProps={{ 'aria-label': opt }} />
                <Typography sx={{ fontSize: '0.95rem' }}>{opt}</Typography>
              </Box>
            ))}
          </Box>
        )

      case 'truefalse':
        return (
          <Box role="group" aria-label="True or False" sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '6px' }}>
            {['True', 'False'].map((v) => (
              <Box key={v} component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '6px', borderRadius: '6px' }}>
                <Radio checked={selected === v} onChange={() => handleChange(v)} name={id} />
                <Typography sx={{ fontSize: '0.95rem' }}>{v}</Typography>
              </Box>
            ))}
          </Box>
        )

      case 'multiple':
        return (
          <Box role="group" aria-label="Multiple response options" sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '6px' }}>
            {(question.options || []).map((opt, i) => (
              <Box key={i} component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '6px', borderRadius: '6px' }}>
                <Checkbox checked={(selected || []).includes(opt)} onChange={(e) => {
                  const set = new Set(selected || []);
                  if (e.target.checked) set.add(opt);
                  else set.delete(opt);
                  handleChange(Array.from(set));
                }} inputProps={{ 'aria-label': opt }} />
                <Typography sx={{ fontSize: '0.95rem' }}>{opt}</Typography>
              </Box>
            ))}
          </Box>
        )

      case 'fill':
        return (
          <Box sx={{ mt: 1 }}>
            <TextField id={`${id}-input`} label="Answer" value={selected} onChange={(e) => handleChange(e.target.value)} fullWidth />
          </Box>
        )

      case 'matching':
        return (
          <Box role="group" aria-label="Matching question" sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(question.leftMatch || []).map((left, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ minWidth: 120 }}>{left}</Box>
                  <Select value={(selected && selected[i]) || ''} onChange={(e: any) => {
                    const next = { ...(selected || {}), [i]: e.target.value }
                    handleChange(next)
                  }} displayEmpty sx={{ flex: 1 }}>
                    <MenuItem value="">—</MenuItem>
                    {(question.rightMatch || []).map((r, j) => (
                      <MenuItem key={j} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </Box>
              ))}
            </Box>
          </Box>
        )

      case 'dragdrop':
        return (
          <Box component="ul" role="list" aria-label="Reorderable list" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(selected || question.options || []).map((item: string, i: number) => (
              <Box
                component="li"
                key={item + i}
                draggable
                onDragStart={(e) => onDragStart(e, i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropItem(e, i, question.options || selected)}
                aria-grabbed="false"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, border: '1px solid #eee', bg: '#fff' }}
              >
                <Box sx={{ opacity: 0.6, mr: 1 }}>☰</Box>
                <Box>{item}</Box>
              </Box>
            ))}
          </Box>
        )

      case 'hotspot':
        return (
          <Box aria-label="Hotspot (coming soon)" sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Hotspot questions are temporarily disabled and will be available soon.</Typography>
          </Box>
        )

      case 'assertion':
        return (
          <Box role="group" aria-label="Assertion and Reasoning" sx={{ mt: 1 }}>
            <Typography sx={{ mb: 1 }}><strong>A:</strong> {question.assertion?.A}</Typography>
            <Typography sx={{ mb: 1 }}><strong>R:</strong> {question.assertion?.R}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['A', 'B', 'C', 'D'].map((v) => (
                <Box key={v} component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Radio checked={selected === v} onChange={() => handleChange(v)} name={id} />
                  <Typography sx={{ fontSize: '0.95rem' }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )

      default:
        return <div className="q-note">Unsupported question type.</div>;
    }
  };

  return (
    <Paper
      component="article"
      aria-labelledby={`${id}-title`}
      sx={{
        border: '1px solid var(--surface-2, #e6e6e6)',
        borderRadius: '10px',
        p: 1.5,
        background: 'var(--surface-1, #fff)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        maxWidth: 900,
        m: '8px auto'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography id={`${id}-title`} component="h3" sx={{ fontSize: '1rem', color: 'var(--text-1, #111)', m: 0 }}>
          {question.text}
        </Typography>
        <Box sx={{}}>{renderOptions()}</Box>
      </Box>
    </Paper>
  );
};

// Small example JSON demonstrating how to pass data
export const SAMPLE_QUESTIONS: Question[] = [
  { id: 'q1', type: 'mcq', text: 'What is the capital of France?', options: ['Paris', 'Rome', 'Madrid'] },
  { id: 'q2', type: 'truefalse', text: 'The earth orbits the sun.' },
  { id: 'q3', type: 'multiple', text: 'Select prime numbers.', options: ['2', '3', '4', '9'] },
  { id: 'q4', type: 'fill', text: '_____ is the process of water vapor turning into liquid.' },
  { id: 'q5', type: 'matching', text: 'Match the country to its flag color.', leftMatch: ['France', 'Italy'], rightMatch: ['Blue/White/Red', 'Green/White/Red'] },
  { id: 'q6', type: 'dragdrop', text: 'Order the steps to make tea.', options: ['Boil water', 'Add tea', 'Pour water', 'Serve'] },
  { id: 'q7', type: 'hotspot', text: 'Select the red area.', image: '/images/sample-map.png', hotspots: [{ id: 'a1', x: 10, y: 20, w: 15, h: 10, label: 'Red area' }] },
  { id: 'q8', type: 'assertion', text: 'Assertion & Reasoning example', assertion: { A: 'Light travels faster in vacuum.', R: 'Vacuum has no medium to slow light' } },
];

export default QuestionCard;
