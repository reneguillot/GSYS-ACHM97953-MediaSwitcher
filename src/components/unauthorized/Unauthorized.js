import React from 'react';
import { useLocation } from 'react-router';

import { GuxInlineAlertBeta } from 'genesys-spark-components-react';

const Unauthorized = (props) => {
    const location = useLocation();
    return (
        <GuxInlineAlertBeta accent='error'>Not authorized to use Media Switcher</GuxInlineAlertBeta>
    );
};

export default Unauthorized;
