import React from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { getState } from 'store/reducers/programListReducer';
import { useSelector } from 'react-redux';

//프로그램 만족도
const ProgramSatisfaction = () => {
  const { PROGRAM_IN_OUT } = useSelector((s) => getState(s).detailInfo);

  const programSaf = useSelector((s) => getState(s).programSaf);
  const _programList = PROGRAM_IN_OUT.split(',').reduce((acc, curr, idx) => {
    const rowNumber = Math.floor(idx / 5);
    if (!acc[rowNumber]) {
      acc[rowNumber] = { id: rowNumber + 1 };
    }
    const colName = ['programName', 'col1', 'col2', 'col3', 'col4'][idx % 5];
    acc[rowNumber][colName] = curr;
    return acc;
  }, []);

  const calculateAverage = (inputObject) => {
    const values = Object.values(inputObject);
    //const validValues = values.filter((value) => typeof value === 'number');  // 0포함
    const validValues = values.filter((value) => typeof value === 'number' && value !== 0); // 0제외
    if (validValues.length === 0) {
      return 0;
    }
    const sum = validValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const average = sum / validValues.length;
    return average.toFixed(2);
  };

  const sortedProgramSaf = [...programSaf].sort((a, b) => {
    if (a.PROGRAM_NAME < b.PROGRAM_NAME) return -1;
    if (a.PROGRAM_NAME > b.PROGRAM_NAME) return 1;
    return 0;
  });

  const sortedProgramList = [..._programList].sort((a, b) => {
    if (a.programName < b.programName) return -1;
    if (a.programName > b.programName) return 1;
    return 0;
  });

  return (
    <>
      <TableContainer style={{ marginTop: '20px' }}>
        <h3 className="tableTitle">프로그램만족도</h3>
        <Table className="report custom-table">
          <TableHead>
            <TableRow>
              <TableCell className="table-header" align="center" rowSpan={2}>
                프로그램명
              </TableCell>
              <TableCell className="table-header" align="center" rowSpan={2}>
                분야
              </TableCell>
              <TableCell className="table-header" align="center" rowSpan={2}>
                강사명
              </TableCell>
              <TableCell
                className="table-header"
                align="center"
                rowSpan={2}
                style={{ lineHeight: '13px' }}
              >
                참여
                <br />
                구분
              </TableCell>
              <TableCell className="table-header" align="center" colSpan={4}>
                강사
              </TableCell>
              <TableCell className="table-header" align="center" colSpan={4}>
                내용구성
              </TableCell>
              <TableCell className="table-header" align="center" colSpan={4}>
                효과성
              </TableCell>
              <TableCell
                className="table-header"
                align="center"
                rowSpan={2}
                style={{ lineHeight: '13px' }}
              >
                설문
                <br />
                참가
                <br />
                인원
              </TableCell>
              <TableCell
                className="table-header"
                align="center"
                rowSpan={2}
                style={{ lineHeight: '13px' }}
              >
                전체
                <br />
                평균
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="table-header" align="center">
                전문성
              </TableCell>
              <TableCell className="table-header" align="center">
                성실성
              </TableCell>
              <TableCell className="table-header" align="center">
                반응성
              </TableCell>
              <TableCell className="table-header" align="center">
                평균
              </TableCell>
              <TableCell className="table-header" align="center">
                체계성
              </TableCell>
              <TableCell className="table-header" align="center">
                적합성
              </TableCell>
              <TableCell className="table-header" align="center">
                흥미성
              </TableCell>
              <TableCell className="table-header" align="center">
                평균
              </TableCell>
              <TableCell className="table-header" align="center">
                학습성
              </TableCell>
              <TableCell className="table-header" align="center">
                재참여
              </TableCell>
              <TableCell className="table-header" align="center">
                추천
              </TableCell>
              <TableCell className="table-header" align="center">
                평균
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProgramSaf.length === 0 ? (
              sortedProgramList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={17}>조회된 정보가 없습니다.</TableCell>
                </TableRow>
              ) : (
                sortedProgramList.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.programName}</TableCell>
                    <TableCell>{item.col1}</TableCell>
                    <TableCell>{item.col2}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              )
            ) : (
              <></>
            )}
            {sortedProgramSaf.map((i, key, arr) => {
              // 현재 항목과 이전 항목 비교
              const prev = arr[key - 1];
              const isSameProgram = prev && prev.PROGRAM_NAME === i.PROGRAM_NAME;
              const isSameBunya = prev && prev.BUNYA === i.BUNYA;
              const isSameTeacher = prev && prev.TEACHER === i.TEACHER;

              // RowSpan을 설정하여 각 항목의 동일한 값 개수를 계산
              const programRowSpanCount = arr.filter(
                (item, idx) => idx >= key && item.PROGRAM_NAME === i.PROGRAM_NAME,
              ).length;

              const bunyaRowSpanCount = arr.filter(
                (item, idx) => idx >= key && item.BUNYA === i.BUNYA,
              ).length;

              const teacherRowSpanCount = arr.filter(
                (item, idx) => idx >= key && item.TEACHER === i.TEACHER,
              ).length;

              return (
                <TableRow key={key}>
                  {/* PROGRAM_NAME cell */}
                  {!isSameProgram && (
                    <TableCell rowSpan={programRowSpanCount}>{i.PROGRAM_NAME}</TableCell>
                  )}

                  {/* BUNYA cell */}
                  {!isSameBunya && <TableCell rowSpan={bunyaRowSpanCount}>{i.BUNYA}</TableCell>}

                  {/* TEACHER cell */}
                  {!isSameTeacher && (
                    <TableCell rowSpan={teacherRowSpanCount}>{i.TEACHER}</TableCell>
                  )}

                  <TableCell>{i.type}</TableCell>
                  <TableCell>{i.score1}</TableCell>
                  <TableCell>{i.score2}</TableCell>
                  <TableCell>{i.score3}</TableCell>
                  <TableCell>
                    {calculateAverage({ score1: i.score1, score2: i.score2, score3: i.score3 })}
                  </TableCell>
                  <TableCell>{i.score4}</TableCell>
                  <TableCell>{i.score5}</TableCell>
                  <TableCell>{i.score6}</TableCell>
                  <TableCell>
                    {calculateAverage({ score1: i.score4, score2: i.score5, score3: i.score6 })}
                  </TableCell>
                  <TableCell>{i.score7}</TableCell>
                  <TableCell>{i.score8}</TableCell>
                  <TableCell>{i.score9}</TableCell>
                  <TableCell>
                    {calculateAverage({ score1: i.score7, score2: i.score8, score3: i.score9 })}
                  </TableCell>
                  <TableCell>{i.cnt}</TableCell>
                  <TableCell>
                    {calculateAverage({
                      score1: i.score1,
                      score2: i.score2,
                      score3: i.score3,
                      score4: i.score4,
                      score5: i.score5,
                      score6: i.score6,
                      score7: i.score7,
                      score8: i.score8,
                      score9: i.score9,
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
export default ProgramSatisfaction;
