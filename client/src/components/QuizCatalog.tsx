import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Grid, Paper, MenuItem, Select, InputLabel, FormControl, Pagination } from '@mui/material'
import QuizWindow from './QuizComponents/QuizWindow'
import { useQuizzes } from '../hooks'
import { Button, Text, Badge, Input } from './ui'
import { spacing } from '../theme/constants'
import quizCategories from '../data/quizCategories'

type QuizRecord = {
  id: string
  title: string
  category: string
  subcategory?: string
  tags?: string[]
  totalTimeMinutes?: number
  questions?: any[]
}

const QuizCatalog: React.FC = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const s = (state || {}) as { category?: string; totalTimeMinutes?: number }
  const fixedCategory = s.category || ''
  const initialDuration = s.totalTimeMinutes || 0

  const [selectedCategory, setSelectedCategory] = useState<string>(fixedCategory || '')

  const [searchText, setSearchText] = useState('')
  const [durationFilter, setDurationFilter] = useState<number | 'any'>(initialDuration || 'any')
  const { quizzes: fetchedQuizzes } = useQuizzes()
  const [openQuiz, setOpenQuiz] = useState<QuizRecord | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 6

  // Transform quizzes to QuizRecord format (preserve fields from API)
  const quizzes: QuizRecord[] = useMemo(() =>
    fetchedQuizzes.map((q: any) => ({
      id: String(q.id),
      title: q.title,
      category: q.category || 'General',
      subcategory: q.subcategory || '',
      tags: q.tags || [],
      totalTimeMinutes:
        typeof q.totalTimeMinutes === 'number'
          ? q.totalTimeMinutes
          : q.timeLimit
          ? Math.ceil(q.timeLimit / 60)
          : undefined,
      questions: q.questions || undefined,
      questionsCount: q.questions?.length ?? q.totalQuestions ?? q.questionsCount ?? 0,
    })),
    [fetchedQuizzes]
  )

  const filtered = useMemo(() => quizzes.filter((q) => {
    if (selectedCategory && q.category !== selectedCategory) return false
    // durationFilter is now "up to" semantics: include quizzes with time <= selected value
    if (durationFilter !== 'any' && typeof q.totalTimeMinutes === 'number' && q.totalTimeMinutes > durationFilter) return false
    if (!searchText) return true
    const s = searchText.toLowerCase()
    if ((q.subcategory || '').toLowerCase().includes(s)) return true
    if ((q.category || '').toLowerCase().includes(s)) return true
    if ((q.tags || []).some((t) => (t || '').toLowerCase().includes(s))) return true
    if ((q.title || '').toLowerCase().includes(s)) return true
    return false
  }), [quizzes, selectedCategory, durationFilter, searchText])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => { if (page > pageCount) setPage(1) }, [pageCount])
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  return (
    <Box sx={{ p: spacing.md }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing.md, mb: spacing.md }}>
        <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
        <Text as="h6">Quiz Catalog</Text>
        <Box sx={{ flex: 1 }} />
        <Badge variant="primary">{`${filtered.length} quizzes`}</Badge>
        <Text as="body2" colorType="secondary">Category:</Text>
        <Text as="subtitle1" weight="semibold">{selectedCategory || '—'}</Text>
      </Box>

      <Box sx={{ display: 'flex', gap: spacing.md, mb: spacing.md, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={selectedCategory}
            label="Category"
            onChange={(e: any) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value={''}>All</MenuItem>
            {quizCategories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Input placeholder="Search title, subcategory or tag" value={searchText} onChange={(e) => setSearchText(e.target.value)} fullWidth />

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
            <Paper sx={{ p: spacing.md, cursor: 'pointer', position: 'relative' }} onClick={() => setOpenQuiz(q)}>
              <Badge variant="secondary" sx={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
                {`${q.questions?.length ?? 0} Qs`}
              </Badge>
              <Text as="h6" sx={{ mb: spacing.xs }}>{q.title}</Text>
              <Text as="caption" sx={{ display: 'block', mb: spacing.xs }}>{q.subcategory || ''}</Text>
              <Text as="body2" colorType="secondary">{(q.tags || []).join(', ')}</Text>
              <Box sx={{ mt: spacing.xs, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); setOpenQuiz(q) }} variant="primary">
                  Take quiz
                </Button>
                <Text as="caption">{q.totalTimeMinutes ? `${q.totalTimeMinutes} min` : '—'}</Text>
              </Box>
            </Paper>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Box sx={{ p: spacing.md }}>
            <Text as="body2">No quizzes found for this category/duration. You can go back to change the category or try different filters.</Text>
          </Box>
        )}
      </Grid>

      <Box sx={{ mt: spacing.lg, display: 'flex', justifyContent: 'center' }}>
        <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} color="primary" />
      </Box>

      {openQuiz && (
        <QuizWindow
          open={true}
          onClose={() => setOpenQuiz(null)}
          mode={openQuiz.totalTimeMinutes ? 'timed' : 'zen'}
          quizId={openQuiz.id}
          title={openQuiz.title}
          totalTimeSeconds={openQuiz.totalTimeMinutes ? openQuiz.totalTimeMinutes * 60 : undefined}
        />
      )}
    </Box>
  )
}

export default QuizCatalog
