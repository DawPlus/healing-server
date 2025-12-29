import React, { memo, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import { FilterList } from '@mui/icons-material';

// 컬럼의 한글 여부 변경
const textLabels = {
  body: {
    noMatch: '조회된 데이터가 없습니다.',
    toolTip: 'Sort',
    columnHeaderTooltip: (column) => `정렬`,
  },
  pagination: {
    next: '이전페이지',
    previous: '다음페이지',
    rowsPerPage: '표시항목수',
    displayRows: '/',
  },
  toolbar: {
    search: '검색',
    downloadCsv: '다운로드 CSV',
    print: '출력',
    viewColumns: '출력항목',
    filterTable: '필터(포함값보기)',
  },
  filter: {
    all: 'All',
    title: '필터',
    reset: '리셋',
  },
  viewColumns: {
    title: '보여질 항목선택',
    titleAria: 'Show/Hide Table Columns',
  },
  selectedRows: {
    text: 'row(s) selected',
    delete: 'Delete',
    deleteAria: 'Delete Selected Rows',
  },
};

const DataGridComponent = (props) => {
  const { columns, data, title, options } = props;

  const defaultColInfo = {
    filter: true,
    sort: true,
  };
  return (
    <>
      <MUIDataTable
        title={title}
        data={data}
        columns={columns.map((i) => ({ ...i, options: { ...defaultColInfo, ...i.options } }))}
        options={{
          tableBodyHeight: '650px',
          selectableRowsHeader: false,
          selectableRows: 'none',
          onDownload: (buildHead, buildBody, columns, data) => {
            return '\uFEFF' + buildHead(columns) + buildBody(data);
          },
          downloadOptions: {
            filename: title,
          },

          textLabels,
          // customToolbar: function () {
          //   return (
          //     <Button
          //     startIcon={<GetAppIcon />}
          //       onClick={() => {
          //         const csvContent = exportCSV(data, columns);
          //         const csvWithBOM = addBOM(csvContent);
          //         const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });

          //         if (navigator.msSaveBlob) { // IE 10+
          //           navigator.msSaveBlob(blob, 'download.csv')
          //         } else {
          //           const link = document.createElement('a')
          //           if (link.download !== undefined) {
          //             const url = URL.createObjectURL(blob);
          //             link.setAttribute('href', url);
          //             link.setAttribute('download', 'download.csv');
          //             link.style.visibility = 'hidden';
          //             document.body.appendChild(link);
          //             link.click();
          //             document.body.removeChild(link);
          //           }
          //         }
          //       }}
          //     >
          //     </Button>
          //   );
          // },
          ...options,
        }}
        className="custom-datatable"
        elevation={0}
      />
    </>
  );
};
export default memo(DataGridComponent);
