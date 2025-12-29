import { createRoot } from 'react-dom/client';

// third party
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';

// project imports
import * as serviceWorker from 'serviceWorker';
import App from 'App';
import { store } from 'store';
import apolloClient from './utils/apolloClient';

// style + assets
import 'assets/scss/style.scss';
import config from './config';
import './App.css'

const container = document.getElementById('root');
const root = createRoot(container)
root.render(
    <Provider store={store}>
        <ApolloProvider client={apolloClient}>
            <BrowserRouter basename={config.basename}>
                <App />
            </BrowserRouter>
        </ApolloProvider>
    </Provider>
);

serviceWorker.unregister();
