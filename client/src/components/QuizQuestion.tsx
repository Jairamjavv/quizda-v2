import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import MCQQuestion from './types/MCQQuestion';
import TrueFalseQuestion from './types/TrueFalseQuestion';
import MultipleResponse from './types/MultipleResponse';
import FillBlank from './types/FillBlank';
import Matching from './types/Matching';
import DragDrop from './types/DragDrop';
import Hotspot from './types/Hotspot';
import AssertionReasoning from './types/AssertionReasoning';

type QuizData = any;

interface Props {
  data: QuizData;
}

const QuizQuestion: React.FC<Props> = ({ data }) => {
  const type = (data && data.type) || '';

  const renderByType = () => {
    switch (type) {
      case 'mcq':
        return <MCQQuestion data={data} />;
      case 'true_false':
        return <TrueFalseQuestion data={data} />;
      case 'multiple_response':
        return <MultipleResponse data={data} />;
      case 'fill_blank':
        return <FillBlank data={data} />;
      case 'matching':
        return <Matching data={data} />;
      case 'drag_drop':
        return <DragDrop data={data} />;
      case 'hotspot':
        return <Hotspot data={data} />;
      case 'assertion_reasoning':
        return <AssertionReasoning data={data} />;
      default:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Unsupported question type</Typography>
            <Typography variant="body2">Type: {String(type)}</Typography>
          </Box>
        );
    }
  };

  return <Box sx={{ width: '100%' }}>{renderByType()}</Box>;
};

export default QuizQuestion;

/* Sample JSON input
{
  "type": "mcq",
  "question": "Which planet is known as the Red Planet?",
  "options": [
    { "id": "a", "label": "Earth" },
    { "id": "b", "label": "Mars" },
    { "id": "c", "label": "Jupiter" }
  ]
}
*/
