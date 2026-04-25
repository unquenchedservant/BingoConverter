const STATS = 682100497
const HUB = 0 
const MAXROW = 176


function onEdit(e) {
  if (e.range.getSheet().getName() !== "Stats") return;
  const STAT_SHEET = e.source.getSheetByName("Stats");
  const HUB_SHEET = e.source.getSheetByName("Hub");
  getLastChecked(STAT_SHEET, HUB_SHEET);
}

//USE THIS ONE FOR TESTING
function testing(){
  const STAT_SHEET = SpreadsheetApp.getActive().getSheetByName("Stats")
  const HUB_SHEET = SpreadsheetApp.getActive().getSheetByName("Hub")
  getLongestStat('Y', STAT_SHEET, HUB_SHEET)
}

//USE THIS ONE AT END OF EPISODE
function updateStats(){
  const STAT_SHEET = SpreadsheetApp.getActive().getSheetByName("Stats")
  const HUB_SHEET = SpreadsheetApp.getActive().getSheetByName("Hub")
  getActiveStat("Y", STAT_SHEET, HUB_SHEET)
  getActiveStat("N", STAT_SHEET, HUB_SHEET)
  getLongestStat("Y", STAT_SHEET, HUB_SHEET)
  getLongestStat("N", STAT_SHEET, HUB_SHEET)
  updateAverages(STAT_SHEET, HUB_SHEET)
}

function updateAverages(statSheet, hubSheet){
  console.log("Updating Averages")
  const FRI_ROW = 3
  const SAT_ROW = 4
  const AVG_COL = 11
  const TOT_COL = 12
  const NIGHT_COL = 13
  const ROW_RNG = statSheet.getRange("2:2").getValues()[0]
  const NIGHT_ROW = MAXROW + 3
  const AMT_ROW = MAXROW + 2
  const LAST_COL = getLastColumn(ROW_RNG)
  const NIGHT_DATA = statSheet.getRange(NIGHT_ROW, 2, 1, LAST_COL - 1).getValues()[0]
  const AMT_DATA = statSheet.getRange(AMT_ROW, 2, 1, LAST_COL - 1).getValues()[0]
  let friTotal = 0
  let satTotal = 0
  let friCount = 0
  let satCount = 0
  for (let i = 0; i < NIGHT_DATA.length; i++) {
    const AMT = AMT_DATA[i];
    const NIGHT = NIGHT_DATA[i];
    if (NIGHT === "F"){
      friCount++
      friTotal += AMT
    }else if (NIGHT === "S"){
      satCount++
      satTotal += AMT
    }
  }
  const FRI_AVG = friTotal / friCount
  const SAT_AVG = satTotal / satCount
  console.log(`Friday avg: ${FRI_AVG}`)
  console.log(`Saturday avg: ${SAT_AVG}`)
  hubSheet.getRange(FRI_ROW, AVG_COL).setValue(Math.round(FRI_AVG))
  hubSheet.getRange(SAT_ROW, AVG_COL).setValue(Math.round(SAT_AVG))
  hubSheet.getRange(FRI_ROW, TOT_COL).setValue(friTotal)
  hubSheet.getRange(SAT_ROW, TOT_COL).setValue(satTotal)
  hubSheet.getRange(FRI_ROW, NIGHT_COL).setValue(friCount)
  hubSheet.getRange(SAT_ROW, NIGHT_COL).setValue(satCount)
}

function getLastChecked(statsSheet, hubSheet) {
  console.log("Updating Last Checked")
  const TGT_COL = 2

  const LAST_DATE = statsSheet.getRange(1, TGT_COL).getValues()[0][0]
  const ALL_DATA = statsSheet.getRange(2, 1, MAXROW - 1, TGT_COL).getValues()
  const HUB_ROW_MAP = getHubRowMap(hubSheet)

  for (let i = 0; i < ALL_DATA.length; i++) {
    const ROW_NAME = ALL_DATA[i][0]
    const CUR_CELL = ALL_DATA[i][TGT_COL - 1]
    if (CUR_CELL == "Y") {
      const HUB_ROW = HUB_ROW_MAP[ROW_NAME]
      if (HUB_ROW !== undefined) {
        hubSheet.getRange(HUB_ROW, 3).setValue(LAST_DATE)
      }
    }
  }
}

