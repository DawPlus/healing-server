import {callApi} from "utils/callApi"

const getList = (param)=> callApi("/updateDelete/getList", param)

const api = {
    getList
}
export default api;

