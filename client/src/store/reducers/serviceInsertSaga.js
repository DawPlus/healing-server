import createRequestSaga from "utils/createRequestSaga"
import api from "api/programList"

import {actions} from "./serviceInsertReducer"
import { takeLatest } from "redux-saga/effects"




export default function* serviceInsert() {

    yield takeLatest(actions.getList.type, createRequestSaga(actions.getList.type, api.getProgramList))

}
