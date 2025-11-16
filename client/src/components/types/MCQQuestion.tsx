import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';

interface Option { id: string; label: string }
interface Props { data: { id?: string; question: string; options?: Option[] } }

const MCQQuestion: React.FC<Props> = ({ data }) => {
  const [value, setValue] = useState<string>('');
  const options = data.options || [];

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {data.question}
        </Typography>
        <FormControl component="fieldset" aria-label="MCQ options">
          <RadioGroup
            value={value}
            onChange={(e) => setValue(e.target.value)}
            name={`mcq-${data.id || 'q'}`}
          >
            <Stack spacing={1}>
              {options.map((opt) => (
                <FormControlLabel
                  key={opt.id}
                  value={opt.id}
                  control={<Radio />}
                  label={opt.label}
                  sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' }, px: 1 }}
                />
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
};

export default MCQQuestion;
