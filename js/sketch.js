/** Load game assets from file */
function preload() {
  pixelFont = loadFont('fonts/Pixelon-E4JEg.otf')
  itemsJSON = loadJSON('data/items.json')
  roomsJSON = loadJSON('data/rooms.json')
}

// loaded JSON, copied to load gamedata, kept in original state for repeat reloads
let itemsJSON
let roomsJSON

// Text data
let inputBuffer = ''
let lineHistory = []

// Textbox graphics buffer
let tb

/**
 * 
 * @param {string} text Gets number of lines of this string
 * @param {number} maxWidth Max width of a line
 * @returns Number of lines of the text (can sometimes be wrong :/ needs investigation)
 */
function calculateLines(text, maxWidth) {
  const words = text.split(' ')
  let lines = 1
  let currentLine = ''


  // for each word in the string
  for (let word of words) {
    if (word.length === 0) {
      continue
    }

    let testLine = ''

    // if its not the first word in the current line, prepend a space
    if (currentLine.length > 0) {
      testLine = currentLine + ' ' + word
    } else {
      testLine = word
    }

    // test line width, if it is too long, start a new line
    if (tb.textWidth(testLine) > maxWidth) {
      currentLine = word
      lines += 1
    } else {
      currentLine = testLine
    }
  }

  // count line breaks
  for (let l of text) {
    if (l == '\n') {
      lines += 1
    }
  }

  return lines
}

/**
 * 
 * @param {Array[string]} lines Array of line strings in the console.
 * @param {number} maxWidth Max width of a line
 * @returns Height in pixels of the textbox needed to store the lines. Considers text settings, such as font size.
 */
function calculateTextboxHeight(lines, maxWidth) {
  if (lines.length === 0) {
    return 0
  }

  let y = 0
  for (let i = 0; i < lines.length; i++) {
    y += calculateLines(lines[i], maxWidth)
  }

  return y * textbox.textLeading + (lines.length - 1) * textbox.blockSpacing
}


// textbox config object
let textbox = {
  x: 10, // x offset of textbox in main canvas
  y: 10, // y offset of textbox in main canvas
  textSize: 15, // Font size of text
  maxTextWidth: 0, // calculated below
  width: 380, // static width of textbox
  height: 425, // static height of textbox
  textLeading: 18, // spacing between successive text lines
  blockSpacing: 10, // spacing between blocks (blocks are defined as strings in the lineHistory array)
  sb: { // scrollbar
    y: 0, // calculated y position of the scrollbar. Starts at zero. 
    offsetY: 0, // calculated y offset of the mouse from the top of the scrollbar
    width: 15,
    height: 0,
    dragging: false,
    fill: '#6BCBE7', // colour of scrollbar handle
    backbar: true, // is there a coloured backbar
    backbarFill: '#356D7D' // colour of backbar
  }
}
// max width of a line is the textbox width take the sidebar width take 5
textbox.maxTextWidth = textbox.width - textbox.sb.width - 5


/**
 * Draws main console text display of the output. Text is drawn to a buffer first, so overflow can be hidden.
 */
function drawTextDisplay() {
  // clear buffer
  tb.background(0)

  // config
  tb.textAlign(LEFT, TOP)
  tb.fill(0)
  tb.textFont(pixelFont)
  tb.textSize(textbox.textSize)
  tb.textLeading(textbox.textLeading)

  // set scrollbar height based on line count
  const totalTextHeight = calculateTextboxHeight(lineHistory, textbox.maxTextWidth)
  const shownPortion = min(1, tb.height / totalTextHeight)

  // set offset (scrollbar percent scaled to height of total text)
  const scrollOffset = (textbox.sb.y / textbox.height) * totalTextHeight

  // scroll offset, draw text
  tb.push()
  tb.translate(0, -scrollOffset)

  // drawing config
  tb.fill(255)
  tb.strokeWeight(1)

  // draw text lines
  let y = 0
  for (let i = 0; i < lineHistory.length; i++) {
    currentLine = lineHistory[i]

    tb.text(currentLine, 0, y * textbox.textLeading + i * textbox.blockSpacing, textbox.maxTextWidth)

    y += calculateLines(currentLine, textbox.maxTextWidth)
  }

  // reset translation
  tb.pop()

  // draw scroll bar

  // calculate scrollbar height = seen portion of text multiplied by the texbox height
  textbox.sb.height = shownPortion * tb.height

  // draw backbar (dunno what the official term is)
  tb.fill(textbox.sb.backbarFill)
  tb.rect(textbox.width - textbox.sb.width,
    0,
    textbox.sb.width,
    textbox.height
  )

  // draw scroll handle
  tb.noStroke()
  tb.fill(textbox.sb.fill)
  tb.rect(textbox.width - textbox.sb.width, 
    textbox.sb.y, 
    textbox.sb.width, 
    textbox.sb.height)


  // finally draw textbox viewable portion to screen
  image(tb, textbox.x, textbox.y, textbox.width, textbox.height)
}

