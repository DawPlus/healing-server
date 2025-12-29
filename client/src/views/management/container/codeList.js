import React , {memo, useState} from "react";

import Card from '@mui/material/Card';

import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import Swal from "sweetalert2";



const CodeList = (props)=>{
    const {data, onChange} = props;
    const {type , name, items} = data;
    const [value, setValue] = useState("");

    const handleInputChange = e =>{
        setValue(e.target.value)
    }
    const handleAddCode = (e)=>{
        if(value.trim() === ""){
            Swal.fire({
                icon: 'warning',
                title: '확인',
                text: "추가할 코드의 명칭을 입력해 주십시오.",
                });
            return;
        }

        onChange(type, items.concat(value.trim()));
        setValue("");
    }

    const onDeleteHandler = (index) =>{

        if(items.length ===1){
            Swal.fire({
                icon: 'warning',
                title: '확인',
                text: "코드는 모두 삭제 할 수 없습니다. ",
                });
            
            return;
        }

        onChange(type, items.filter((_, i) => i !== index));
    }

    return(<>
        <Card variant="outlined">
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom  style={{marginBottom:"12px", fontWeight:"bold"}}>
                    {name}
                </Typography>
                <TextField label={`${name}추가`} size="small" value={value} onChange={handleInputChange} />
                <Button variant="contained" color="primary" onClick={handleAddCode} style={{ marginLeft: "8px", height: "38px"}}>추가</Button>
                <List style={{marginTop:"10px", padding : "10px"}}>
                    {items.map((codeName, index) => (
                        <ListItem key={index} style={{ height: "35px", margin:"1px 0px", padding: "0" }}>
                        <ListItemText primary={codeName} />
                            <IconButton onClick={()=> onDeleteHandler(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    
    </>)

}
export default memo(CodeList);