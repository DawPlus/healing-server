import {callApi} from "utils/callApi"



const getPartTypeList = (param)=> callApi('/yearMonthResult/getPartTypeList', param)
const getResidenceList = (param)=> callApi('/yearMonthResult/getResidenceList', param)
const getAllPrograms = (param)=> callApi('/yearMonthResult/getAllPrograms', param)
const programManage = (param)=> callApi('/yearMonthResult/programManage', param)
const getSerList = (param)=> callApi('/yearMonthResult/getSerList', param)
const getProgramEffect = (param)=> callApi('/yearMonthResult/getProgramEffect', param)
const getExIncomeList = (param)=> callApi('/yearMonthResult/getExIncomeList', param)


const api = {
    getPartTypeList,
    getResidenceList,
    getAllPrograms,
    programManage,
    getSerList,
    getProgramEffect,
    getExIncomeList
}
export default api;

