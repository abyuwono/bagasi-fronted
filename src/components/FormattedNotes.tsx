import React from 'react';
import { Typography } from '@mui/material';

interface FormattedNotesProps {
  notes: string;
}

const FormattedNotes: React.FC<FormattedNotesProps> = ({ notes }) => {
  const formatText = (text: string) => {
    // Replace newlines with <br/>
    let formattedText = text.replace(/\n/g, '<br/>');
    
    // Replace bold markdown with styled spans
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace italic markdown with styled spans
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return formattedText;
  };

  return (
    <Typography
      component="div"
      dangerouslySetInnerHTML={{ __html: formatText(notes || '') }}
      sx={{
        '& strong': {
          fontWeight: 'bold',
        },
        '& em': {
          fontStyle: 'italic',
        },
        whiteSpace: 'pre-wrap',
      }}
    />
  );
};

export default FormattedNotes;
