import React, { Fragment } from 'react';
import { Outlet } from 'react-router-dom';

const PublicRoute = ({ element: Element, ...properties }) => (
    <Fragment>
        <div className="public-route">
            <Outlet />
        </div>
    </Fragment>
);

export default PublicRoute;