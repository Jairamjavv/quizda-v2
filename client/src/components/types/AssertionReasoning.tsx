import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';

interface Props { data: { question: string; assertion?: { A?: string; R?: string } } }

const AssertionReasoning: React.FC<Props> = ({ data }) => {
  const [value, setValue] = useState<string>('');

  const choices = [
    { id: '1', label: 'A true, R true, R explains A' },
    { id: '2', label: 'A true, R true, R does not explain A' },
    { id: '3', label: 'A true, R false' },
    { id: '4', label: 'A false, R true' },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.question}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}><strong>Assertion:</strong> {data.assertion?.A}</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}><strong>Reason:</strong> {data.assertion?.R}</Typography>
        <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
          <Stack spacing={1}>
            {choices.map((c) => (
              <FormControlLabel key={c.id} value={c.id} control={<Radio />} label={c.label} />
            ))}
          </Stack>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default AssertionReasoning;
