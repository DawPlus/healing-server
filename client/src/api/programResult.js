import {callApi} from "utils/callApi"



const getProgramAgency = (param)=> callApi("/programResult/getProgramAgency", param)
const getProgramResult = (param)=> callApi("/programResult/getProgramResult", param)
const getSearchResult = (param)=> callApi("/programResult/getSearchResult", param)
const getPartTypeList = (param)=> callApi("/programResult/getPartTypeList", param)
const getResidenceList = (param)=> callApi("/programResult/getResidenceList", param)
const programManage = (param)=> callApi("/programResult/programManage", param)


const api = {
    getProgramAgency,
    getProgramResult,
    getSearchResult,
    getPartTypeList,
    getResidenceList,
    programManage,
}
export default api;

