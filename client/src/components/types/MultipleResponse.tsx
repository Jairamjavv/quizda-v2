import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';

interface Option { id: string; label: string }
interface Props { data: { question: string; options?: Option[] } }

const MultipleResponse: React.FC<Props> = ({ data }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const options = data.options || [];

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.question}
        </Typography>
        <FormGroup>
          <Stack spacing={1}>
            {options.map((opt) => (
              <FormControlLabel
                key={opt.id}
                control={<Checkbox checked={selected.includes(opt.id)} onChange={() => toggle(opt.id)} />}
                label={opt.label}
                sx={{ px: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
              />
            ))}
          </Stack>
        </FormGroup>
      </CardContent>
    </Card>
  );
};

export default MultipleResponse;
