import { call, put } from "redux-saga/effects";
import {actions} from "store/reducers/commonReducer"

export default function createRequestSaga(type, request) {
    const SUCCESS = `${type}_SUCCESS`;
    const FAILURE = `${type}_FAILURE`;
    return function* (action) {
      yield put(actions.startLoading(true));
      try {
        const response = yield call(request, action.payload);
        yield put({ type: SUCCESS, payload: response });
      } catch (e) {
        console.log(e)
        yield put({ type: FAILURE, payload: e, error: true, });

      }
      yield put(actions.finishLoading(false));
    };
}