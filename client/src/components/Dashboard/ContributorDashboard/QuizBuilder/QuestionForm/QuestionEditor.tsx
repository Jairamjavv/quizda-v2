import React, { useState, useRef } from 'react'
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid, Paper } from '@mui/material'
import NoticeBoard from '../../NoticeBoard'
import LivePreview from '../../LivePreview'
import { EditingBanner } from './EditingBanner'
import { QuestionsList } from './QuestionsList'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import {
  MCQOptionsInput,
  MatchingInput,
  DragDropInput,
  TrueFalseInput,
  FillBlankInput,
  HotspotInput,
  AssertionReasoningInput
} from './QuestionTypeInputs'

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
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
  }

  const openDeleteConfirm = (id: string) => {
    setPendingDelete(id)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (pendingDelete && onDeleteQuestion) onDeleteQuestion(pendingDelete)
    setPendingDelete(null)
    setConfirmOpen(false)
  }

  const handleCancelDelete = () => {
    setPendingDelete(null)
    setConfirmOpen(false)
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <div ref={formRef} />
          
          <EditingBanner
            editingId={editingId || null}
            questions={questions}
            onCancel={() => onCancelEdit && onCancelEdit()}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="q-type-label">Question Type</InputLabel>
            <Select
              labelId="q-type-label"
              value={qType}
              label="Question Type"
              onChange={(e: any) => setQType(e.target.value)}
            >
              {questionTypes.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Question text / stem"
            value={qStem}
            onChange={(e) => setQStem(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            disabled={qType === 'Hotspot'}
          />

          {/* Render type-specific inputs */}
          {(qType === 'MCQ' || qType === 'Multiple Response') && (
            <MCQOptionsInput
              qOptionsArr={qOptionsArr}
              setQOptionsArr={setQOptionsArr}
              qAnswer={qAnswer}
              setQAnswer={setQAnswer}
              isMCQ={qType === 'MCQ'}
            />
          )}

          {qType === 'Matching' && (
            <MatchingInput
              qLeftMatch={qLeftMatch}
              setQLeftMatch={setQLeftMatch}
              qRightMatch={qRightMatch}
              setQRightMatch={setQRightMatch}
            />
          )}

          {qType === 'Drag and Drop' && (
            <DragDropInput qDragItems={qDragItems} setQDragItems={setQDragItems} />
          )}

          {qType === 'True/False' && (
            <TrueFalseInput qAnswer={qAnswer} setQAnswer={setQAnswer} />
          )}

          {qType === 'Fill-in-the-Blank' && (
            <FillBlankInput qAnswer={qAnswer} setQAnswer={setQAnswer} />
          )}

          {qType === 'Hotspot' && (
            <HotspotInput
              qImageUrl={qImageUrl}
              setQImageUrl={setQImageUrl}
              qHotspots={qHotspots}
              setQHotspots={setQHotspots}
            />
          )}

          {qType === 'Assertion and Reasoning' && (
            <AssertionReasoningInput qAssertionA={qAssertionA} qAssertionR={qAssertionR} />
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={addQuestion}
              sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}
            >
              {editingId ? 'Update Question' : 'Add Question'}
            </Button>
            <Button onClick={() => setStage('details')}>Back to details</Button>
          </Box>

          <DeleteConfirmDialog
            open={confirmOpen}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />

          <QuestionsList
            questions={questions}
            onEdit={handleEditClick}
            onDelete={openDeleteConfirm}
          />

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={finishCreate}
              sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}
            >
              Finish & Save Quiz
            </Button>
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
