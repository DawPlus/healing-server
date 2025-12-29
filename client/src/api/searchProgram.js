import {callApi} from "utils/callApi"



const getPartTypeList = (param)=> callApi('/searchProgram/getPartTypeList', param)
const getResidenceList = (param)=> callApi('/searchProgram/getResidenceList', param)
const getAllPrograms = (param)=> callApi('/searchProgram/getAllPrograms', param)
const programManage = (param)=> callApi('/searchProgram/programManage', param)
const getSerList = (param)=> callApi('/searchProgram/getSerList', param)
const getProgramEffect = (param)=> callApi('/searchProgram/getProgramEffect', param)
const getExIncomeList = (param)=> callApi('/searchProgram/getExIncomeList', param)


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

