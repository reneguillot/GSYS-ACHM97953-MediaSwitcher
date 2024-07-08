import config from '../config';

import { getStorageItem } from 'services/applicationStorage';

// This file supports basic fetch wrapping utilities, additionally with functions that wrap fetch calls for retry functionality.

/**
 * @description Allows the ability to pull a baseUri from configuration. Allows for the ability to support multi-env application base uris.
 * @return {*} string uri 
 */
export const baseUri = () => {
    // Use below commented out if env is saved in storage
    // const env = getStorageItem('app-env', true, sessionStorage)?.value;

    // Use below if you support multi-env application, requires configuration setup.
    // if (env === 'Sandbox') { return config.server.sandbox.baseUri; }
    // if (env === 'Development') { return config.server.dev.baseUri; }
    // if (env === 'Test') { return config.server.test.baseUri; }
    // if (env === 'Production') { return config.server.prod.baseUri; }

    // Use below if you have a simple baseUri
    // return config.server.baseUri;
    return '';
};

/**
 * @description async wrapper for the fetch event api.
 * @param {*} url string | url that's being called
 * @param {*} options object | fetch options
 * @param {*} token string | token for authentication
 * @return {*} standard response
 */
export const fetchWrap = async (url, options, token, auth = true) => {

    const standardResponse = {
        success: false,
        status: 0,
        data: {},
        headers: {},
        url: ''
    };

    let headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    if (auth) {
        headers = { ...headers, Authorization: `Bearer ${token}` }
    }

    const response = await fetch(url, {
        ...options,
        headers: headers
    });

    // need to no-content returns
    if (response.status === 204) {
        standardResponse.data = {};
    } else {
        standardResponse.data = await response.json();
    }

    standardResponse.status = response.status;
    standardResponse.url = response.url;

    response.headers.forEach((value, key) => {
        Object.assign(standardResponse.headers, { [key]: value });
    });

    if (!response.ok) { return Promise.reject(standardResponse); };
    standardResponse.success = true;
    return standardResponse;
};

/**
 * @description async wrapper for the fetchWrap method, allows for retries on the current passed options.
 * @param {*} url string | url that's being called
 * @param {*} options object | fetch options
 * @param {*} token string | token for authentication
 * @param {*} [retries=process.env.REACT_APP_FETCH_RETRIES_COUNT | 3] number | number of retries, defaulted to 3, and defaulted to pull from an appveyor application set variable
 * @return {*} response | last failed response
 */
export const fetchWithRetries = async (url, options, token, auth = true, retries = process.env.REACT_APP_FETCH_RETRIES_COUNT | 3) => {
    const retryErrors = [];
    let responseErrors = [];

    while (retries != 0) {
        retries = retries - 1;

        const envCheck = process.env.REACT_APP_CUSTOM_ENV.trim() == 'local';

        if (process.env.REACT_APP_FETCH_CALL_VERBOSE | envCheck) {
            console.log(`Attempting to URL ${options.method} Request: ${url}. Request Options: ${JSON.stringify(options)}  Retries Left: ${retries}`);
        }
        
        try {
            return await fetchWrap(url, options, token, auth);
        } 
        catch ({ data, success, status, url }) {
            retryErrors.push(`Attempt: ${3 - retries} Success: ${success} | Response Error: ${JSON.stringify(data)} | HTTP Status: ${status}`);
            responseErrors = [...responseErrors, { data, success, status, url}];
        }
    }

    console.log(`Error Retries: ${JSON.stringify(retryErrors)}`);
    throw responseErrors[responseErrors.length - 1];
};

/**
 * @description async wrapper for the fetch all scenario in which you'd want to settle all promises at the same time.
 * @param {*} promises Array<Promises> | promises to be passed and settled at in one call.
 * @return {*} Array<Response<StandardResponse>> | array of responses
 */
export const fetchAllWrap = async (promises) => {
    const response = await Promise.allSettled(promises);
    return response;
};

/**
 * @description async wrapper for the fetchAllWrap scenario in which you'd want to settle all promises at the same time with retries.
 * @param {*} promises Array<Promises> | promises to be passed and settled at in one call.
 * @param {*} [retries=process.env.REACT_APP_FETCH_RETRIES_COUNT | 3] number | number of retries, defaulted to 3, and defaulted to pull from an appveyor application set variable
 * @return {*} Array<Response<StandardResponse>> | array of responses | last failed array of responses.
 */
export const fetchAllWithRetries = async (promises, retries = process.env.REACT_APP_FETCH_RETRIES_COUNT | 3) => {
    const retryErrors = [];
    let responseErrors = [];

    while (retries != 0) {
        retries = retries - 1;

        const envCheck = process.env.REACT_APP_CUSTOM_ENV.trim() == 'local';

        if (process.env.REACT_APP_FETCH_CALL_VERBOSE | envCheck) {
            console.log(`Attempting to Fetch ALL | Promises Length: ${promises.length} Retries Left: ${retries}`);
        }

        try {
            return await fetchAllWrap(promises);
        }
        catch ({ data, success, status, url }) {
            retryErrors.push(`Attempt: ${3 - retries} Success: ${false} | Response Error: ${JSON.stringify(data)}`);
            responseErrors = [...responseErrors, { data, success, status, url }];
        }
    }

    console.log(`Error Retries: ${JSON.stringify(retryErrors)}`);
    throw responseErrors[responseErrors.length - 1];
}

export default {
    fetchWrap,
    fetchWithRetries,
    fetchAllWrap,
    fetchAllWithRetries,
    baseUri
}