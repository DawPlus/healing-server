import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import NotFound from './NotFound';
// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    const routes = useRoutes([
        ...MainRoutes,
        ...AuthenticationRoutes,
        // Add a catch-all route at the end
        {
            path: '*',
            element: <NotFound />,
        },
    ]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {routes}
        </Suspense>
    );
}
