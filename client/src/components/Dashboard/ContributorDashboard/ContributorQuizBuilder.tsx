import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import quizCategories from '../../../data/quizCategories'
import DetailsPanel from './DetailsPanel'
import QuestionEditor from './QuestionEditor'
import QuestionsList from './QuestionsList'
import LivePreview from './LivePreview'
import NoticeBoard from './NoticeBoard'
import { Box, Typography } from '@mui/material'

type LocationState = {
  title?: string
  category?: string
  totalTimeMinutes?: number
}

type QuestionRecord = {
  id: string
  type: string
  data: any
}

const questionTypes = [
  'MCQ',
  'True/False',
  'Matching',
  'Fill-in-the-Blank',
  'Multiple Response',
  'Hotspot',
  'Drag and Drop',
  'Assertion and Reasoning'
]

const ContributorQuizBuilder: React.FC = () => {
  const { state } = useLocation()
  const loc = (state || {}) as LocationState
  const navigate = useNavigate()

  const [name, setName] = useState<string>(loc.title || '')
  const [category, setCategory] = useState<string>(loc.category || quizCategories[0])
  const [subcategory, setSubcategory] = useState<string>('')
  const [tagsText, setTagsText] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [numQuestions, setNumQuestions] = useState<number>(5)
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number>(loc.totalTimeMinutes || 5)

  const [stage, setStage] = useState<'details' | 'editor' | 'done'>('details')
  const [questions, setQuestions] = useState<QuestionRecord[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  // question form state
  const [qType, setQType] = useState<string>(questionTypes[0])
  const [qStem, setQStem] = useState<string>('')
  // legacy single-field (kept for fallback) and per-type fields
  const [qOptions, setQOptions] = useState<string>('')
  const [qOptionsArr, setQOptionsArr] = useState<string[]>(['', ''])
  const [qLeftMatch, setQLeftMatch] = useState<string[]>([''])
  const [qRightMatch, setQRightMatch] = useState<string[]>([''])
  const [qDragItems, setQDragItems] = useState<string[]>(['', ''])
  const [qImageUrl, setQImageUrl] = useState<string>('')
  const [qHotspots, setQHotspots] = useState<Array<{ id: string; x: number; y: number; w: number; h: number; label?: string }>>([])
  const [qAssertionA, setQAssertionA] = useState<string>('')
  const [qAssertionR, setQAssertionR] = useState<string>('')
  const [qAnswer, setQAnswer] = useState<string>('')

  // build a lightweight preview data object for the dispatcher
  const buildPreviewData = () => {
    const opts = (qOptionsArr && qOptionsArr.length ? qOptionsArr : qOptions.split('|')).map((s) => String(s).trim()).filter(Boolean)
    switch (qType) {
      case 'MCQ':
        return { type: 'mcq', question: qStem || 'Preview MCQ', options: opts.map((o, i) => ({ id: String(i), label: o })) }
      case 'True/False':
        return { type: 'true_false', question: qStem || 'Preview True/False' }
      case 'Multiple Response':
        return { type: 'multiple_response', question: qStem || 'Preview Multiple Response', options: opts.map((o, i) => ({ id: String(i), label: o })) }
      case 'Fill-in-the-Blank':
        return { type: 'fill_blank', question: qStem || 'Preview Fill' }
      case 'Matching':
        return { type: 'matching', question: qStem || 'Preview Matching', leftMatch: qLeftMatch.filter(Boolean), rightMatch: qRightMatch.filter(Boolean) }
      case 'Drag and Drop':
        return { type: 'drag_drop', question: qStem || 'Preview DragDrop', options: qDragItems.filter(Boolean).map((o) => ({ id: o, label: o })) }
      case 'Hotspot':
        return { type: 'hotspot', question: qStem || 'Preview Hotspot', image: qImageUrl || undefined, hotspots: qHotspots }
      case 'Assertion and Reasoning':
        return { type: 'assertion_reasoning', question: qStem || 'Preview Assertion', assertion: { A: qAssertionA || 'Assertion text', R: qAssertionR || 'Reason text' } }
      default:
        return { type: 'mcq', question: qStem || 'Preview', options: opts.map((o, i) => ({ id: String(i), label: o })) }
    }
  }
  

  function addTagFromText() {
    const parts = tagsText.split(',').map((s) => s.trim()).filter(Boolean)
    setTags((t) => [...t, ...parts])
    setTagsText('')
  }

  function addQuestion() {
    if (!qStem.trim()) return
    const id = editingId || `q_${Date.now()}`
    let data: any = { stem: qStem }

    if (qType === 'MCQ') {
      data.options = qOptionsArr.filter(Boolean).map((o, i) => ({ id: String(i), label: o }))
      data.answer = qAnswer
    } else if (qType === 'Multiple Response') {
      data.options = qOptionsArr.filter(Boolean).map((o, i) => ({ id: String(i), label: o }))
      data.answer = qAnswer
    } else if (qType === 'True/False') {
      data.answer = qAnswer || 'True'
    } else if (qType === 'Fill-in-the-Blank') {
      data.answer = qAnswer
    } else if (qType === 'Matching') {
      data.leftMatch = qLeftMatch.filter(Boolean)
      data.rightMatch = qRightMatch.filter(Boolean)
    } else if (qType === 'Drag and Drop') {
      data.options = qDragItems.filter(Boolean).map((o) => ({ id: o, label: o }))
    } else if (qType === 'Hotspot') {
      data.image = qImageUrl
      data.hotspots = qHotspots
    } else if (qType === 'Assertion and Reasoning') {
      data.assertion = { A: qAssertionA, R: qAssertionR }
    } else {
      data.raw = qOptions || ''
    }

    if (editingId) {
      setQuestions((qs) => qs.map((q) => q.id === editingId ? { id, type: qType, data } : q))
    } else {
      setQuestions((qs) => [...qs, { id, type: qType, data }])
    }
    // reset question fields
    setQStem('')
    setQOptions('')
    setQOptionsArr(['', ''])
    setQLeftMatch([''])
    setQRightMatch([''])
    setQDragItems(['', ''])
    setQImageUrl('')
    setQHotspots([])
    setQAssertionA('')
    setQAssertionR('')
    setQAnswer('')
    setEditingId(null)
  }

  function editQuestion(id: string) {
    const q = questions.find((x) => x.id === id)
    if (!q) return
    // populate fields from existing question
    setEditingId(id)
    setQType(q.type)
    const d = q.data || {}
    setQStem(d.stem || '')
    setQOptions(d.raw || '')
    setQOptionsArr((d.options && d.options.map((o: any) => o.label)) || ['',''])
    setQLeftMatch(d.leftMatch || [''])
    setQRightMatch(d.rightMatch || [''])
    setQDragItems((d.options && d.options.map((o: any) => o.label)) || ['',''])
    setQImageUrl(d.image || '')
    setQHotspots(d.hotspots || [])
    setQAssertionA((d.assertion && d.assertion.A) || '')
    setQAssertionR((d.assertion && d.assertion.R) || '')
    setQAnswer(d.answer || '')
  }

  function deleteQuestion(id: string) {
    setQuestions((qs) => qs.filter((q) => q.id !== id))
    if (editingId === id) {
      // clear form if deleting currently edited question
      setEditingId(null)
      setQStem('')
      setQOptions('')
      setQOptionsArr(['', ''])
      setQLeftMatch([''])
      setQRightMatch([''])
      setQDragItems(['', ''])
      setQImageUrl('')
      setQHotspots([])
      setQAssertionA('')
      setQAssertionR('')
      setQAnswer('')
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setQStem('')
    setQOptions('')
    setQOptionsArr(['', ''])
    setQLeftMatch([''])
    setQRightMatch([''])
    setQDragItems(['', ''])
    setQImageUrl('')
    setQHotspots([])
    setQAssertionA('')
    setQAssertionR('')
    setQAnswer('')
  }

  function finishCreate() {
    // persist to localStorage so contributor dashboard picks it up
    const stored = JSON.parse(localStorage.getItem('contributor_quizzes' ) || '[]')
    const newQuiz = {
      id: `cq_${Date.now()}`,
      title: name,
      category,
      subcategory,
      tags,
      numQuestions,
      totalTimeMinutes,
      questions
    }
    stored.unshift(newQuiz)
    localStorage.setItem('contributor_quizzes', JSON.stringify(stored))
    setStage('done')
    // navigate back to contributor dashboard after brief delay
    setTimeout(() => navigate('/'), 800)
  }

  return (
    <Box sx={{ p: 3 }}>
      {stage === 'details' && (
        <Box>
          <Typography variant="h5">Create Quiz — Details</Typography>
          <Box sx={{ mt: 2 }}>
            <DetailsPanel
              name={name}
              setName={setName}
              category={category}
              setCategory={setCategory}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              tagsText={tagsText}
              setTagsText={setTagsText}
              addTagFromText={addTagFromText}
              tags={tags}
              numQuestions={numQuestions}
              setNumQuestions={setNumQuestions}
              totalTimeMinutes={totalTimeMinutes}
              setTotalTimeMinutes={setTotalTimeMinutes}
              quizCategories={quizCategories}
              onNext={() => navigate('/quiz-catalog', { state: { category, totalTimeMinutes } })}
              onCancel={() => navigate(-1)}
            />
          </Box>
        </Box>
      )}

      {stage === 'editor' && (
        <Box>
          <Typography variant="h5">Add Questions</Typography>
          <QuestionEditor
            questionTypes={questionTypes}
            qType={qType}
            setQType={setQType}
            qStem={qStem}
            setQStem={setQStem}
            qOptions={qOptions}
            setQOptions={setQOptions}
            qOptionsArr={qOptionsArr}
            setQOptionsArr={setQOptionsArr}
            qLeftMatch={qLeftMatch}
            setQLeftMatch={setQLeftMatch}
            qRightMatch={qRightMatch}
            setQRightMatch={setQRightMatch}
            qDragItems={qDragItems}
            setQDragItems={setQDragItems}
            qImageUrl={qImageUrl}
            setQImageUrl={setQImageUrl}
            qHotspots={qHotspots}
            setQHotspots={setQHotspots}
            qAssertionA={qAssertionA}
            qAssertionR={qAssertionR}
            qAnswer={qAnswer}
            setQAnswer={setQAnswer}
            addQuestion={addQuestion}
            questions={questions}
            editingId={editingId}
            onEditQuestion={editQuestion}
            onCancelEdit={cancelEdit}
            onDeleteQuestion={deleteQuestion}
            buildPreviewData={buildPreviewData}
            finishCreate={finishCreate}
            setStage={setStage}
          />
        </Box>
      )}

      {stage === 'done' && (
        <Box>
          <Typography variant="h5">Quiz created</Typography>
          <Typography variant="body2">The quiz was saved locally and you will be redirected shortly.</Typography>
        </Box>
      )}
    </Box>
  )
}

export default ContributorQuizBuilder
