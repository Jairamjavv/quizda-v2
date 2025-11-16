import React, { useState, useRef } from 'react'
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid, Paper, Typography, Radio, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import NoticeBoard from './NoticeBoard'
import LivePreview from './LivePreview'

type Props = {
  questionTypes: string[]
  qType: string
  setQType: (v: string) => void
  qStem: string
  setQStem: (v: string) => void
  qOptions: string
  setQOptions: (v: string) => void
  qOptionsArr: string[]
  setQOptionsArr: (arr: string[]) => void
  qLeftMatch: string[]
  setQLeftMatch: (arr: string[]) => void
  qRightMatch: string[]
  setQRightMatch: (arr: string[]) => void
  qDragItems: string[]
  setQDragItems: (arr: string[]) => void
  qImageUrl: string
  setQImageUrl: (v: string) => void
  qHotspots: any[]
  setQHotspots: (h: any[]) => void
  qAssertionA: string
  qAssertionR: string
  qAnswer: string
  setQAnswer: (v: string) => void
  addQuestion: () => void
  questions: any[]
  editingId?: string | null
  onEditQuestion?: (id: string) => void
  onCancelEdit?: () => void
  onDeleteQuestion?: (id: string) => void
  buildPreviewData: () => any
  finishCreate: () => void
  setStage: (s: 'details' | 'editor' | 'done') => void
}

