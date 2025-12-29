import createRequestSaga from "utils/createRequestSaga"
import api from "api/programList"
import mng from "api/management"
import {actions} from "./programReducer"
import { takeLatest } from "redux-saga/effects"




export default function* programSaga() {

    yield takeLatest(actions.getList.type, createRequestSaga(actions.getList.type, api.getProgramList))
    yield takeLatest(actions.getTempList.type, createRequestSaga(actions.getTempList.type, api.getTempList))
    yield takeLatest(actions.getTempData.type, createRequestSaga(actions.getTempData.type, api.getTempData))
    yield takeLatest(actions.getProgramMngList.type, createRequestSaga(actions.getProgramMngList.type, mng.getProgramMngList))
    yield takeLatest(actions.getTeacherMngList.type, createRequestSaga(actions.getTeacherMngList.type, mng.getTeacherMngList))
}
