import React, { useEffect, useState } from 'react'
import { Dialog, Box } from '@mui/material'
import { QuizMode, Question } from '../types'
import { QuizAppBar } from './QuizAppBar'
import { QuestionDisplay } from './QuestionDisplay'
import { SubmitConfirmDialog } from './SubmitConfirmDialog'

type Props = {
  open: boolean
  onClose: () => void
  mode: QuizMode
  categoryId: string
  totalTimeSeconds?: number
}

// Simple mock questions generator
function makeQuestions(categoryId: string): Question[] {
  return [
    { id: 'q1', text: `Sample question 1 (${categoryId})`, choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q2', text: `Sample question 2 (${categoryId})`, choices: ['True', 'False'], answerIndex: 1 },
    { id: 'q3', text: `Sample question 3 (${categoryId})`, choices: ['1', '2', '3'], answerIndex: 2 }
  ]
}

const QuizWindow: React.FC<Props> = ({ open, onClose, mode, categoryId, totalTimeSeconds }) => {
  const [questions] = useState<Question[]>(() => makeQuestions(categoryId))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({})
  const [remaining, setRemaining] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    setIndex(0)
    setSelected(null)
    setAnswers({})
  }, [categoryId, mode])

  useEffect(() => {
    if (mode !== 'timed' || !totalTimeSeconds || !open) {
      setRemaining(null)
      return
    }

    setRemaining(totalTimeSeconds)
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r === null) return null
        if (r <= 1) {
          clearInterval(t)
          setConfirmOpen(true)
          return 0
        }
        return r - 1
      })
    }, 1000)

    return () => clearInterval(t)
  }, [mode, totalTimeSeconds, open])

  const handleSelect = (i: number) => setSelected(i)

  const toggleBookmark = (questionId: string) => {
    setBookmarks((b) => ({ ...b, [questionId]: !b[questionId] }))
  }

  const handleNext = () => {
    if (selected !== null) {
      setAnswers((a) => ({ ...a, [questions[index].id]: selected }))
    }
    setSelected(null)
    if (index < questions.length - 1) {
      setIndex((s) => s + 1)
    } else {
      setConfirmOpen(true)
    }
  }

  const handleConfirmSubmit = () => {
    if (selected !== null) {
      setAnswers((a) => ({ ...a, [questions[index].id]: selected }))
    }
    setConfirmOpen(false)
    onClose()
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <QuizAppBar
        categoryId={categoryId}
        onClose={onClose}
        mode={mode}
        remaining={remaining}
      />

      <Box sx={{ p: 3 }}>
        <QuestionDisplay
          question={questions[index]}
          selected={selected}
          isBookmarked={bookmarks[questions[index].id] || false}
          isLastQuestion={index === questions.length - 1}
          onSelect={handleSelect}
          onToggleBookmark={() => toggleBookmark(questions[index].id)}
          onNext={handleNext}
        />
      </Box>

      <SubmitConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </Dialog>
  )
}

export default QuizWindow