const QuestionEditor: React.FC<Props> = ({
  questionTypes, qType, setQType, qStem, setQStem, qOptions, setQOptions,
  qOptionsArr, setQOptionsArr, qLeftMatch, setQLeftMatch, qRightMatch, setQRightMatch,
  qDragItems, setQDragItems, qImageUrl, setQImageUrl, qHotspots, setQHotspots,
  qAssertionA, qAssertionR, qAnswer, setQAnswer, addQuestion, questions, buildPreviewData,
  finishCreate, setStage, editingId, onEditQuestion, onCancelEdit, onDeleteQuestion
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement | null>(null)

  const handleEditClick = (id: string) => {
    if (onEditQuestion) onEditQuestion(id)
    // small delay to allow form state to populate then scroll
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
  }

  const openDeleteConfirm = (id: string) => { setPendingDelete(id); setConfirmOpen(true) }
  const handleConfirmDelete = () => { if (pendingDelete && onDeleteQuestion) onDeleteQuestion(pendingDelete); setPendingDelete(null); setConfirmOpen(false) }
  const handleCancelDelete = () => { setPendingDelete(null); setConfirmOpen(false) }
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <div ref={formRef} />
          {editingId && (
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={`Editing question`} color="primary" sx={{ fontWeight: 600 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{questions.find(q => q.id === editingId)?.data?.stem ? `“${String(questions.find(q => q.id === editingId)?.data?.stem).slice(0, 80)}”` : ''}</Typography>
              <Box sx={{ flex: 1 }} />
              <IconButton size="small" onClick={() => onCancelEdit && onCancelEdit()} aria-label="cancel edit"><CloseIcon fontSize="small" /></IconButton>
            </Box>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel id="q-type-label">Question Type</InputLabel>
            <Select labelId="q-type-label" value={qType} label="Question Type" onChange={(e: any) => setQType(e.target.value)}>
              {questionTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField label="Question text / stem" value={qStem} onChange={(e) => setQStem(e.target.value)} fullWidth margin="normal" multiline rows={3} disabled={qType === 'Hotspot'} />

          {/* MCQ / Multiple Response: per-option editor with add/remove and correct selection */}
          {(qType === 'MCQ' || qType === 'Multiple Response') && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Options</Typography>
              {qOptionsArr.map((opt, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  {qType === 'MCQ' ? (
                    <FormControlLabel control={<Radio checked={qAnswer === String(i)} onChange={() => setQAnswer(String(i))} />} label="" sx={{ mr: 0 }} />
                  ) : (
                    <Checkbox checked={String(qAnswer || '').split(',').filter(Boolean).includes(String(i))} onChange={() => {
                      const parts = String(qAnswer || '').split(',').filter(Boolean)
                      if (parts.includes(String(i))) setQAnswer(parts.filter(p => p !== String(i)).join(','))
                      else setQAnswer([...parts, String(i)].join(','))
                    }} />
                  )}
                  <TextField value={opt} onChange={(e) => setQOptionsArr(qOptionsArr.map((v, idx) => idx === i ? e.target.value : v))} fullWidth size="small" />
                  <Button size="small" onClick={() => setQOptionsArr(qOptionsArr.filter((_, idx) => idx !== i))}>Remove</Button>
                </Box>
              ))}
              <Button size="small" onClick={() => setQOptionsArr([...qOptionsArr, ''])}>Add option</Button>
            </Box>
          )}

          {/* Matching editor */}
          {qType === 'Matching' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Matching pairs</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption">Left</Typography>
                  {qLeftMatch.map((it, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <TextField value={it} onChange={(e) => setQLeftMatch(qLeftMatch.map((v, idx) => idx === i ? e.target.value : v))} size="small" fullWidth />
                      <Button size="small" onClick={() => setQLeftMatch(qLeftMatch.filter((_, idx) => idx !== i))}>Remove</Button>
                    </Box>
                  ))}
                  <Button size="small" onClick={() => setQLeftMatch([...qLeftMatch, ''])}>Add left</Button>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption">Right</Typography>
                  {qRightMatch.map((it, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <TextField value={it} onChange={(e) => setQRightMatch(qRightMatch.map((v, idx) => idx === i ? e.target.value : v))} size="small" fullWidth />
                      <Button size="small" onClick={() => setQRightMatch(qRightMatch.filter((_, idx) => idx !== i))}>Remove</Button>
                    </Box>
                  ))}
                  <Button size="small" onClick={() => setQRightMatch([...qRightMatch, ''])}>Add right</Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Drag items */}
          {qType === 'Drag and Drop' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Draggable items</Typography>
              {qDragItems.map((it, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <TextField value={it} onChange={(e) => setQDragItems(qDragItems.map((v, idx) => idx === i ? e.target.value : v))} size="small" fullWidth />
                  <Button size="small" onClick={() => setQDragItems(qDragItems.filter((_, idx) => idx !== i))}>Remove</Button>
                </Box>
              ))}
              <Button size="small" onClick={() => setQDragItems([...qDragItems, ''])}>Add item</Button>
            </Box>
          )}

          {qType === 'True/False' && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="tf-label">Answer</InputLabel>
              <Select labelId="tf-label" value={qAnswer || 'True'} label="Answer" onChange={(e: any) => setQAnswer(e.target.value)}>
                <MenuItem value="True">True</MenuItem>
                <MenuItem value="False">False</MenuItem>
              </Select>
            </FormControl>
          )}

          {qType === 'Fill-in-the-Blank' && (
            <TextField label="Answer" value={qAnswer} onChange={(e) => setQAnswer(e.target.value)} fullWidth margin="normal" />
          )}

          {qType === 'Hotspot' && (
            <Box sx={{ mt: 2 }}>
              <TextField label="Image URL" value={qImageUrl} onChange={(e) => setQImageUrl(e.target.value)} fullWidth margin="normal" disabled />
              <Typography variant="body2" sx={{ mb: 1 }}>Hotspots (x, y, w, h in %)</Typography>
              {qHotspots.map((h, i) => (
                <Box key={h.id || i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <TextField label="x%" value={String(h.x)} size="small" sx={{ width: 80 }} disabled />
                  <TextField label="y%" value={String(h.y)} size="small" sx={{ width: 80 }} disabled />
                  <TextField label="w%" value={String(h.w)} size="small" sx={{ width: 80 }} disabled />
                  <TextField label="h%" value={String(h.h)} size="small" sx={{ width: 80 }} disabled />
                  <TextField label="label" value={h.label || ''} size="small" disabled />
                  <Button size="small" disabled>Remove</Button>
                </Box>
              ))}
              <Button size="small" disabled sx={{ mt: 1 }}>Add hotspot</Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>Hotspot authoring is disabled for now — preview will show "Coming soon".</Typography>
            </Box>
          )}

          {qType === 'Assertion and Reasoning' && (
            <Box sx={{ mt: 2 }}>
              <TextField label="Assertion (A)" value={qAssertionA} onChange={(e) => { /* parent state setter passed in as props but read-only here */ }} fullWidth margin="normal" />
              <TextField label="Reason (R)" value={qAssertionR} onChange={(e) => { /* parent state setter passed in as props but read-only here */ }} fullWidth margin="normal" />
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={addQuestion} sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}>{editingId ? 'Update Question' : 'Add Question'}</Button>
            <Button onClick={() => setStage('details')}>Back to details</Button>
          </Box>

          <Dialog open={confirmOpen} onClose={handleCancelDelete}>
            <DialogTitle>Confirm delete</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this question?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button color="error" onClick={handleConfirmDelete}>Delete</Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth />
            <Box sx={{ mt: 2 }}>
              <Box>
                {questions.map((q) => (
                  <Box key={q.id} sx={{ p: 1, mt: 1, bgcolor: 'var(--surface)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <div style={{ fontWeight: 600 }}>{q.type}</div>
                      <div>{q.data.stem}</div>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" onClick={() => handleEditClick(q.id)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => openDeleteConfirm(q.id)}>Delete</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={finishCreate} sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}>Finish & Save Quiz</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, mb: 2 }}>
            <NoticeBoard qType={qType} />
          </Paper>

          <LivePreview previewData={buildPreviewData()} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default QuestionEditor
