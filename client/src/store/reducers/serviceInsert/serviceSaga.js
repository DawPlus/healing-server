import createRequestSaga from "utils/createRequestSaga"
import api from "api/insertForm"
import mng from "api/management"

import {actions} from "./service"
import { takeLatest } from "redux-saga/effects"




export default function* serviceSaga() {

    yield takeLatest(actions.getPreviousServiceList.type, createRequestSaga(actions.getPreviousServiceList.type, api.getPreviousServiceList))
    yield takeLatest(actions.getPreviousServiceListAfterSave.type, createRequestSaga(actions.getPreviousServiceListAfterSave.type, api.getPreviousServiceList))
    yield takeLatest(actions.getUserTemp.type, createRequestSaga(actions.getUserTemp.type, mng.getUserTemp))

}
