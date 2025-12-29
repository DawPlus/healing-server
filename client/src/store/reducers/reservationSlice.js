import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedReservationId: null,
  lastCreatedReservationId: null,
};

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    setSelectedReservation: (state, action) => {
      state.selectedReservationId = action.payload;
    },
    setLastCreatedReservation: (state, action) => {
      state.lastCreatedReservationId = action.payload;
    },
    clearReservation: (state) => {
      state.selectedReservationId = null;
      state.lastCreatedReservationId = null;
    }
  }
});

export const { setSelectedReservation, setLastCreatedReservation, clearReservation } = reservationSlice.actions;

export default reservationSlice.reducer; 