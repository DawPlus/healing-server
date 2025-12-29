import createRequestSaga from "utils/createRequestSaga"
import api from "api/insertForm"
import mng from "api/management"

import {actions} from "./counsel"
import { takeLatest } from "redux-saga/effects"




export default function* counselSaga() {

    yield takeLatest(actions.getList.type, createRequestSaga(actions.getList.type, api.getList))
    yield takeLatest(actions.getListAfterSave.type, createRequestSaga(actions.getListAfterSave.type, api.getList))
    yield takeLatest(actions.getUserTemp.type, createRequestSaga(actions.getUserTemp.type, mng.getUserTemp))
}
