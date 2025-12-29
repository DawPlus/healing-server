import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Grid
} from '@mui/material';

const item = {
  SEX: [
    { label: "남", value: "남" },
    { label: "여", value: "여" },
    { label: "미기재", value: "미기재" },
  ],
  RESIDENCE: [
    { label: "서울", value: "서울" },
    { label: "부산", value: "부산" },
    { label: "대구", value: "대구" },
    { label: "인천", value: "인천" },
    { label: "광주", value: "광주" },
    { label: "대전", value: "대전" },
    { label: "울산", value: "울산" },
    { label: "세종", value: "세종" },
    { label: "경기", value: "경기" },
    { label: "강원", value: "강원" },
    { label: "충북", value: "충북" },
    { label: "충남", value: "충남" },
    { label: "전북", value: "전북" },
    { label: "전남", value: "전남" },
    { label: "경북", value: "경북" },
    { label: "경남", value: "경남" },
    { label: "제주", value: "제주" },
    { label: "미기재", value: "미기재" }
  ],
  JOB: [
    { label: "학생", value: "학생" },
    { label: "자영업", value: "자영업" },
    { label: "서비스직", value: "서비스직" },
    { label: "판매영업직", value: "판매영업직" },
    { label: "기능", value: "기능" },
    { label: "단순노무직", value: "단순노무직" },
    { label: "고위공직/임직원", value: "고위공직/임직원" },
    { label: "임직원", value: "임직원" },
    { label: "전문직", value: "전문직" },
    { label: "일반사무직", value: "일반사무직" },
    { label: "농림어업축산직", value: "농림어업축산직" },
    { label: "주부", value: "주부" },
    { label: "무직", value: "무직" },
    { label: "기타", value: "기타" },
    { label: "미기재", value: "미기재" },
  ],
  TYPE: [
    { label: "인솔자", value: "인솔자" },
    { label: "참여자", value: "참여자" },
    { label: "미기재", value: "미기재" },
  ],
  sex: [
    { label: "남", value: "남" },
    { label: "여", value: "여" },
    { label: "미기재", value: "미기재" },
  ],
  residence: [
 

    { label: "서울", value: "서울" }, { label: "부산", value: "부산" }, { label: "대구", value: "대구" }, { label: "인천", value: "인천" }, { label: "광주", value: "광주" }, { label: "대전", value: "대전" }, { label: "울산", value: "울산" }, { label: "세종", value: "세종" }, { label: "경기", value: "경기" }, { label: "강원", value: "강원" }, { label: "충북", value: "충북" }, { label: "충남", value: "충남" }, { label: "전북", value: "전북" }, { label: "전남", value: "전남" }, { label: "경북", value: "경북" }, { label: "경남", value: "경남" }, { label: "제주", value: "제주" }, { label: "미기재", value: "미기재" }
  ],
  job: [
    { label: "학생", value: "학생" },
    { label: "자영업", value: "자영업" },
    { label: "서비스직", value: "서비스직" },
    { label: "판매영업직", value: "판매영업직" },
    { label: "기능", value: "기능" },
    { label: "단순노무직", value: "단순노무직" },
    { label: "고위공직/임직원", value: "고위공직/임직원" },
    { label: "임직원", value: "임직원" },
    { label: "전문직", value: "전문직" },
    { label: "일반사무직", value: "일반사무직" },
    { label: "농림어업축산직", value: "농림어업축산직" },
    { label: "주부", value: "주부" },
    { label: "무직", value: "무직" },
    { label: "기타", value: "기타" },
    { label: "미기재", value: "미기재" },

  ]
};

const GoogleFormField = ({ field, value, onChange, required = false }) => {
  const { type, label, name, description, options } = field;
  
  const getItems = () => {
    // 필드 이름에 해당하는 아이템이 없으면 대문자 버전으로 시도
    return item[name] || item[name.toUpperCase()] || [];
  };

  const handleChange = (e) => {
    if (onChange && typeof onChange === 'function') {
      // 이벤트 발생 시점과 값을 콘솔에 출력하여 디버깅
      console.log(`GoogleFormField: handleChange 호출됨 - name=${e.target.name || name}, value=${e.target.value}`, e);
      
      // onChange 함수에 name과 value를 명시적으로 전달
      onChange({
        target: {
          name: e.target.name || name,
          value: e.target.value
        }
      });
    }
  };

  const renderField = () => {
    switch (type) {
      case "select":
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>{label}{required && "*"}</InputLabel>
            <Select
              name={name}
              value={value || ""}
              onChange={handleChange}
              label={`${label}${required ? "*" : ""}`}
            >
              {getItems().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {description && (
              <Typography variant="caption" color="textSecondary">
                {description}
              </Typography>
            )}
          </FormControl>
        );

      case "age":
      case "number":
        return (
          <TextField
            fullWidth
            label={`${label}${required ? "*" : ""}`}
            name={name}
            value={value || ""}
            onChange={handleChange}
            type="number"
            margin="normal"
            helperText={description}
          />
        );

      case "sNumber":
        // 1-5 사이의 숫자만 허용하는 라디오 버튼 그룹
        return (
          <FormControl component="fieldset" fullWidth margin="normal">
            <FormLabel component="legend">{label}{required && "*"}</FormLabel>
            <RadioGroup
              row
              name={name}
              value={value || ""}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <FormControlLabel
                  key={num}
                  value={num.toString()}
                  control={<Radio />}
                  label={num}
                />
              ))}
            </RadioGroup>
            {description && (
              <Typography variant="caption" color="textSecondary">
                {description}
              </Typography>
            )}
          </FormControl>
        );

      case "eNumber":
        // 0-6 사이의 숫자만 허용하는 라디오 버튼 그룹
        return (
          <FormControl component="fieldset" fullWidth margin="normal">
            <FormLabel component="legend">{label}{required && "*"}</FormLabel>
            <RadioGroup
              row
              name={name}
              value={value || ""}
              onChange={handleChange}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <FormControlLabel
                  key={num}
                  value={num.toString()}
                  control={<Radio />}
                  label={num}
                />
              ))}
            </RadioGroup>
            {description && (
              <Typography variant="caption" color="textSecondary">
                {description}
              </Typography>
            )}
          </FormControl>
        );

      default:
        return (
          <TextField
            fullWidth
            label={`${label}${required ? "*" : ""}`}
            name={name}
            value={value || ""}
            onChange={handleChange}
            margin="normal"
            helperText={description}
          />
        );
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {renderField()}
    </Box>
  );
};

export default GoogleFormField; 