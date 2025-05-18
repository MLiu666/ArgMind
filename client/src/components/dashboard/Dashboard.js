import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Create as CreateIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const progressData = {
    essaysCompleted: 5,
    totalEssays: 10,
    skillLevels: {
      thesis: 75,
      evidence: 60,
      reasoning: 80,
      organization: 70,
    },
  };

  const recentPrompts = [
    {
      id: 1,
      title: 'Technology in Education',
      difficulty: 'intermediate',
      category: 'education',
    },
    {
      id: 2,
      title: 'Climate Change Solutions',
      difficulty: 'advanced',
      category: 'environmental',
    },
    {
      id: 3,
      title: 'Social Media Impact',
      difficulty: 'beginner',
      category: 'social',
    },
  ];

  const recentEssays = [
    {
      id: 1,
      title: 'The Impact of AI on Society',
      status: 'reviewed',
      score: 85,
    },
    {
      id: 2,
      title: 'Environmental Conservation',
      status: 'submitted',
      score: null,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUpIcon sx={{ mr: 2 }} color="primary" />
              <Typography variant="h5">Your Progress</Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Essays Completed: {progressData.essaysCompleted}/{progressData.totalEssays}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(progressData.essaysCompleted / progressData.totalEssays) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              Skill Levels
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(progressData.skillLevels).map(([skill, level]) => (
                <Grid item xs={6} key={skill}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={level}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              fullWidth
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={() => navigate('/essay-builder')}
              sx={{ mb: 2 }}
            >
              Start New Essay
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate('/prompts')}
            >
              Browse Prompts
            </Button>
          </Paper>
        </Grid>

        {/* Recent Essays */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Essays
            </Typography>
            <List>
              {recentEssays.map((essay) => (
                <ListItem key={essay.id}>
                  <ListItemText
                    primary={essay.title}
                    secondary={
                      <Chip
                        label={essay.status}
                        color={essay.status === 'reviewed' ? 'success' : 'warning'}
                        size="small"
                      />
                    }
                  />
                  <ListItemSecondaryAction>
                    {essay.score && (
                      <Typography variant="body2" color="primary">
                        Score: {essay.score}%
                      </Typography>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Available Prompts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Prompts
            </Typography>
            <Grid container spacing={2}>
              {recentPrompts.map((prompt) => (
                <Grid item xs={12} key={prompt.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{prompt.title}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={prompt.difficulty}
                          color={
                            prompt.difficulty === 'beginner'
                              ? 'success'
                              : prompt.difficulty === 'intermediate'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip label={prompt.category} size="small" />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => navigate('/essay-builder')}>
                        Start Writing
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 