import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { scannerOpen: false, scannerMode: 'auto' },
  reducers: {
    openScanner(state, action) {
      state.scannerOpen = true;
      state.scannerMode = action.payload?.mode || 'auto';
    },
    closeScanner(state) {
      state.scannerOpen = false;
    },
  },
});

export const { openScanner, closeScanner } = uiSlice.actions;
export default uiSlice.reducer;
