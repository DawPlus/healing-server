import createRequestSaga from "utils/createRequestSaga";
import api from "api/insertForm";
import mng from "api/management";

import { actions } from "./counselTherapy";
import { takeLatest } from "redux-saga/effects";

export default function* counselTherapySaga() {
  yield takeLatest(actions.getPreviousCounselTherapyList.type, createRequestSaga(actions.getPreviousCounselTherapyList.type, api.getPreviousCounselTherapyList));
  yield takeLatest(actions.getPreviousCounselTherapyListAfterSave.type, createRequestSaga(actions.getPreviousCounselTherapyListAfterSave.type, api.getPreviousCounselTherapyList));
  yield takeLatest(actions.getUserTemp.type, createRequestSaga(actions.getUserTemp.type, mng.getUserTemp));
} 