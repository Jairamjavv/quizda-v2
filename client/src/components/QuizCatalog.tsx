import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Button, Grid, Paper, MenuItem, Select, InputLabel, FormControl, Chip, Pagination } from '@mui/material'
import QuizWindow from './QuizComponents/QuizWindow'

type QuizRecord = {
  id: string
  title: string
  category: string
  subcategory?: string
  tags?: string[]
  totalTimeMinutes?: number
}

const QuizCatalog: React.FC = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const s = (state || {}) as { category?: string; totalTimeMinutes?: number }
  const fixedCategory = s.category || ''
  const initialDuration = s.totalTimeMinutes || 0

  const [searchText, setSearchText] = useState('')
  const [durationFilter, setDurationFilter] = useState<number | 'any'>(initialDuration || 'any')
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([])
  const [openQuiz, setOpenQuiz] = useState<QuizRecord | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 6

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('contributor_quizzes') || '[]') as QuizRecord[]
    setQuizzes(stored)
  }, [])

  const filtered = useMemo(() => quizzes.filter((q) => {
    if (fixedCategory && q.category !== fixedCategory) return false
    // durationFilter is now "up to" semantics: include quizzes with time <= selected value
    if (durationFilter !== 'any' && typeof q.totalTimeMinutes === 'number' && q.totalTimeMinutes > durationFilter) return false
    if (!searchText) return true
    const s = searchText.toLowerCase()
    if ((q.subcategory || '').toLowerCase().includes(s)) return true
    if ((q.tags || []).some((t) => t.toLowerCase().includes(s))) return true
    if ((q.title || '').toLowerCase().includes(s)) return true
    return false
  }), [quizzes, fixedCategory, durationFilter, searchText])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => { if (page > pageCount) setPage(1) }, [pageCount])
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h6">Quiz Catalog</Typography>
        <Box sx={{ flex: 1 }} />
        <Chip label={`${filtered.length} quizzes`} color="primary" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Category:</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{fixedCategory || '—'}</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField placeholder="Search subcategory or tag" value={searchText} onChange={(e) => setSearchText(e.target.value)} fullWidth />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="duration-label">Duration</InputLabel>
          <Select labelId="duration-label" value={durationFilter} label="Duration" onChange={(e: any) => setDurationFilter(e.target.value)}>
            <MenuItem value={'any'}>Any</MenuItem>
            {/* populate some common durations from stored quizzes */}
            {Array.from(new Set(quizzes.map((q) => q.totalTimeMinutes).filter(Boolean))).map((d: any) => (
              <MenuItem key={d} value={d}>{d} minutes</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {paginated.map((q) => (
          <Grid item xs={12} sm={6} md={4} key={q.id}>
            <Paper sx={{ p: 2, cursor: 'pointer', position: 'relative' }} onClick={() => setOpenQuiz(q)}>
              <Chip label={`${q.questions?.length ?? 0} Qs`} size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>{q.title}</Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>{q.subcategory || ''}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{(q.tags || []).join(', ')}</Typography>
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button size="small" onClick={(e) => { e.stopPropagation(); setOpenQuiz(q) }}>Take quiz</Button>
                <Typography variant="caption">{q.totalTimeMinutes ? `${q.totalTimeMinutes} min` : '—'}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2">No quizzes found for this category/duration. You can go back to change the category or try different filters.</Typography>
          </Box>
        )}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} color="primary" />
      </Box>

      {openQuiz && (
        <QuizWindow open={true} onClose={() => setOpenQuiz(null)} mode={openQuiz.totalTimeMinutes ? 'timed' : 'zen'} categoryId={openQuiz.title} totalTimeSeconds={openQuiz.totalTimeMinutes ? openQuiz.totalTimeMinutes * 60 : undefined} />
      )}
    </Box>
  )
}

export default QuizCatalog
