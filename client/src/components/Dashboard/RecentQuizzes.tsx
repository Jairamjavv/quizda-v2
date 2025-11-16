import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material'
import { RecentQuiz } from './types'

const RecentQuizzes: React.FC<{
  recent: RecentQuiz[]
  loading: boolean
  topN: number
  setTopN: (n: number) => void
}> = ({ recent, loading, topN, setTopN }) => {
  return (
    <Card sx={{ bgcolor: 'var(--surface)', p: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>
            Recent Quizzes
          </Typography>
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
          <Typography>Loading…</Typography>
        ) : (
          <List sx={{ maxHeight: 280, overflow: 'auto' }}>
            {recent.map((r) => (
              <ListItem key={r.id} divider>
                <ListItemText primary={r.title} secondary={`${r.score}% — ${r.date || ''}`} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentQuizzes
