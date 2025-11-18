import React from 'react'
import { Box, Typography } from '@mui/material'

type QuestionRecord = {
  id: string
  type: string
  data: any
}

type Props = { questions: QuestionRecord[] }

const QuestionsList: React.FC<Props> = ({ questions }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Questions ({questions.length})</Typography>
      {questions.map((q) => (
        <Box key={q.id} sx={{ p: 1, mt: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2">{q.type}</Typography>
          <Typography variant="body2">{q.data.stem}</Typography>
        </Box>
      ))}
    </Box>
  )
}

export default QuestionsList
