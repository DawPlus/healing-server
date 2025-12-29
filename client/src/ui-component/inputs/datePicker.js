import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FormControl } from "@mui/material";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/ko";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
dayjs.locale("ko");
dayjs.extend(localizedFormat);

// Date Picker
const DatePickerComponent = (props) => {
    const { label, onChange, name, value } = props;

    const onDateChange = (value) => {
        const _val = value ? value.format("YYYY-MM-DD")  : "";
        onChange(name, _val);
    };

    return (
        <>
            <FormControl fullWidth variant="outlined" required={false} className="noneRed datepicker" size="small" >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker format="YYYY-MM-DD" value={dayjs(value)} label={label} onChange={onDateChange} />
            </LocalizationProvider>
            </FormControl>
        </>
    );
};

export default React.memo(DatePickerComponent);
