import { createSlice } from '@reduxjs/toolkit';

export const debugModeSlice = createSlice({
    name: 'debugMode',
    initialState: {
        value: false
    },
    reducers: {
        setDebugMode: (state, newValue) => {
            state.value = newValue.payload;
        }
    }
});

export const { setDebugMode } = debugModeSlice.actions;
export default debugModeSlice.reducer;
