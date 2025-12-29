import TableCell from '@mui/material/TableCell';

import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import useMergeCells from './useGenerateMerges';
const generateHeaderComponent = (headerInfo, merges) => {
    console.log(merges)
        return (
        <TableHead>
            {headerInfo.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
                {row.map((cell, colIndex) => {
                const merge = merges.find(
                    merge => merge.s.r <= rowIndex && rowIndex <= merge.e.r && merge.s.c <= colIndex && colIndex <= merge.e.c
                );
    
                if (merge) {
                    if (merge.s.r === rowIndex && merge.s.c === colIndex) {
                    return (
                        <TableCell
                        key={colIndex}
                        className="table-header"
                        rowSpan={merge.e.r - merge.s.r + 1}
                        colSpan={merge.e.c - merge.s.c + 1}
                        align="center"
                        >
                        {cell}
                        </TableCell>
                    );
                    } else {
                    return null;
                    }
                } else {
                    return (
                    <TableCell key={colIndex} className="table-header" align="center">
                        {cell}
                    </TableCell>
                    );
                }
                })}
            </TableRow>
            ))}
        </TableHead>
        );
    };

const useTable = (headerInfo) => {
    const merges = useMergeCells(headerInfo);
    const HeaderComponent = generateHeaderComponent(headerInfo, merges);
  
    return { merges, HeaderComponent };
  };
  
  export default useTable;