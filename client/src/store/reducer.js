import { combineReducers } from 'redux';
import { all  } from 'redux-saga/effects';

// reducer import
import customizationReducer from './customizationReducer';
import commonReducer from  "./reducers/commonReducer"
import {reducer as programReducer} from "./reducers/programReducer"
import programSaga from "./reducers/programSaga";
import {reducer as programList} from "./reducers/programListReducer"
import programListSaga from "./reducers/programListSaga";

import {reducer as management } from "./reducers/managementReducer"
import managementSaga from "./reducers/managementSaga";

import {reducer as programResult} from "./reducers/programResultReducer"
import programResultSaga from "./reducers/programResultSaga";

import {reducer as updateDelete} from "./reducers/updateDeleteReducer"
import updateDeleteSaga from "./reducers/updateDeleteSaga";

import serviceInsert from "./reducers/serviceInsert/reducer"
import serviceInsertSaga from "./reducers/serviceInsert/saga";

import {reducer as yearMonthResult} from "./reducers/yearMonthResultReducer"
import yearMonthResultSaga from "./reducers/yearMonthResultSaga";
import {reducer as searchProgram} from "./reducers/searchProgramReducer"
import searchProgramSaga from "./reducers/searchProgramSaga";

// New reservation management
import reservationReducer from './reducers/reservationSlice';

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
    common : commonReducer,
    customization: customizationReducer,
    program: programReducer,
    management,
    programResult,
    updateDelete,
    serviceInsert,
    yearMonthResult,
    searchProgram,
    programList,
    reservation: reservationReducer,
});

// ==============================|| ROOTSAGA ||============================== //

export function* rootSaga() {
    yield all([
        programSaga(),
        managementSaga(),
        programResultSaga(),
        updateDeleteSaga(), 
        serviceInsertSaga(), 
        yearMonthResultSaga(),
        searchProgramSaga(),
        programListSaga(),
  
    ]);
}

export default reducer;
