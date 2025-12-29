import createRequestSaga from "utils/createRequestSaga";
import api from "api/programResultGraphQL";
import {actions} from "./programResultReducer"
import { takeLatest } from "redux-saga/effects"

export default function* programResultSaga() {
    yield takeLatest(actions.getProgramAgency.type, createRequestSaga(actions.getProgramAgency.type, api.getProgramAgency))
    yield takeLatest(actions.getProgramResult.type, createRequestSaga(actions.getProgramResult.type, api.getProgramResult))
    
    yield takeLatest(actions.getFaciltyList.type, createRequestSaga(actions.getFaciltyList.type, api.getProgramResult))
    yield takeLatest(actions.getPreventList.type, createRequestSaga(actions.getPreventList.type, api.getProgramResult))
    yield takeLatest(actions.getHealingList.type, createRequestSaga(actions.getHealingList.type, api.getProgramResult))

    yield takeLatest(actions.getSearchResult.type, createRequestSaga(actions.getSearchResult.type, api.getSearchResult))
    yield takeLatest(actions.getPartTypeList.type, createRequestSaga(actions.getPartTypeList.type, api.getPartTypeList))
    yield takeLatest(actions.getResidenceList.type, createRequestSaga(actions.getResidenceList.type, api.getResidenceList))
    yield takeLatest(actions.programManage.type, createRequestSaga(actions.programManage.type, api.programManage))
}
