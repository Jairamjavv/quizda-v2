import React from 'react'
import { Paper, Box, Typography, RadioGroup, FormControlLabel, Radio, Button, IconButton } from '@mui/material'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'

type Question = {
  id: string
  text: string
  choices: string[]
  answerIndex: number
}

type Props = {
  question: Question
  selected: number | null
  isBookmarked: boolean
  isLastQuestion: boolean
  onSelect: (index: number) => void
  onToggleBookmark: () => void
  onNext: () => void
}

export const QuestionDisplay: React.FC<Props> = ({
  question,
  selected,
  isBookmarked,
  isLastQuestion,
  onSelect,
  onToggleBookmark,
  onNext
}) => {
  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper', width: { xs: '95%', sm: '90%', md: '80%' }, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
          {question.text}
        </Typography>
        <IconButton onClick={onToggleBookmark} aria-label="bookmark">
          {bookmarked ? (
            <BookmarkIcon sx={{ color: 'primary.main' }} />
          ) : (
            <BookmarkBorderIcon sx={{ color: 'text.primary' }} />
          )}
        </IconButton>
      </Box>

      <RadioGroup value={selected ?? ''} onChange={(e) => onSelect(Number(e.target.value))}>
        {question.choices.map((c, i) => (
          <FormControlLabel
            key={i}
            value={i}
            control={<Radio />}
            label={c}
            sx={{ color: 'text.primary' }}
          />
        ))}
      </RadioGroup>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          onClick={onNext}
          variant="contained"
          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </Paper>
  )
}
