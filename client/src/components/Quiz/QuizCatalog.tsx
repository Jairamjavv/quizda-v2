import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Grid, Paper, MenuItem, Select, InputLabel, FormControl, Pagination } from '@mui/material'
import Fuse from 'fuse.js'
import QuizWindow from './QuizWindow'
import { useQuizzes } from '../../hooks'
import { useCategories } from '../../hooks/useCategories'
import { Button, Text, Badge, Input } from '../ui'
import { spacing } from '../../theme/constants'

type QuizRecord = {
  id: string
  title: string
  category: string
  subcategory?: string
  tags?: string[]
  totalTimeMinutes?: number
  questionsCount: number
  r2Key?: string | null
}

const QuizCatalog: React.FC = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [durationFilter, setDurationFilter] = useState<number | 'any'>('any')
  const { quizzes: fetchedQuizzes } = useQuizzes()
  const [openQuiz, setOpenQuiz] = useState<QuizRecord | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 9

  // Transform quizzes to QuizRecord format with proper data mapping
  const quizzes: QuizRecord[] = useMemo(
    () =>
      fetchedQuizzes.map((q) => ({
        id: String(q.id),
        title: q.title,
        category: q.category || 'General Knowledge',
        subcategory: q.subcategory || '',
        tags: q.tags || [],
        totalTimeMinutes: q.totalTimeMinutes || q.timeLimit || 0,
        questionsCount: q.questionsCount || q.totalQuestions || 0,
        r2Key: q.r2Key || null,
      })),
    [fetchedQuizzes]
  )

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(quizzes, {
      keys: ['title', 'category', 'subcategory', 'tags'],
      threshold: 0.3, // Lower = stricter matching
      includeScore: true,
    })
  }, [quizzes])

  // Apply filters
  const filtered = useMemo(() => {
    let results = quizzes

    // Category filter
    if (categoryFilter !== 'all') {
      results = results.filter((q) => q.category === categoryFilter)
    }

    // Duration filter
    if (durationFilter !== 'any') {
      results = results.filter((q) => {
        if (!q.totalTimeMinutes) return true // Include quizzes without time limit
        return q.totalTimeMinutes <= durationFilter
      })
    }

    // Search filter with Fuse.js (fuzzy search)
    if (searchText.trim()) {
      const searchResults = fuse.search(searchText)
      const searchedIds = new Set(searchResults.map((r) => r.item.id))
      results = results.filter((q) => searchedIds.has(q.id))
    }

    return results
  }, [quizzes, categoryFilter, durationFilter, searchText, fuse])

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => {
    if (page > pageCount) setPage(1)
  }, [pageCount, page])
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  )

  // Get unique categories from quizzes
  const availableCategories = useMemo(() => {
    const cats = new Set(quizzes.map((q) => q.category))
    return Array.from(cats).sort()
  }, [quizzes])

  // Get duration options from quizzes
  const durationOptions = useMemo(() => {
    const durations = quizzes
      .map((q) => q.totalTimeMinutes)
      .filter((d) => d && d > 0)
    return Array.from(new Set(durations)).sort((a, b) => (a || 0) - (b || 0))
  }, [quizzes])

  return (
    <Box sx={{ p: spacing.md }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing.md, mb: spacing.md }}>
        <Button onClick={() => navigate(-1)} variant="outline">
          Back
        </Button>
        <Text as="h6">Quiz Catalog</Text>
        <Box sx={{ flex: 1 }} />
        <Badge variant="primary">{`${filtered.length} quiz${filtered.length !== 1 ? 'zes' : ''}`}</Badge>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: spacing.md, mb: spacing.md, flexWrap: 'wrap' }}>
        {/* Search */}
        <Input
          placeholder="Search quizzes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: '1 1 300px' }}
        />

        {/* Category Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {availableCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Duration Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="duration-label">Duration</InputLabel>
          <Select
            labelId="duration-label"
            value={durationFilter}
            label="Duration"
            onChange={(e: any) => setDurationFilter(e.target.value)}
          >
            <MenuItem value="any">Any Duration</MenuItem>
            {durationOptions.map((d) => (
              <MenuItem key={d} value={d}>
                Up to {d} min
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Quiz Grid */}
      <Grid container spacing={2}>
        {paginated.map((q) => (
          <Grid item xs={12} sm={6} md={4} key={q.id}>
            <Paper
              sx={{
                p: spacing.md,
                cursor: 'pointer',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
              onClick={() => setOpenQuiz(q)}
            >
              <Badge variant="secondary" sx={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
                {`${q.questionsCount} Qs`}
              </Badge>
              <Text as="h6" sx={{ mb: spacing.xs, pr: spacing.lg }}>
                {q.title}
              </Text>
              <Text as="caption" sx={{ display: 'block', mb: spacing.xs, color: 'primary.main' }}>
                {q.category}
              </Text>
              {q.subcategory && (
                <Text as="body2" colorType="secondary" sx={{ mb: spacing.xs }}>
                  {q.subcategory}
                </Text>
              )}
              {q.tags && q.tags.length > 0 && (
                <Text as="caption" colorType="secondary" sx={{ mb: spacing.sm }}>
                  {q.tags.join(', ')}
                </Text>
              )}
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenQuiz(q)
                  }}
                  variant="primary"
                >
                  Take Quiz
                </Button>
                <Text as="caption">{q.totalTimeMinutes ? `${q.totalTimeMinutes} min` : 'No limit'}</Text>
              </Box>
            </Paper>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ p: spacing.lg, textAlign: 'center' }}>
              <Text as="body1" colorType="secondary">
                No quizzes found matching your filters.
              </Text>
              <Text as="body2" colorType="secondary" sx={{ mt: spacing.xs }}>
                Try adjusting your search or filter criteria.
              </Text>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {filtered.length > 0 && (
        <Box sx={{ mt: spacing.lg, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}

      {/* Quiz Window */}
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
