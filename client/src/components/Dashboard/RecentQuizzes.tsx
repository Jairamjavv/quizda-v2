import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material'
import { Card, Text } from '../ui'
import { spacing } from '../../theme/constants'
import { RecentQuiz } from './types'

const RecentQuizzes: React.FC<{
  recent: RecentQuiz[]
  loading: boolean
  topN: number
  setTopN: (n: number) => void
}> = ({ recent, loading, topN, setTopN }) => {
  return (
    <Card padding="md" shadow="sm">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: spacing.md }}>
        <Text as="body2" weight="medium" colorType="secondary">
          Recent Quizzes
        </Text>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="topn-label">Top</InputLabel>
          <Select labelId="topn-label" value={topN} label="Top" onChange={(e) => setTopN(Number(e.target.value))}>
            {[10, 20, 30, 40, 50].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Text as="body2">Loading…</Text>
      ) : (
        <List sx={{ maxHeight: 280, overflow: 'auto' }}>
          {recent.map((r) => (
            <ListItem key={r.id} divider>
              <ListItemText primary={r.title} secondary={`${r.score}% — ${r.date || ''}`} />
            </ListItem>
          ))}
        </List>
      )}
    </Card>
  )
}

export default RecentQuizzes
