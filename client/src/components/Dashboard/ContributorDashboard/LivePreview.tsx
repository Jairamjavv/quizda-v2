import React from 'react'
import { Paper, Typography } from '@mui/material'
import QuizQuestion from '../../QuizQuestion'

type Props = { previewData: any }

const LivePreview: React.FC<Props> = ({ previewData }) => {
  return (
    <div>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Live Preview</Typography>
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
        <QuizQuestion data={previewData} />
      </Paper>
    </div>
  )
}

export default LivePreview
