import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

interface Props { data: { question: string } }

const FillBlank: React.FC<Props> = ({ data }) => {
  const [value, setValue] = useState<string>('');

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.question}
        </Typography>
        <TextField
          fullWidth
          placeholder="Type your answer..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Fill in the blank answer"
        />
      </CardContent>
    </Card>
  );
};

export default FillBlank;
