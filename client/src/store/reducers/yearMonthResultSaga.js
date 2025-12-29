import createRequestSaga from "utils/createRequestSaga"
import api from "api/yearMonth"

import {actions} from "./yearMonthResultReducer"
import { takeLatest } from "redux-saga/effects"




export default function* yearMonthResultSaga() {

    yield takeLatest(actions.getPartTypeList.type, createRequestSaga(actions.getPartTypeList.type, api.getPartTypeList))
    yield takeLatest(actions.getResidenceList.type, createRequestSaga(actions.getResidenceList.type, api.getResidenceList))
    yield takeLatest(actions.getAllPrograms.type, createRequestSaga(actions.getAllPrograms.type, api.getAllPrograms))
    yield takeLatest(actions.programManage.type, createRequestSaga(actions.programManage.type, api.programManage))
    yield takeLatest(actions.getSerList.type, createRequestSaga(actions.getSerList.type, api.getSerList))
    yield takeLatest(actions.getProgramEffect.type, createRequestSaga(actions.getProgramEffect.type, api.getProgramEffect))
    yield takeLatest(actions.getExIncomeList.type, createRequestSaga(actions.getExIncomeList.type, api.getExIncomeList))

}
