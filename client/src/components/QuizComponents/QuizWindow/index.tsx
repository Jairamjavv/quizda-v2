import React, { useEffect, useState } from 'react'
import { Dialog, Box } from '@mui/material'
import { QuizMode, Question } from '../types'
import { QuizAppBar } from './QuizAppBar'
import { QuestionDisplay } from './QuestionDisplay'
import { SubmitConfirmDialog } from './SubmitConfirmDialog'
import { apiGetQuizQuestions, apiCreateAttempt, apiCompleteAttempt } from '../../../services/quizApi'

type Props = {
  open: boolean
  onClose: () => void
  mode: QuizMode
  quizId: string | number
  title?: string
  totalTimeSeconds?: number
}

const QuizWindow: React.FC<Props> = ({ open, onClose, mode, quizId, title, totalTimeSeconds }) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({})
  const [remaining, setRemaining] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)

  useEffect(() => {
    setIndex(0)
    setSelected(null)
    setAnswers({})
    setBookmarks({})
    setAttemptId(null)
    setStartedAt(null)
    if (!open) return

    // Fetch questions from backend when window opens
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiGetQuizQuestions(quizId)
        const qs = res.questions || []
        setQuestions(qs)

        // Create attempt record
        const attempt = await apiCreateAttempt({ quizId, totalQuestions: qs.length })
        if (attempt && attempt.id) {
          setAttemptId(attempt.id)
        }
        setStartedAt(Date.now())
      } catch (err) {
        console.error('Failed to load questions or start attempt', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [quizId, mode, open])

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
    // Build answers payload and complete attempt
    ;(async () => {
      try {
        const qs = questions
        const total = qs.length
        let correct = 0
        const payloadAnswers = qs.map((q, idx) => {
          const userAns = typeof answers[q.id] !== 'undefined' ? answers[q.id] : null
          const isCorrect = typeof q.answerIndex === 'number' && userAns !== null ? userAns === q.answerIndex : false
          if (isCorrect) correct += 1
          return {
            questionIndex: idx,
            userAnswer: userAns,
            isCorrect,
            timeSpent: null,
          }
        })

        const score = total > 0 ? Math.round((correct / total) * 100) : 0
        const timeTaken = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : null

        if (!attemptId) {
          // No attempt record; still close and record locally
          console.warn('No attemptId available when submitting')
          onClose()
          return
        }

        await apiCompleteAttempt(attemptId, {
          score,
          correctAnswers: correct,
          timeTaken,
          answers: payloadAnswers,
        })

        onClose()
      } catch (err) {
        console.error('Failed to complete attempt', err)
        onClose()
      }
    })()
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <QuizAppBar
        categoryId={title || String(quizId)}
        onClose={onClose}
        mode={mode}
        remaining={remaining}
      />

      <Box sx={{ p: 3 }}>
        {loading ? (
          <div>Loading questions...</div>
        ) : questions.length === 0 ? (
          <div>No questions found for this quiz.</div>
        ) : (
          <QuestionDisplay
            question={questions[index]}
            selected={selected}
            isBookmarked={bookmarks[questions[index].id] || false}
            isLastQuestion={index === questions.length - 1}
            onSelect={handleSelect}
            onToggleBookmark={() => toggleBookmark(questions[index].id)}
            onNext={handleNext}
          />
        )}
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
