import React from 'react'
import { Box, Typography } from '@mui/material'

type Props = { qType: string }

const NoticeBoard: React.FC<Props> = ({ qType }) => {
  const mono = { fontFamily: 'monospace', bgcolor: 'action.hover', p: 1, borderRadius: 1 }
  switch (qType) {
    case 'MCQ':
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>MCQ — single answer</Typography>
          <Typography variant="body2">Enter options separated by <strong>|</strong>. Example:</Typography>
          <Box sx={mono} component="pre">Option A | Option B | Option C</Box>
          <Typography variant="caption">The preview shows radio buttons; select the correct answer when saving.</Typography>
        </Box>
      )
    case 'True/False':
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>True / False</Typography>
          <Typography variant="body2">No options required. Use the Answer selector to pick True or False.</Typography>
          <Box sx={mono} component="pre">Answer Selector: True | False</Box>
        </Box>
      )
    case 'Multiple Response':
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Multiple Response — choose many</Typography>
          <Typography variant="body2">Provide pipe-separated options. Multiple checkboxes will be shown.</Typography>
          <Box sx={mono} component="pre">Red | Blue | Green | Yellow</Box>
        </Box>
      )
    case 'Fill-in-the-Blank':
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Fill-in-the-Blank</Typography>
          <Typography variant="body2">Type the question stem and the expected answer in the Answer field.</Typography>
          <Box sx={mono} component="pre">The capital of France is _____  (Answer: Paris)</Box>
        </Box>
      )
    case 'Matching':
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Matching</Typography>
          <Typography variant="body2">Provide pairs using the options field (pipe separated). Use the same number of items for left and right.</Typography>
          <Box sx={mono} component="pre">Left1 | Left2 | Left3\nRight1 | Right2 | Right3</Box>
        </Box>
      )
    case 'Drag and Drop':
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Drag and Drop</Typography>
          <Typography variant="body2">Provide an ordered list of items (pipe separated). Users will be able to reorder them visually.</Typography>
          <Box sx={mono} component="pre">Boil water | Add tea | Pour water | Serve</Box>
        </Box>
      )
    case 'Hotspot':
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Hotspot — Coming soon</Typography>
          <Typography variant="body2">Hotspot questions are temporarily disabled and will be available soon.</Typography>
        </Box>
      )
    case 'Assertion and Reasoning':
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Assertion & Reasoning</Typography>
          <Typography variant="body2">Provide assertion and reason text. The UI will show four standard choices.</Typography>
          <Box sx={mono} component="pre">A: &lt;Assertion text&gt;\nR: &lt;Reason text&gt;</Box>
        </Box>
      )
    default:
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>How to author</Typography>
          <Typography variant="body2">Choose a question type and follow the guidance shown for each type. Use <strong>|</strong> to separate options when requested.</Typography>
        </Box>
      )
  }
}

export default NoticeBoard