/**
 * Setup function for p5js
 * Create canvas, setup game state, and create main text display buffer
 */
function setup() {
  createCanvas(400, 500);
  setupGame()

  // create offscreen buffer for textbox
  tb = createGraphics(textbox.width, textbox.height)
}

/**
 * p5js Main draw function
 */
function draw() {
  background(0);

  // draws main text display
  drawTextDisplay()

  // for designing the interface and debugging
  // strokeWeight(1)
  // text(`${mouseX}, ${mouseY}`, 320, 25)

  // input
  noStroke()
  fill(255)
  textSize(15)
  textFont(pixelFont)
  text(inputBuffer, 15, 470)
  rect(textWidth(inputBuffer) + 15, 470, 6, 1) // cursor


  // static ui
  noFill()
  stroke('white')
  strokeWeight(3)
  rect(5, 5, width - 10, height - 10)
  line(5, 440, 395, 440)
}

function keyPressed() {
  if (keyCode === ENTER) {
    output = handleInput(inputBuffer)


    if (output === 'reset') {
      setupGame()
    } else {
      // push input and output to the history display
      lineHistory.push(inputBuffer)
      lineHistory.push(output)
    }


    // clear input buffer
    inputBuffer = ''
  } else if (keyCode === BACKSPACE) {
    inputBuffer = inputBuffer.substring(0, inputBuffer.length - 1);
  }

  scrollBottom()
}

function keyTyped() {
  if (keyCode !== ENTER) {
    inputBuffer += key
  }
}

function scrollBottom() {
  const totalTextHeight = calculateTextboxHeight(lineHistory, textbox.maxTextWidth)
  const shownPortion = min(1, tb.height / totalTextHeight)

  textbox.sb.height = shownPortion * textbox.height
  textbox.sb.y = textbox.height - textbox.sb.height
}

function mousePressed() {
  tbMouseX = mouseX - textbox.x
  tbMouseY = mouseY - textbox.y
  sbX = textbox.width - textbox.sb.width


  // scrollbar
  // check bounding box
  if (tbMouseX >= sbX
    && tbMouseX <= textbox.width
    && tbMouseY >= textbox.sb.y
    && tbMouseY <= textbox.sb.y + textbox.sb.height) {
    textbox.sb.dragging = true
    textbox.sb.offsetY = tbMouseY - textbox.sb.y
  }
}

function mouseDragged() {
  tbMouseY = mouseY - textbox.y

  // scrollbar
  if (textbox.sb.dragging) {
    textbox.sb.y = min(textbox.height - textbox.sb.height, max(0, tbMouseY - textbox.sb.offsetY))
  }
}

function mouseReleased() {
  // scrollbar
  textbox.sb.dragging = false
}















/////////////////////////////////////////////////////////////|
////////////////////// Game section /////////////////////////|
/////////////////////////////////////////////////////////////|




function infoCommand() {
  return `Welcome to Dungeon Escape!
  
  You wake up in a dark dank cell in an underground dungeon accused of a crime you didn't commit. The road ahead will be treacherous, but you must achieve your freedom at any cost.
  
  To escape you must traverse the dungeon and solve puzzles. The dungeon is divided into rooms which can be navigated with compass commands. You will find useful and useless items. You can hold ${maxInventorySlots} items in your inventory.

  Type HELP for more info.
  `
}

