import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import DataGrid from 'ui-component/dataGrid';
import { useDispatch, useSelector } from 'react-redux';
import { actions, getState } from 'store/reducers/programReducer';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const ProgramList = () => {
  // Dispatch
  const dispatch = useDispatch();

  const { rows } = useSelector((s) => getState(s));

  const onClick = (data) => {
    setValue('2');
  };

  const columns = [
    { name: 'index', label: '번호' },
    { name: 'AGENCY', label: '단체명' },
    { name: 'OPENDAY', label: '시작일' },
    { name: 'ENDDAY', label: '종료일' },
    { name: 'ROOM_PART_PEOPLE', label: '인원수' },
    { name: 'OM', label: 'OM' },
    {
      name: 'actions',
      label: ' ',
      filter: false,
      options: {
        customBodyRender: (_, tableMeta, _u) => {
          const data = tableMeta.rowData;
          return (
            <button style={{ boxShadow: 'none' }} onClick={() => onClick(data)}>
              상세보기
            </button>
          );
        },
      },
    },
  ];
  React.useEffect(() => {
    // 목록조회
    dispatch(actions.getList());
  }, []);

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <MainCard>
      <TabContext value={value}>
        <TabList onChange={handleChange} aria-label="lab API tabs example">
          <Tab label="운영결과보고검색" value="1" />
          <Tab label="결과보고서" value="2" />
        </TabList>
        <TabPanel value="1">
          <DataGrid data={rows} columns={columns} />
        </TabPanel>
        <TabPanel value="2">Item Two</TabPanel>
      </TabContext>
    </MainCard>
  );
};

export default ProgramList;
