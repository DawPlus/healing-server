import {callApi} from "utils/callApi"



const getProgramList = (param)=> callApi('/program/getProgramList', param);
const getProgramListDetail = (param)=> callApi('/program/getProgramListDetail', param);

const getProgramListDetailEffect = (param)=> callApi('/program/getProgramListDetailEffect', param);
const getProgramListDetailInEx = (param)=> callApi('/program/getProgramListDetailInEx', param);



const getTempList = ()=> callApi('/insertOperation/getTempList');
const getTempData = (param)=> callApi('/insertOperation/getTempData',param);


const api = {
    getProgramList,
    getTempList,
    getTempData,
    getProgramListDetail,
    getProgramListDetailEffect,
    getProgramListDetailInEx
}
export default api;

