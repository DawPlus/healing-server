import createRequestSaga from "utils/createRequestSaga"
import api from "api/updateDelete"
import {actions} from "./updateDeleteReducer"
import { takeLatest } from "redux-saga/effects"




export default function* updateDeleteSaga() {

    yield takeLatest(actions.getList.type, createRequestSaga(actions.getList.type, api.getList))

}
