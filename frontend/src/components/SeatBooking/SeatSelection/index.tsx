import React from 'react';
import { Grid, Button } from '@mui/material';

interface Seat {
  number: string;
  isLocked: boolean;
}

interface SeatSelectionProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSeatSelection: (seatNumber: string) => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ seats, selectedSeat, onSeatSelection }) => {
  return (
    <Grid container spacing={2} style={{ marginTop: 10 }}>
      {seats.map(seat => (
        <Grid item key={seat.number}>
          <Button
            variant={seat.isLocked || seat.number === selectedSeat ? 'contained' : 'outlined'}
            disabled={seat.isLocked}
            onClick={() => onSeatSelection(seat.number)}
          >
            {seat.number}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default SeatSelection;
