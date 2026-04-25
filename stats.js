const STATS = 682100497
const HUB = 0 
// runs at the end of the show (not on a trigger, currently)
// If updating just the Last Checked column, use getLastChecked()
function updateStats(){
  const test = SpreadsheetApp.getActiveSpreadsheet()
  console.log("test")
  const statSheet = SpreadsheetApp.getActive().getSheetByName("Stats")
  const hubSheet = SpreadsheetApp.getActive().getSheetByName("Hub")
  getLastChecked(statSheet, hubSheet)
  getActiveStat("Y", statSheet, hubSheet)
  getActiveStat("N", statSheet, hubSheet)
  getLongestStat("Y", statSheet, hubSheet)
  getLongestStat("N", statSheet, hubSheet) 
}

function getLastChecked(statsSheet, hubSheet) {
  const maxRow = 176
  const targetColumn = 2

  const lastDate = statsSheet.getRange(1, targetColumn).getValues()[0][0]
  const allData = statsSheet.getRange(2, 1, maxRow - 1, targetColumn).getValues()
  const hubRowMap = getHubRowMap(hubSheet)

  for (let i = 0; i < allData.length; i++) {
    const rowName = allData[i][0]
    const currentCell = allData[i][targetColumn - 1]
    if (currentCell == "Y") {
      const hubRow = hubRowMap[rowName]
      if (hubRow !== undefined) {
        hubSheet.getRange(hubRow, 3).setValue(lastDate)
        console.log("Updated " + rowName + " - " + lastDate)
      }
    }
  }
}

// NO LONGER NEEDED, NEEDS TO BE REWORKED. 
function fullCheckForYes() { 
  const statsSheet = SpreadsheetApp.getActive().getSheetById(STATS)
  const hubSheet = SpreadsheetApp.getActive().getSheetById(HUB)

  const rowRange = statsSheet.getRange("2:2").getValues()[0]
  const lastColumn = getLastColumn(rowRange)
  const maxRow = 176

  const allData = statsSheet.getRange(1, 1, maxRow, lastColumn).getValues()
  const dateRow = allData[0]
  const hubRowMap = getHubRowMap(hubSheet)  // one read, up front

  const hubUpdates = []
  for (let i = 1; i < allData.length; i++) {
    const row = allData[i]
    const rowName = row[0]

    let lastYesCol = -1
    for (let col = 1; col < lastColumn; col++) {
      if (row[col] == "Y") lastYesCol = col
    }

    const lastDate = lastYesCol !== -1 ? dateRow[lastYesCol] : "N/A"
    hubUpdates.push({ rowName, lastDate })
    console.log(rowName + " - " + lastDate)
  }

  for (const { rowName, lastDate } of hubUpdates) {
    const hubRow = hubRowMap[rowName]
    if (hubRow !== undefined) {
      hubSheet.getRange(hubRow, 3).setValue(lastDate)
    }
  }
}

function getHubRowMap(hubSheet) {
  const maxRow = 176
  const names = hubSheet.getRange(2, 1, maxRow - 1, 1).getValues()
  const map = {}
  for (let i = 0; i < names.length; i++) {
    const name = names[i][0]
    if (name) map[name] = i + 2  // +2 to account for 1-index and skipped header
  }
  return map
}

function getLastStatRow(statSheet){
  // TODO
}
function getLastColumn(rowRange) {
  for (let i = rowRange.length - 1; i >= 0; i--) {
    if (rowRange[i] !== "") return i + 1  // +1 to convert 0-index to column number
  }
  return 0
}
function getActiveStat(yOrN, statsSheet, hubSheet){
  const hubRowMap = getHubRowMap(hubSheet)
  const rowRange = statsSheet.getRange("2:2").getValues()[0]
  const maxRow = 176
  let debugStr = ""
  let editCol = 5
  const lastCol = getLastColumn(rowRange)

  const allData = statsSheet.getRange(2, 1, maxRow - 1, lastCol).getValues()
  if (yOrN === "Y"){
    debugStr = " streak: "
    editCol = 5
  } else {
    debugStr = " drought: "
    editCol = 6
  }
  for (let i = 0; i < allData.length; i++) {
    const row = allData[i]
    const rowName = row[0]
    let statStreak = 0
    for (let col = 1; col < lastCol; col++) {
      if (row[col] === yOrN) statStreak++
      else break
    }
    const hubRow = hubRowMap[rowName]
    if (hubRow !== undefined) {
      hubSheet.getRange(hubRow, editCol).setValue(statStreak)
      console.log("Updated " + rowName + debugStr + " - " + statStreak)
    }
  }
}

function getLongestStat(yOrN, statsSheet, hubSheet){
  const hubRowMap = getHubRowMap(hubSheet)
  const rowRange = statsSheet.getRange("2:2").getValues()[0]
  const maxRow = 176
  let debugStr = ""
  let editCol = 7
  const lastCol = getLastColumn(rowRange)

  const verifyMap = {
    "Anything Illegal": "7/26/24",
    "Call Clinger": "11/17/23",
    "Camera Operator Olympics": "7/26/24",
    "Choo Choo": "5/05/23",
    "Daisy Dukes": "9/15/23",
    "Filming a Documentary": "7/26/24",
    "Hands Up": "11/29/24",
    "High-Vis Clothing": "3/14/25",
    "Hoopty": "9/15/23",
    "I'll Have Your Badge": "4/17/24",
    "Lost in Translation": "6/17/23",
    "Off Fleek": "9/15/23",
    "PIT Manuever": "4/22/23",
    "Pull to the Right": "3/28/25",
    "Rock and Roll All Nite": "5/05/23",
    "Send Backup": "5/30/25",
    "Snow": "11/21/25",
    "Talked Myself Into Cuffs": "10/13/23",
    "Traffic Cone": "3/09/24",
    "U-Haul": "4/22/23",
    "Vest Rest": "9/29/23",
    "Waffle House": "7/26/24",
    "Welcome to the Jungle": "9/22/23",
    "Welfare Check": "9/15/23",
    "Wrong Way Driver": "11/21/25",
    "Your Incident Has Been Updated": "1/31/26"
  }

  const allData = statsSheet.getRange(2, 1, maxRow - 1, lastCol).getValues()
  const dateRow = statsSheet.getRange(1, 1, 1, lastCol).getValues()[0]
  let opposite = ""
  if (yOrN === "Y"){
    debugStr = " streak: "
    opposite = "N"
    editCol = 7
  } else {
    debugStr = " drought: "
    opposite = "Y"
    editCol = 8
  }
  for (let i = 0; i < allData.length; i++) {
    const row = allData[i]
    const rowName = row[0]
    let longest = 0
    let statStreak = 0
    for (let col = 1; col < lastCol; col++) {
      if (row[col] === yOrN) {
        statStreak++
        if (statStreak > longest){
          longest = statStreak
        }
      } else if (row[col] === ""){
        if (statStreak > longest){
          longest = statStreak
          statStreak = 0
        }
        break
      } else if (row[col] === opposite){
        if (statStreak > longest) {
          longest = statStreak
        }
        statStreak = 0
        if (rowName in verifyMap) {
          if (verifyMap[rowName] == dateRow[col]) {
            break
          }
        }
      }
    }

    const hubRow = hubRowMap[rowName]
    if (hubRow !== undefined) {
      hubSheet.getRange(hubRow, editCol).setValue(longest)
      console.log("Updated " + rowName + debugStr + " - " + longest)
    }
  }
}