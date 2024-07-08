import { useLocation } from 'react-router-dom';

// private config

const development = {
    purecloud: {
        clientId: '0ffc409b-64a5-411e-a3d6-dc777c4763ba',
    },
    product: 'purecloud',
    endpoints: {}
}

const production = development
const sandbox = development

export const getEnvironmentConfig = (environment) => {
    console.log('getEnvironmentConfig', environment);
    let derivedConfig;
    if (environment) {
        switch (environment.trim()) {
            case 'production': derivedConfig = production; break;
            case 'development': derivedConfig = development; break;
            case 'sandbox': derivedConfig = sandbox; break;
            default: break;
        }    
    }
    return derivedConfig;
}

export const headerTitle = "Agent Media Switcher UI";