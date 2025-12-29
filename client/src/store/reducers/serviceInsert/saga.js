

import { all  } from 'redux-saga/effects';

import serviceSaga from "./serviceSaga";
import programSaga from "./programSaga"
import counselSaga from "./counselSaga"
import preventSaga from "./preventSaga"
import healingSaga from "./healingSaga"
import hrvSaga from "./hrvSaga"
import vibraSaga from "./vibraSaga"

export default function* rootSaga() {
    yield all([
        serviceSaga(),
        programSaga(),
        counselSaga(),       
        preventSaga(),
        healingSaga(),
        hrvSaga(),
        vibraSaga()
    ]);
} 
