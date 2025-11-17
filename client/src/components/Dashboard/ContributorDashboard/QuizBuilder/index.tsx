import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import quizCategories from '../../../../data/quizCategories'
import DetailsPanel from '../DetailsPanel'
import QuestionEditor from './QuestionForm/QuestionEditor'
import { QuestionRecord, QuestionFormState, QUESTION_TYPES } from './types'
import { buildPreviewData, buildQuestionData, loadQuestionForEditing, resetQuestionForm } from './utils'

type LocationState = {
  title?: string
  category?: string
  totalTimeMinutes?: number
}

const ContributorQuizBuilder: React.FC = () => {
  const { state } = useLocation()
  const loc = (state || {}) as LocationState
  const navigate = useNavigate()

  // Quiz details state
  const [name, setName] = useState<string>(loc.title || '')
  const [category, setCategory] = useState<string>(loc.category || quizCategories[0])
  const [subcategory, setSubcategory] = useState<string>('')
  const [tagsText, setTagsText] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [numQuestions, setNumQuestions] = useState<number>(5)
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number>(loc.totalTimeMinutes || 5)

  // Stage management
  const [stage, setStage] = useState<'details' | 'editor' | 'done'>('details')
  const [questions, setQuestions] = useState<QuestionRecord[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  // Question form state
  const [qType, setQType] = useState<string>(QUESTION_TYPES[0])
  const [qStem, setQStem] = useState<string>('')
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

  const addTagFromText = () => {
    const parts = tagsText.split(',').map((s) => s.trim()).filter(Boolean)
    setTags((t) => [...t, ...parts])
    setTagsText('')
  }

  const addQuestion = () => {
    if (!qStem.trim()) return
    
    const id = editingId || `q_${Date.now()}`
    const data = buildQuestionData(
      qType, qStem, qOptions, qOptionsArr, qLeftMatch, qRightMatch,
      qDragItems, qImageUrl, qHotspots, qAssertionA, qAssertionR, qAnswer
    )

    if (editingId) {
      setQuestions((qs) => qs.map((q) => q.id === editingId ? { id, type: qType, data } : q))
    } else {
      setQuestions((qs) => [...qs, { id, type: qType, data }])
    }

    resetQuestionForm({
      setQStem, setQOptions, setQOptionsArr, setQLeftMatch, setQRightMatch,
      setQDragItems, setQImageUrl, setQHotspots, setQAssertionA, setQAssertionR, setQAnswer
    })
    setEditingId(null)
  }

  const editQuestion = (id: string) => {
    const q = questions.find((x) => x.id === id)
    if (!q) return
    
    setEditingId(id)
    loadQuestionForEditing(q, {
      setQType, setQStem, setQOptions, setQOptionsArr, setQLeftMatch, setQRightMatch,
      setQDragItems, setQImageUrl, setQHotspots, setQAssertionA, setQAssertionR, setQAnswer
    })
  }

  const deleteQuestion = (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id))
    if (editingId === id) {
      cancelEdit()
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    resetQuestionForm({
      setQStem, setQOptions, setQOptionsArr, setQLeftMatch, setQRightMatch,
      setQDragItems, setQImageUrl, setQHotspots, setQAssertionA, setQAssertionR, setQAnswer
    })
  }

  const handleBuildPreviewData = () => {
    return buildPreviewData(
      qType, qStem, qOptions, qOptionsArr, qLeftMatch, qRightMatch,
      qDragItems, qImageUrl, qHotspots, qAssertionA, qAssertionR
    )
  }

  const finishCreate = () => {
    const stored = JSON.parse(localStorage.getItem('contributor_quizzes') || '[]')
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
            questionTypes={QUESTION_TYPES}
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
            buildPreviewData={handleBuildPreviewData}
            finishCreate={finishCreate}
            setStage={setStage}
          />
        </Box>
      )}

      {stage === 'done' && (
        <Box>
          <Typography variant="h5">Quiz created</Typography>
          <Typography variant="body2">
            The quiz was saved locally and you will be redirected shortly.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ContributorQuizBuilder
