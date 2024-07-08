import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Services and utils
import { getStorageItem } from 'services/applicationStorage';

const PrivateRoute = () => {
  let runtimeValue = useSelector((state) => state.runtime.value);
  console.log('PrivateRoute Runtime', runtimeValue);

  const cspToken = getStorageItem('purecloud-csp-token', true, sessionStorage);
  return (
    cspToken ? <Outlet/> : <Navigate to={ `${process.env.PUBLIC_URL}/login?runtime=${runtimeValue}` } />
  );
}

export default PrivateRoute;