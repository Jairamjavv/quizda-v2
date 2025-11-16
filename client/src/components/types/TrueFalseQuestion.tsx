import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';

interface Props { data: { question: string } }

const TrueFalseQuestion: React.FC<Props> = ({ data }) => {
  const [value, setValue] = useState<string>('');

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.question}
        </Typography>
        <FormControl component="fieldset" aria-label="True or False">
          <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControlLabel value="true" control={<Radio />} label="True" />
              <FormControlLabel value="false" control={<Radio />} label="False" />
            </Stack>
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
};

export default TrueFalseQuestion;
