
const useAverageCells = (avgCell, rows) => {
    let spanCount = 0;

    const cells = avgCell.map((key, idx) => {
        if (key === '') {
            spanCount++;
            return null;
        }
        if(key ==='-') return {data : '-'};
        

        if (key === '통계') {
            const cell = {
                colSpan: spanCount + 1,
                data: '통계'
            };
            spanCount = 0;
            return cell;
        }

        const avg = rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length;

        return {
            data: avg.toFixed(2)
        };
    });

    return cells;
};

export default useAverageCells;