function helpCommand() {
  return `Commands (not caps sensitive):
  HELP - Shows a help display for all the commands (duh)
  INFO - Some info on the game
  INVENTORY - Show items the player is holding
  DESCRIBE {Object} - A short description available for every object
  LOOK - A short description of the current room
  NORTH - Go North
  EAST - Go East
  SOUTH - Go South
  WEST - Go West
  RESET - Resets game. WARNING: all progress will be lost

  All other game commands are hidden and typically formatted: {Action} {Object}. Objects will sometimes include adjectives (i.e. 'golden key'), but can be called without them so long as there isn't any ambiguity. Actions are short words usually 6 letters or less. For example 'throw ball'.`
}


/** Clean copy of the game state variables */
const gameStateOriginal = {
  prayed: false,
  holySwordTaken: false,
  holySwordPlaced: false,
  darkPassage: false,
  cellDoorUnlocked: false
}


// settings
const startingRoom = '--prisoncell'
const maxInventorySlots = 3

// enemyListBlueprint = [
//   {
//     name: 'prison guard',
//     code: '--westhallwayguard',
//     hp: 100,
//     attackDamge: (15, 25)
//   }
// ]


// game variables
let currentRoom
let inventory
let roomLookup
let itemLookup
let itemList
let roomMap
let gameState

// for the teleport command
const debugMode = false


/** Deep copy a nested data structure */
function copyData(data) {
  return JSON.parse(JSON.stringify(data))
}

/** Make everything back to how it was, cool JSON trick to reset big nested room and object lists */
function setupGame() {
  currentRoom = startingRoom
  inventory = []
  roomMap = copyData(roomsJSON)[0] // zero because array is wrapped in top level json object
  itemList = copyData(itemsJSON)[0]
  gameState = copyData(gameStateOriginal)
  roomLookup = hashRooms()
  itemLookup = hashObjects()
  lineHistory = []
  lineHistory.push(infoCommand())
  lineHistory.push(lookCommand())
}

/** Create a dictionary for quick look up of the room from the code */
function hashRooms() {
  rooms = {}

  for (let room of roomMap) {
    rooms[room.code] = room
  }

  return rooms
}

/** Create a dictionary for quick look up of the object from the code */
function hashObjects() {
  objects = {}

  for (let object of itemList) {
    objects[object.code] = object
  }

  return objects
}

/**
 * 
 * @param {Object} item object
 */
function destroyItem(item) {
  inventory = inventory.filter((x) => x !== item.code)
  r = roomLookup[currentRoom]
  r.objects = r.objects.filter((x) => x !== item.code)
}


/** The full display name of an object, it's noun and adjectives */
function displayObjectName(obj) {
  let object
  if (typeof obj === 'string') {
    object = itemLookup[obj]
  } else {
    object = obj
  }

  if (!object?.noun) {
    throw Error('Not an object')
  }

  result = ''

  if (object?.adjectives) {
    result += object.adjectives
    result += ' '
  }

  result += object.noun

  return result
}

/** Takes a noun and gives it an indefinite article a/an */
function article(objDispName) {
  fLetter = objDispName[0]
  if (['a', 'e', 'i', 'o', 'u'].includes(fLetter)) {
    return 'an ' + objDispName
  } else {
    return 'a ' + objDispName
  }
}


/** Environment update
 * Happens after taking an action, useful for things like traps and enemy attacks
 */
function environmentUpdate() {
  // enemy
  room = roomLookup[currentRoom]
  if (room.enemies) {
    for (enemy in room.enemies) {

    }
  }
}

/** parse an item string into an item */
function parseItem(itemStr) {
  // find object
  const potentialItems = room.objects.slice().concat(inventory.slice())
  let item = null

  for (let potentialItem of potentialItems) {
    potentialItem = itemLookup[potentialItem]
    if (itemStr === potentialItem.noun || itemStr === displayObjectName(potentialItem)) {
      item = potentialItem
    }
  }

  return item
}

/**
 * Magical function. Entry point of the game. Simply take the input and return some output. Store variables for game state in gameLogic. DO NOT USE p5js FUNCTIONS.
 */
