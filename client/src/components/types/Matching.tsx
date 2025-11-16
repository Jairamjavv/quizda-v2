import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';

interface Props { data: { question: string; left?: string[]; right?: string[]; leftMatch?: string[]; rightMatch?: string[] } }

const Matching: React.FC<Props> = ({ data }) => {
  const left = data.left || data.leftMatch || [];
  const right = data.right || data.rightMatch || [];
  const [matches, setMatches] = useState<Record<number, string>>({});

  const handle = (index: number, value: string) => setMatches((m) => ({ ...m, [index]: value }));

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.question}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box component="div">
              {left.map((term, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2">{term}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              {left.map((_, i) => (
                <FormControl key={i} fullWidth sx={{ mb: 1 }}>
                  <Select
                    value={matches[i] || ''}
                    onChange={(e) => handle(i, e.target.value)}
                    displayEmpty
                    inputProps={{ 'aria-label': `Match for ${i}` }}
                  >
                    <MenuItem value="">—</MenuItem>
                    {right.map((opt, j) => (
                      <MenuItem key={j} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Matching;
