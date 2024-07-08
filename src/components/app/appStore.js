import { configureStore } from '@reduxjs/toolkit';
import debugModeReducer from './debugModeSlice';
import runtimeReducer from './runtimeSlice';
import deploymentPropertiesReducer from './deploymentPropertiesSlice';

export default configureStore({
    reducer: {
        debugMode: debugModeReducer,
        runtime: runtimeReducer,
        deploymentProperties: deploymentPropertiesReducer
    }
});
