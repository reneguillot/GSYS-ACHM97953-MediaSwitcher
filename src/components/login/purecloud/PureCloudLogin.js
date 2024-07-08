import './PureCloudLogin.css';

import { useSelector } from 'react-redux';
import { getEnvironmentConfig } from '../../../config';

import React, { useEffect, Fragment } from 'react';

import { getStorageItem } from 'services/applicationStorage';

const PureCloudLogin = () => {
    const runtimeValue = new URLSearchParams(location.search).get('runtime').trim();

    useEffect(() => {
        console.log('PureCloudLogin component', runtimeValue);
        const queryStringData = {
            response_type: 'token',
            client_id: getEnvironmentConfig(runtimeValue ? runtimeValue : 'production').purecloud.clientId,
            redirect_uri: `${window.location.protocol}//${window.location.host}${process.env.PUBLIC_URL}`
        };

        const param = Object.keys(queryStringData).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryStringData[k])}`).join('&');
        console.log(`Authorization request: ${param}`);

        const envFromSession = getStorageItem('purecloud-csp-env', true, sessionStorage);
        const envFromSessionSanitized = typeof (envFromSession) === 'string' && envFromSession.trim().length > 0 ? envFromSession.trim() : '';
        const href = `https://login.${envFromSessionSanitized}/oauth/authorize?${param}`;
        window.location = href;
    }, [])

    return (<Fragment></Fragment>);
};

export default PureCloudLogin;
