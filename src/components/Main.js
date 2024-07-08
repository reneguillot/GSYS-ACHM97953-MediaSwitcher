import React, { useEffect, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { setDebugMode } from './app/debugModeSlice';
import { setRuntime } from './app/runtimeSlice';
import { setDeploymentProperties } from './app/deploymentPropertiesSlice';

// Services and utilities
import { GCloud } from 'services/gcloud';
import { logToConsole } from 'components/utils';

// Other
import { getParameterByName } from '../services/utils';
import { setStorageItem, getStorageItem, removeStorageItem } from 'services/applicationStorage';
import { AppReleaseData } from './AppReleaseData';

// Genesys Spark UI
import { registerElements } from 'genesys-spark-components';
import 'genesys-spark-components/dist/genesys-webcomponents/genesys-webcomponents.css';
registerElements();

const Main = ({}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    let runtimeValue = useSelector((state) => state.runtime.value);
    console.log('Main Runtime', runtimeValue);

    useEffect(() => {
        console.log('starting useEffect');
        // Determine whether to activate debug mode (extra console logging / data feed to UI)
        const debugMode = (new URLSearchParams(location.search).get('debug') === 'true');

        if (debugMode === true) {
            logToConsole(debugMode, 'Main:init - Debug mode active');
            logToConsole(debugMode, `${ AppReleaseData.appName } - v${ AppReleaseData.appVersion } (${ AppReleaseData.appBuildDate })`);
            dispatch(setDebugMode(debugMode));
        }
        GCloud.consoleLogging = debugMode;

        console.log(`rtv: ${!runtimeValue} -> |${runtimeValue}|`);
        if (!runtimeValue) {
            let runtimeEnvironment = new URLSearchParams(location.search).get('runtime');
            runtimeValue = (!runtimeEnvironment) ? process.env.REACT_APP_CUSTOM_ENV.trim() : runtimeEnvironment.trim();
            logToConsole(debugMode, 'Main:init - Runtime Environment', runtimeValue);

            dispatch(setRuntime(runtimeValue));    
        }

        const purecloudInitialization = async () => {
            let env = new URLSearchParams(location.search).get('environment');
            if (!env) {
                env = 'mypurecloud.ie';
            }

            setStorageItem('purecloud-csp-env', env, true, sessionStorage);
            logToConsole(debugMode, 'Main:init - GCX environment: ', runtimeValue, env);

            if (getParameterByName('access_token')) {
                setStorageItem(`purecloud-csp-token`, getParameterByName('access_token'), true, sessionStorage);
            }
            
            const envFromSession = getStorageItem('purecloud-csp-env', true, sessionStorage);
            const envFromSessionSanitized = typeof (envFromSession) === 'string' && envFromSession.trim().length > 0 ? envFromSession.trim() : '';
            const envToken = getStorageItem('purecloud-csp-token', true, sessionStorage);
            const envTokenSanitized = typeof (envToken) === 'string' && envToken.trim().length > 0 ? envToken.trim() : '';

            if (envToken) {
                try {
                    logToConsole(debugMode, 'Main:init - Starting GCX authentication and validation...');
                    GCloud.initialize(envFromSessionSanitized, envTokenSanitized);
                    GCloud.supportedMediaTypes_DataTableName = 'MediaSwitcher_SupportedMediaTypes';
                    dispatch(setDeploymentProperties({ supportedMediaTypes_DataTableName: 'MediaSwitcher_SupportedMediaTypes' } ));

                    navigate(`${process.env.PUBLIC_URL}/home`);
                } catch (error) {
                    if (error.status === 401 && error.code === 'bad.credentials') {
                        // Handle expired token
                        removeStorageItem('purecloud-csp-token', true, sessionStorage);
                        logToConsole(debugMode, 'Main:init - Invalid GCX token - Redirecting to login page');
                        navigate(`${process.env.PUBLIC_URL}/login?runtime=${runtimeValue}`);
                    } else {
                        logToConsole(trie, 'Main:init - Exception', error.message);
                        navigate(`${process.env.PUBLIC_URL}/unauthorized`, error.message);
                    }
                }
            }
            else {
                logToConsole(debugMode, 'Main:init - No token, proceed to login');
                navigate(`${process.env.PUBLIC_URL}/login?runtime=${runtimeValue}`);
            } 
        };

        purecloudInitialization();
        // eslint-disable-next-line
    }, []);

    return (<Fragment></Fragment>);
}

export default Main;
