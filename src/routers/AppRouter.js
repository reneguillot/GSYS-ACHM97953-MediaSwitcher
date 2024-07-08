import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Routers
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';

// Route Components
const PureCloudLogin = lazy(() => import('components/login/purecloud/PureCloudLogin'));
const Home = lazy(() => import('components/home/Home'));
const Unauthorized = lazy(() => import('components/unauthorized/Unauthorized'));

// Don't lazy load initial application entry
import Main from 'components/Main';

const ApplicationRouter = ({}) => {
    const LoginPage = PureCloudLogin;

    const LazyLoadedRoutesFallback = () => {
        return (
            <div>Loading...</div>
        )
    };

    return (
        <BrowserRouter>
            <Suspense fallback={LazyLoadedRoutesFallback()}>
                <Routes>
                    <Route path="/" element={<PublicRoute />}>
                        <Route path={ `${process.env.PUBLIC_URL}/` } element={<Main />} />
                        <Route path={ `${process.env.PUBLIC_URL}/login` } element={<LoginPage />} />
                        <Route path={ `${process.env.PUBLIC_URL}/unauthorized` } element={<Unauthorized />} />
                    </Route>
                    <Route path={ `${process.env.PUBLIC_URL}/home` } element={<PrivateRoute />}>
                        <Route path="" element={<Home />}/>
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default ApplicationRouter;