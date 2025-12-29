import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga';

import reducer ,{rootSaga}from './reducer';


const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: reducer,
    middleware: [sagaMiddleware],
  });

  
sagaMiddleware.run(rootSaga);


export { store };
