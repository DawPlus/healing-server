
import XLSX from "xlsx-js-style"
import moment from "moment";

const defaultStyle = {
    alignment: {
        vertical : "center",
        horizontal : "center",
        wrapText : true
    },
    font : {
        sz : 10,
        name : '굴림',
        color : {rgb : '364152'}
    },
    border : {
        bottom : {style : "thin" , color : {rgb: "666666"}},
        top : {style : "thin" , color : {rgb: "666666"}},
        left : {style : "thin" , color : {rgb: "666666"}},
        right : {style : "thin" , color : {rgb: "666666"}},
    }
}

const headerStyle = {
    ...defaultStyle,
    font : {
        ...defaultStyle.font,
        bold : true,
    },
    fill: { fgColor: { rgb: "d9d9d9" }, patternType : "solid" },
}


const avgStyle = {
    ...defaultStyle , 
    font : {
        ...defaultStyle.font,
        bold : true, 
    },
    fill: { fgColor: { rgb: "eeffdc" }, patternType : "solid" },
}

const useDownloadExcel = (props) =>{

    const {headerInfo, cellData, avgData =[], filename = "data", merges, wscols, type = "type1"} = props;
    const today = moment();

    const downloadExcel = ()=>{
       // Header Data Setting 
        const _header = headerInfo.map(item => item.map( i => ({v : i, t : 's', s : headerStyle})) )
        // data Setting 
        const _data = cellData.map(values => values.map(value => ({ v: value, t: 's', s: defaultStyle })));
        //avg 
        const _avg = avgData.length > 0 ? type === "type1" ? [avgData.map(value => ({ v: value, t: 's', s: avgStyle }))] : avgData.map(values => values.map(value => ({ v: value, t: 's', s: avgStyle }))) :[]

        const wb = XLSX.utils.book_new();
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet([..._header, ..._data, ..._avg]);
        if(merges){
            ws['!merges'] = merges;
        }

        ws['!cols'] = wscols ? wscols : Array(cellData.length).fill({wch:10});

        ws['!rows'] = Array(headerInfo.length).fill({ hpx: 23 }); 

        XLSX.utils.book_append_sheet(wb, ws, "테스트");
        
        const todayInfo = today.format("YYYY-MM-DD");

        XLSX.writeFile(wb, `${filename}_${todayInfo}.xlsx`);
    }

    return downloadExcel;
}

export const useAvgDownloadExcel = (props) =>{

    const {headerInfo, cellData, avgData =[], filename = "data", merges, wscols, type = "type1"} = props;
    const today = moment();

    const downloadExcel = ()=>{
       // Header Data Setting 
        const _header = headerInfo.map(item => item.map( i => ({v : i, t : 's', s : headerStyle})) )
        // data Setting 
        const _data = cellData.map(values => values.map(value => ({ v: value, t: 's', s: defaultStyle })));
        //avg 
        const _avg = avgData.length > 0 ? type === "type1" ? [avgData.map(value => ({ v: value, t: 's', s: avgStyle }))] : avgData.map(values => values.map(value => ({ v: value, t: 's', s: avgStyle }))) :[]

        const wb = XLSX.utils.book_new();
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet([..._header,..._avg,  ..._data ]);
        if(merges){
            ws['!merges'] = merges;
        }

        ws['!cols'] = wscols ? wscols : Array(cellData.length).fill({wch:10});

        ws['!rows'] = Array(headerInfo.length).fill({ hpx: 23 }); 

        XLSX.utils.book_append_sheet(wb, ws, "테스트");
        
        const todayInfo = today.format("YYYY-MM-DD");

        XLSX.writeFile(wb, `${filename}_${todayInfo}.xlsx`);
    }

    return downloadExcel;
}
export default useDownloadExcel;