function getHubRowMap(hubSheet) {
  const NAMES = hubSheet.getRange(2, 1, MAXROW - 1, 1).getValues()
  const MAP = {}
  for (let i = 0; i < NAMES.length; i++) {
    const NAME = NAMES[i][0]
    if (NAME) MAP[NAME] = i + 2  // +2 to account for 1-index and skipped header
  }
  return MAP
}

function getLastColumn(rowRange) {
  for (let i = rowRange.length - 1; i >= 0; i--) {
    if (rowRange[i] !== "") return i + 1  // +1 to convert 0-index to column number
  }
  return 0
}

function getActiveStat(yOrN, statsSheet, hubSheet){
  const HUB_ROW_MAP = getHubRowMap(hubSheet)
  const ROW_RANGE = statsSheet.getRange("2:2").getValues()[0]
  let editCol = 5
  const LAST_COL = getLastColumn(ROW_RANGE)

  const ALL_DATA = statsSheet.getRange(2, 1, MAXROW - 1, LAST_COL).getValues()
  if (yOrN === "Y"){
    console.log("Getting active streak")
    editCol = 5
  } else {
    console.log("Getting active drought")
    editCol = 6
  }
  for (let i = 0; i < ALL_DATA.length; i++) {
    const ROW = ALL_DATA[i]
    const ROW_NAME = ROW[0]
    let statStreak = 0
    for (let col = 1; col < LAST_COL; col++) {
      if (ROW[col] === yOrN) statStreak++
      else break
    }
    const HUB_ROW = HUB_ROW_MAP[ROW_NAME]
    if (HUB_ROW !== undefined) {
      hubSheet.getRange(HUB_ROW, editCol).setValue(statStreak)
    }
  }
}

function getLongestStat(yOrN, statsSheet, hubSheet){
  const HRM = getHubRowMap(hubSheet)
  const RR = statsSheet.getRange("2:2").getValues()[0]
  let editCol = 7
  const LC = getLastColumn(RR)
  const TERM_SHEET = SpreadsheetApp.getActive().getSheetByName("Hall of Terms");

  const START_COL = 1
  const END_COL   = 2
  const START_ROW = 2
  const END_ROW   = 27

  const TERM_TABLE = TERM_SHEET.getRange(START_ROW, START_COL, END_ROW - 1, END_COL).getValues()
  const VERIFY_MAP = {}
  for (let i = 0; i < TERM_TABLE.length; i++){
    const TERM = TERM_TABLE[i][0]
    const TERM_INTRO_DATE = Utilities.formatDate(TERM_TABLE[i][1], Session.getScriptTimeZone(), "M/d/yy")
    VERIFY_MAP[TERM] = TERM_INTRO_DATE
  }

  console.log(VERIFY_MAP)
  const ALL_DATA = statsSheet.getRange(2, 1, MAXROW - 1, LC).getValues()
  const DATE_ROW = statsSheet.getRange(1, 1, 1, LC).getValues()[0]
  let opposite = ""
  if (yOrN === "Y"){
    opposite = "N"
    editCol = 7
    console.log("Getting Longest Active Streaks")
  } else {
    console.log("Getting Longest Active Droughts")
    opposite = "Y"
    editCol = 8
  }
  for (let i = 0; i < ALL_DATA.length; i++) {
    const ROW = ALL_DATA[i]
    const ROW_NAME = ROW[0]
    let longest = 0
    let statStreak = 0
    for (let col = 1; col < LC; col++) {
      if (ROW[col] === yOrN) {
        statStreak++
        if (statStreak > longest){
          longest = statStreak
        }
      } else if (ROW[col] === ""){
        if (statStreak > longest){
          longest = statStreak
          statStreak = 0
        }
        break
      } else if (ROW[col] === opposite){
        if (statStreak > longest) {
          longest = statStreak
        }
        statStreak = 0
      }
      if (ROW_NAME in VERIFY_MAP) {
        if (VERIFY_MAP[ROW_NAME] == DATE_ROW[col]) {
          break
        }
      }
    }

    const HUB_ROW = HRM[ROW_NAME]
    if (HUB_ROW !== undefined) {
      hubSheet.getRange(HUB_ROW, editCol).setValue(longest)
    }
  }
}