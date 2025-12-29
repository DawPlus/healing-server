// utils.js


export const defaultStyle = {
    alignment: {
        vertical : "center",
        horizontal : "center",
        wrapText : true
    },
    font : {
        sz : 10,
        name : '굴림',
        color : {rgb : '364152'}
    },
    border : {
        bottom : {style : "thin" , color : {rgb: "666666"}},
        top : {style : "thin" , color : {rgb: "666666"}},
        left : {style : "thin" , color : {rgb: "666666"}},
        right : {style : "thin" , color : {rgb: "666666"}},
    }
}

export const headerStyle = {
    ...defaultStyle,
    font : {
        ...defaultStyle.font,
        bold : true,
    },
    fill: { fgColor: { rgb: "d9d9d9" }, patternType : "solid" },
}


export const avgStyle = {
    ...defaultStyle , 
    font : {
        ...defaultStyle.font,
        bold : true, 
    },
    fill: { fgColor: { rgb: "eeffdc" }, patternType : "solid" },
}

// Add memoization to improve performance of generateMergeInfo
const mergeInfoCache = new Map();

export function generateMergeInfo(headerInfo) {
    // Create a cache key from the header structure
    const cacheKey = JSON.stringify(headerInfo);
    
    // Check if we already have computed this merge info
    if (mergeInfoCache.has(cacheKey)) {
        return mergeInfoCache.get(cacheKey);
    }
    
    // If not in cache, compute it
    let mergeInfo = [];
    let startCol = 0;
    let prevVal = null;

    // 첫 번째 row를 순회하며 같은 값이 연달아 있는 경우를 찾는다.
    for (let c = 0; c < headerInfo[0].length; c++) {
        if (headerInfo[0][c] !== prevVal) {
            if (c - startCol > 1) {
                mergeInfo.push({
                    s: { r: 0, c: startCol },
                    e: { r: 0, c: c - 1 }
                });
            }
            startCol = c;
            prevVal = headerInfo[0][c];
        }
    }

    // 마지막 그룹에 대한 병합 정보를 추가한다.
    if (headerInfo[0].length - startCol > 1) {
        mergeInfo.push({
            s: { r: 0, c: startCol },
            e: { r: 0, c: headerInfo[0].length - 1 }
        });
    }

    // 두 번째 row를 순회하며 비어 있는 경우를 찾는다.
    for (let c = 0; c < headerInfo[1].length; c++) {
        if (headerInfo[1][c] === '') {
            mergeInfo.push({
                s: { r: 0, c: c },
                e: { r: 1, c: c }
            });
        }
    }
    
    // Store in cache for future use
    mergeInfoCache.set(cacheKey, mergeInfo);
    
    return mergeInfo;
}


export function  decodeSpecialCharacters(inputString){
    if (!inputString) {
      return ""; // 입력 문자열이 비어있을 경우 빈 문자열 반환
    }
  
    const decodeMap = {
      "& #40;": "(", // `& #40;`을 `(`로 변경
      "& #41;": ")", // `& #41;`을 `)`로 변경
      "& #44;": ",", // `& #44;`를 `,`로 변경
      "& #60;": "<", // `& #60;`을 `<`로 변경
      "& #62;": ">", // `& #62;`을 `>`로 변경
      "& #94;": "^", // `& #94;`을 `^`로 변경
      "& #38;": "&", // `& #38;`을 `&`로 변경
      "& #36;": "$", // `& #36;`을 `$`로 변경
      "& #47;": "/", // `& #47;`를 `/`로 변경
      // 추가적인 변환 매핑은 이곳에 추가
    };
  
    // 디스트럭처링을 활용하여 간단한 변환 매핑 정의
    const regexMap = Object.entries(decodeMap).map(([encoded, decoded]) => [new RegExp(encoded, "g"), decoded]);
  
    // 입력 문자열에서 변환 매핑에 따라 모든 매칭 변경
    let resultString = inputString;
    for (const [regex, decoded] of regexMap) {
      resultString = resultString.replaceAll(regex, decoded);
    }
  
    return resultString;
  }
