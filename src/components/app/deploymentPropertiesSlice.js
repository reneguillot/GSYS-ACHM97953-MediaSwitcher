import { createSlice } from '@reduxjs/toolkit';

export const deploymentPropertiesSlice = createSlice({
    name: 'deploymentProperties',
    initialState: {
        value: { }
    },
    reducers: {
        setDeploymentProperties: (state, newValue) => {
            state.value = newValue.payload;
        }
    }
});

export const { setDeploymentProperties } = deploymentPropertiesSlice.actions;
export default deploymentPropertiesSlice.reducer;
