import React from 'react'
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material'

const NoticeBoard: React.FC = () => {
  return (
    <Card sx={{ bgcolor: 'var(--surface)', p: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 1 }}>
          Notice Board
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
          Role descriptions help you choose the right account type. Below is an overview of each role and what it allows you to do.
        </Typography>

        <List disablePadding>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={<strong>Attempter</strong>}
              secondary={
                'A learner who attempts quizzes to practice and assess their knowledge. Attempters can take quizzes, view results, and track progress.'
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemText
              primary={<strong>Contributor</strong>}
              secondary={
                'A community member who creates and submits new quizzes. Contributors can author content and moderate quizzes they create, helping keep the library high-quality.'
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemText
              primary={<strong>Admin</strong>}
              secondary={
                'A super user with access to site-wide management features. Admins can manage users, moderate content globally, and configure application settings.'
              }
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  )
}

export default NoticeBoard
