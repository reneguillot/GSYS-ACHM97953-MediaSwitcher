import { createSlice } from '@reduxjs/toolkit';

export const runtimeSlice = createSlice({
    name: 'runtime',
    initialState: {
        value: ''
    },
    reducers: {
        setRuntime: (state, newValue) => {
            state.value = newValue.payload;
        }
    }
});

export const { setRuntime } = runtimeSlice.actions;
export default runtimeSlice.reducer;
