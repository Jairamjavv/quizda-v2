import React, { useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface HotspotDef { id: string; x: number; y: number; w: number; h: number; label?: string }
interface Props { data: { question: string; image?: string; alt?: string; hotspots?: HotspotDef[] } }

const Hotspot: React.FC<Props> = ({ data }) => {
  // Hotspot feature is temporarily disabled — show a coming-soon message.
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.question}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Hotspot questions are temporarily disabled and will be available soon.
        </Typography>
      </CardContent>
    </Card>
  )
};

export default Hotspot;
