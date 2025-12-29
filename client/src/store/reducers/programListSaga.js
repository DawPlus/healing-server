import createRequestSaga from "utils/createRequestSaga"
import api from "api/programList"
import { call, put, all } from "redux-saga/effects";
import {actions} from "./programListReducer"
import { takeLatest } from "redux-saga/effects"
import {actions as commons} from "store/reducers/commonReducer"



function* getDetail(action) {
    yield put(commons.startLoading(true));
    try {
        const [res1, res2, res3] = yield all([
            call(api.getProgramListDetail, action.payload),
            call(api.getProgramListDetailEffect, action.payload),
            call(api.getProgramListDetailInEx, action.payload),
        ]);
        // const res1 = yield call(api.getProgramListDetail, action.payload);
        // const res2 = yield call(api.getProgramListDetailEffect, action.payload);
        // const res3 = yield call(api.getProgramListDetailInEx, action.payload);
        yield put({ type: actions.getDetail_SUCCESS.type, payload: {
            data : res1.data, 
            effect: res2.data, 
            inExpense : res3.data,
        } });
    } catch (e) {
    }
    yield put(commons.finishLoading(false));
};





export default function* programSaga() {

    yield takeLatest(actions.getList.type, createRequestSaga(actions.getList.type, api.getProgramList))
    //yield takeLatest(actions.getDetail.type, createRequestSaga(actions.getDetail.type, api.getProgramListDetail))
    yield takeLatest(actions.getDetail.type, getDetail)



    // yield takeLatest(actions.getProgramListDetail.type, createRequestSaga(actions.getProgramListDetail.type, api.getProgramListDetail))
    // yield takeLatest(actions.getDetail.type, createRequestSaga(actions.getDetail.type, api.getProgramListDetail))
    

}
