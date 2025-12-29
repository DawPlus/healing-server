import {callApi} from "utils/callApi"



const getPreviousServiceList = (param)=> callApi('/insertForm/getPreviousServiceList', param)
const getPreviousProgramList = (param)=> callApi('/insertForm/getPreviousProgramList', param)
const getList = (param)=> callApi('/insertForm/list', param)
const create = (param)=> callApi('/insertForm/create', param)




const api = {
    getPreviousServiceList,
    getPreviousProgramList,
    getList, 
    create,
}
export default api;

