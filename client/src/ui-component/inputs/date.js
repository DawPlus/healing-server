import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {  TextField } from '@mui/material';
import ko from 'date-fns/locale/ko'; // 한국어 로케일 모듈
import moment from "moment";

const MyDatePicker = (props) => {

    const {value, onChange, label, name, format="YYYY-MM-DD"}= props;

    const handleDateChange = (date) => {
        var d = moment(date).format(format);
        onChange(name, d)
    };


    const renderCustomHeader = ({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => {
        const year = moment(date).format('YYYY');
        const month = moment(date).format('MMMM');
        return (
          <div>
            <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                {"<"}
            </button>
            <span>
              {month} {year}
            </span>
          
            <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
            {">"}
          </button>
          </div>
        );
      };
    


    
    return (
        <DatePicker
        selected={value ? moment(value, format).toDate() : null}
            onChange={handleDateChange}
            dateFormat={"yyyy-MM-dd"}
            popperPlacement="bottom"
            locale={ko}
           // renderCustomHeader={renderCustomHeader}
            customInput={
                <TextField
           
                variant="outlined"
                label={label}
                value={value}
                />
            }
        />
    
    );
};

export default MyDatePicker;
