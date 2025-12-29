import createRequestSaga from "utils/createRequestSaga"
import api from "api/insertForm"
import mng from "api/management"

import {actions} from "./program"
import { takeLatest } from "redux-saga/effects"




export default function* programSaga() {

    yield takeLatest(actions.getPreviousProgramList.type, createRequestSaga(actions.getPreviousProgramList.type, api.getList))
    yield takeLatest(actions.getPreviousProgramListAfterSave.type, createRequestSaga(actions.getPreviousProgramListAfterSave.type, api.getList));



    yield takeLatest(actions.getProgramList.type, createRequestSaga(actions.getProgramList.type, mng.getProgramMngList))
    yield takeLatest(actions.getTeacherList.type, createRequestSaga(actions.getTeacherList.type, mng.getTeacherMngList))
    yield takeLatest(actions.getUserTemp.type, createRequestSaga(actions.getUserTemp.type, mng.getUserTemp))

}