function handleInput(input) {
  console.log(input)

  // room
  room = roomLookup[currentRoom]


  // game is not caps sensitive 
  input = input.toLowerCase()

  if (input.length === 0) {
    return 'No Command given.'
  }

  // lock the game if victory room is reached
  if (currentRoom === '--victory') {
    if (input === 'reset') {
      return 'reset'
    }

    return 'Please type RESET to restart the game'
  }

  // commands without arguments
  if (input.split(' ').length === 1) {
    switch (input) {
      case 'help':
        return helpCommand()
      case 'info':
        return infoCommand()
      case 'look':
        return lookCommand()
      case 'north':
        return moveCommand('north')
      case 'east':
        return moveCommand('east')
      case 'south':
        return moveCommand('south')
      case 'west':
        return moveCommand('west')
      case 'inventory':
        return inventoryCommand()
      case 'reset':
        return 'reset'
      default:
        return 'Command not recognised'
    }
  }


  // input processing
  const action = input.split(' ', 1)[0]
  const itemStr = input.split(' ').slice(1).join(' ')

  // debug commands
  if (debugMode && input.split(' ').length === 2) {
    switch (action) {
      case 'goto':
        return gotoCommand(itemStr)
      default:
        break;
    }
  }

  // prayer room
  if (currentRoom === '--prayerroom') {
    let result = prayerRoomPuzzle(action, itemStr)
    if (result) {
      return result
    }
  }

  // prison cell door
  if (currentRoom === '--prisoncell'
    && ['door', 'cell door'].includes(itemStr)
    && ['unlock', 'open'].includes(action)
  ) {


    if (!inventory.includes('--cellkey')) {
      return 'This door needs a key'
    }

    if (gameState.cellDoorUnlocked) {
      return 'cell door is already unlocked.'
    }

    gameState.cellDoorUnlocked = true
    return 'The cell door swings open.'
  }

  // will attempt to turn object string into an item object
  let item = null

  console.log(action + ', ' + itemStr)


  item = parseItem(itemStr)


  // looked for object in room and inventory, could not find
  if (!item) {
    return itemStr + ' not found'
  }

  if (item.code === '--keypebble' && ['crack', 'break'].includes(action)) {
    // destroy pebble and spawn key in current room
    destroyItem(item)
    room.objects.push('--cellkey')
    return 'The pebble breaks with ease and a key drops onto the floor.'
  }


  if (action === "read" && item.text) {
    return item.text
  }




  if (['take', 'grab'].includes(action) && item.isTakeable) {
    return takeCommand(item)
  } else if (action === 'drop' && item.isTakeable) {
    return dropCommand(item)
  } else if (action === 'describe') {
    return describeCommand(item)
  }

  if (item.code === '--holysword') {
    if (action === 'insert' && currentRoom === '--pillarroom') {
      room.east = '--cave1'
      room.des = `A room with a stone obelisk in the center. The obelisk has sword inserted in it. A passage has opened up to the east.`
      return 'You insert the sword into the obelisk and twist it. The sword is stuck and a passage opens in the east.'
    }
  }


  return 'Invalid action for ' + displayObjectName(item)
}

function takeCommand(object) {
  if (inventory.length === maxInventorySlots) {
    return 'You must drop the object you are currently holding first'
  } else if (inventory.includes(object.code)) {
    return 'You are already holding this item'
  } else {
    // put object in inventory
    inventory.push(object.code)

    // remove object from remove
    r = roomLookup[currentRoom]
    r.objects = r.objects.filter((x) => x !== object.code)

    return 'You have taken ' + displayObjectName(object)
  }
}

function attackCommand(target, weapon) {
  if (!inventory.includes(weapon)) {
    return 'You don\'t have that to attack with'
  }

  if (!weapon.isWeapon) {
    return 'You can\'t attack with that'
  }

  if (!target.isAttackable) {
    return 'You can\'t attack that'
  }

}

function dropCommand(object) {
  if (!inventory.includes(object.code)) {
    return 'You are not carrying that'
  } else {
    // empty inventory
    inventory = []

    // put object in room
    r = roomLookup[currentRoom]
    r.objects.push(object.code)

    return 'You have dropped ' + displayObjectName(object)
  }
}

