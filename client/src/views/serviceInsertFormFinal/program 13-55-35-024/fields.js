import React , {useCallback} from "react";

import { useDispatch  } from "react-redux";
import { actions} from"store/reducers/serviceInsert/program"
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';


import DynamicField from "../component/dynamicField"; 
const fields = [ 
    { type: 'select', label: '성별', name: 'SEX'},
    { label: '연령', name: 'AGE', type : "age"},
    { type: 'select', label: '거주지', name: 'RESIDENCE'},
    { type: 'select', label: '직업', name: 'JOB'},
    { type: 'select', label: '참여구분', name: 'TYPE'},
    { label: '강사(문항1)', name: 'SCORE1', type:"sNumber"},
    { label: '강사(문항2)', name: 'SCORE2', type:"sNumber"},
    { label: '강사(문항3)', name: 'SCORE3', type:"sNumber"},
    { label: '구성/품질(문항4)', name: 'SCORE4', type:"sNumber"},
    { label: '구성/품질(문항5)', name: 'SCORE5', type:"sNumber"},
    { label: '구성/품질(문항6)', name: 'SCORE6', type:"sNumber"},
    { label: '효과성(문항7)', name: 'SCORE7', type:"sNumber"},
    { label: '효과성(문항8)', name: 'SCORE8', type:"sNumber"},
    { label: '효과성(문항9)', name: 'SCORE9', type:"sNumber"},

];

const Fields = (props)=>{

    const {row, idx} = props;


    const dispatch = useDispatch();

    const onChange = useCallback((idx) => (e) => {
        const { name, value } = e.target;
        dispatch(actions.changeValue({ index: idx, key: name, value }));
    }, [dispatch, idx]);


    
    const onCheckChange = useCallback((idx) => (e) => {
        dispatch(actions.changeValue({ index: idx, key: "chk", value: e.target.checked }));
    }, [dispatch, idx]);

    return (<>
    
                <TableRow>
                    {idx > 0 ? (
                            <TableCell style={{ textAlign: "center" }}>
                                <Checkbox checked={row.chk} value="" name="chk" onChange={onCheckChange(idx)} />
                            </TableCell>
                        ) :  <TableCell style={{ textAlign: "center" }}></TableCell>
                    }

                    {fields.map((field, index) => {
                        if(field.name ==="SCORE9" && row["TYPE"] === "참여자"){                                    
                            return <TableCell style={{ textAlign: "center" }} key={index}> - </TableCell>;
                        }
                        return <DynamicField 
                            key={field.name} 
                            type={field.type} 
                            label={field.label} 
                            name={field.name} 
                            onChange={(e) => onChange(idx, e.target.name, e.target.value)} 
                            value={row[field.name]} 
                            idx={idx} 
                        />
                    })}
                </TableRow>
    </>);

}
export default React.memo(Fields)