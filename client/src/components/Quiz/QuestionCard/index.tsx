import React, { useState } from 'react'
import { Paper, Box, Typography } from '@mui/material'
import { Question } from './types'
import {
  MCQQuestion,
  TrueFalseQuestion,
  MultipleResponseQuestion,
  FillBlankQuestion,
  MatchingQuestion,
  DragDropQuestion,
  HotspotQuestion,
  AssertionReasoningQuestion
} from './QuestionTypes'

interface Props {
  question: Question
  onAnswerChange?: (answer: any) => void
}

const QuestionCard: React.FC<Props> = ({ question, onAnswerChange }) => {
  const id = question.id || 'q-' + Math.random().toString(36).slice(2, 9)
  
  const getInitialValue = () => {
    switch (question.type) {
      case 'multiple':
        return []
      case 'dragdrop':
        return question.options || []
      case 'matching':
        return {}
      default:
        return ''
    }
  }

  const [selected, setSelected] = useState<any>(getInitialValue())

  const handleChange = (value: any) => {
    setSelected(value)
    onAnswerChange?.(value)
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'mcq':
        return (
          <MCQQuestion
            options={question.options || []}
            selected={selected}
            onChange={handleChange}
            questionId={id}
          />
        )

      case 'truefalse':
        return (
          <TrueFalseQuestion
            selected={selected}
            onChange={handleChange}
            questionId={id}
          />
        )

      case 'multiple':
        return (
          <MultipleResponseQuestion
            options={question.options || []}
            selected={selected}
            onChange={handleChange}
          />
        )

      case 'fill':
        return (
          <FillBlankQuestion
            selected={selected}
            onChange={handleChange}
            questionId={id}
          />
        )

      case 'matching':
        return (
          <MatchingQuestion
            leftMatch={question.leftMatch || []}
            rightMatch={question.rightMatch || []}
            selected={selected}
            onChange={handleChange}
          />
        )

      case 'dragdrop':
        return (
          <DragDropQuestion
            options={question.options || []}
            selected={selected}
            onChange={handleChange}
          />
        )

      case 'hotspot':
        return <HotspotQuestion />

      case 'assertion':
        return question.assertion ? (
          <AssertionReasoningQuestion
            assertion={question.assertion}
            selected={selected}
            onChange={handleChange}
            questionId={id}
          />
        ) : null

      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Unsupported question type.
          </Typography>
        )
    }
  }

  return (
    <Paper
      component="article"
      aria-labelledby={`${id}-title`}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        p: 1.5,
        background: 'background.paper',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        maxWidth: 900,
        m: '8px auto'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          id={`${id}-title`}
          component="h3"
          sx={{ fontSize: '1rem', color: 'text.primary', m: 0 }}
        >
          {question.text}
        </Typography>
        <Box>{renderQuestion()}</Box>
      </Box>
    </Paper>
  )
}

export default QuestionCard