function inventoryCommand() {
  if (inventory.length === 0) {
    return 'You aren\'t holding anything'
  } else {
    result = ''
    result += 'You are holding '
    result += article(displayObjectName(itemLookup[inventory[0]]))

    for (let i = 1; i < inventory.length; i++) {
      result += ', and '
      result += article(displayObjectName(itemLookup[inventory[i]]))
    }

    result += '.'
    return result
  }
}

function describeCommand(object) {
  return object.des
}

function lookCommand() {
  let result = ''
  r = roomLookup[currentRoom]

  result += r.name
  result += '\n'

  if (r.des.length > 0) {
    result += r.des
    result += '\n'
  }

  if (currentRoom === `--darkroom` && !hasLight()) {
    result += r.secDes
    result += '\n'
  }

  if (r.objects.length !== 0) {
    result += 'There is '
    result += article(displayObjectName(r.objects[0]))

    for (let i = 1; i < r.objects.length; i++) {
      result += ', '
      if (i === r.objects.length - 1) {
        result += 'and '
      }
      result += article(displayObjectName(r.objects[i]))
    }

    result += '.'
  }
  return result
}

/**
 * Move player in a direction.
 * @param {string} direction North, East, South, or West
 * @returns Result of attempting movement, either a description of new room, or a text 
 */
function moveCommand(direction) {
  if (!direction in ['north', 'east', 'south', 'west']) {
    throw Error('Nah bro, move command only takes \'north\', \'east\', \'south\', or \'west\'')
  }

  moveResult = ''

  // pillar room moving south, if has candle, web will get burnt
  if (currentRoom === '--pillarroom'
    && direction === 'south'
    && inventory.includes('--stickcandle')) {
    r = roomLookup[currentRoom]
    r.south = '--darkroom'
    moveResult += 'The south hallway is filled with cobwebs. You hold out your candle and burn the cobwebs away.\n\n'
  }




  r = roomLookup[currentRoom]
  if (r[direction] && r[direction].slice(0, 2) === '--') {
    // extra special traversal rules, not for once off events //

    // cannot cross chasm without grappling hook
    if (currentRoom === '--chasm1' && direction === 'east'
      || currentRoom === '--chasm2' && direction === 'west') {
      if (inventory.includes('--grapplinghook')) {
        moveResult += 'You cross the gap using your grapping hook.\n\n'
      } else {
        return 'The gap is too wide to cross'
      }
    }

    // cannot venture into prayer room with light
    if (currentRoom === '--darkroom' && hasLight()) {
      return 'There is a wall'
    }

    // prison cell door is locked
    if (currentRoom === '--prisoncell' && !gameState.cellDoorUnlocked) {
      return 'Cell door is locked tight'
    }


    currentRoom = r[direction]
    moveResult += lookCommand()

  } else if (r[direction]) {
    moveResult += r[direction]

  } else if (r.default.slice(0, 2) == '--') {
    currentRoom = r.default
    moveResult += lookCommand()

  } else {
    moveResult += r.default
  }

  return moveResult
}

function hasLight() {
  r = roomLookup[currentRoom]
  return inventory.includes('--stickcandle') && r.objects.includes('--stickcandle')
}


/** Debug command for quickly getting to a room */
function gotoCommand(roomCode) {
  if (roomCode in roomLookup) {
    currentRoom = roomCode
    return lookCommand()
  }

  return 'Room does not exist'
}


function prayerRoomPuzzle(action, objectStr) {
  if (action === 'take' && objectStr === 'sword') {
    if (gameState.swordTaken) {
      return
    }

    if (!gameState.prayed) {
      return 'You attempt to pry the holy sword off the wall but it will not budge.'
    }

    if (inventory.length > 1) {
      return 'You will need to drop something first'
    }

    gameState.swordTaken = true
    inventory.push('--holysword')
    return 'You take the sword off the wall'
  }


  if (action === 'pray' && objectStr === 'alter') {
    gameState.prayed = true
    return 'You bow your head to pay respect.'
  }
}