function preload() {
  pixelFont = loadFont('fonts/Pixelon-E4JEg.otf')
}

// Text data
let inputBuffer = ''
let lineHistory = []

// Textbox graphics buffer
let tb




function calculateLines(text, maxWidth) {
  const words = text.split(' ')
  let lines = 1
  let currentLine = ''


  for (let word of words) {
    if (word.length === 0) {
      continue
    }

    let testLine = ''
    if (currentLine.length > 0) {
      testLine = currentLine + ' ' + word
    } else {
      testLine = word
    }

    // test line if it is too long, start a new line
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

  // debug
  // console.log(lines)
  return lines
}

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


// textbox element
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
textbox.maxTextWidth = textbox.width - textbox.sb.width - 5


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

  // debug
  // console.log(lineHeight)
  // console.log(lineCount)
  // console.log(totalTextHeight)
  // console.log(shownPortion)


  // set offset (scrollbar percent scaled to height of total text)
  const scrollOffset = (textbox.sb.y / textbox.height) * totalTextHeight


  // scroll offset, draw text
  tb.push()
  tb.translate(0, -scrollOffset)

  // drawing config
  tb.fill(255)
  tb.strokeWeight(1)

  // draw lines
  let y = 0
  for (let i = 0; i < lineHistory.length; i++) {
    currentLine = lineHistory[i]

    tb.text(currentLine, 0, y * textbox.textLeading + i * textbox.blockSpacing, textbox.maxTextWidth)

    y += calculateLines(currentLine, textbox.maxTextWidth)
  }


  tb.pop()

  // draw scroll bar

  // scrollbar height is the shown portion of text multiplied by the texbox height
  textbox.sb.height = shownPortion * tb.height

  tb.fill(textbox.sb.backbarFill)
  tb.rect(textbox.width - textbox.sb.width,
    0,
    textbox.sb.width,
    textbox.height
  )

  tb.noStroke()
  tb.fill(textbox.sb.fill)
  tb.rect(textbox.width - textbox.sb.width, textbox.sb.y, textbox.sb.width, textbox.sb.height)


  // finally draw textbox viewable portion to screen
  image(tb, textbox.x, textbox.y, textbox.width, textbox.height)
}

function setup() {
  createCanvas(400, 500);
  setupGame()

  // create offscreen buffer for textbox
  tb = createGraphics(textbox.width, textbox.height)
}

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
////////////////// Logic section ////////////////////////////|
/////////////////////////////////////////////////////////////|




function infoCommand() {
  return `You wake up in a dark dank cell in an underground dungeon accused of a crime you didn't commit. The road ahead will be treacherous, but you must achieve your freedom at any cost.
  
  To escape you must traverse the dungeon, solve puzzles, and slay monsters. The dungeon is divided into rooms which can be navigated with compass commands. You will find useful and useless items. There are enemies which will try to kill you. You can attack them and will do so with whatever you have equiped. You can only hold one item in your inventory.

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




// Example room
// room codes describe rooms. vars north, east, south, and west, can point to another room, or give a text message.
// default, gives a message or room for every direction without a variable
// Extra variables can be added and will be used by checking if the room is the correct code for that variable
const exampleRoom = {
  name: 'Prison Cell',
  code: '--prisoncell',
  des: `The cell you have been imprisoned to. The room is small, damp and poorly lit.
  There is a bed and a scrappy note near the cell door.
  To your east is a locked cell door.`,
  default: 'There is a stone wall here',
  east: '--prisonhallway',
  objects: ['scrappynote']
}


const gameStateSettings = {
  prayed: false,
  holySwordTaken: false,
  holySwordPlaced: false,
  darkPassage: false
}


/** Used to initialize the rooms, do not edit directly */
const roomMapBlueprint = [
  {
    name: 'Prison Cell',
    code: '--prisoncell',
    des: `The cell you have been imprisoned to. The room is small, damp and poorly lit.`,
    default: 'There is a stone wall here',
    north: '--prisonhallway',
    objects: ['--scrappynote']
  },
  {
    name: 'Prison Hallway',
    code: '--prisonhallway',
    des: `A dead end hallway with two cells facing each other at the end.`,
    default: 'There is a stone wall here',
    south: '--prisoncell',
    north: '--deadmanscell',
    east: '--guardedhallway',
    objects: []
  },
  {
    name: 'Dead Man\'s cell',
    code: '--deadmanscell',
    des: `A cell much like your own. The resident here has met an unfortunate fate a long time ago.`,
    default: 'There is a stone wall here',
    south: '--prisonhallway',
    objects: ['--armbone']
  },
  {
    name: 'Guarded Hallway',
    code: '--guardedhallway',
    des: `A hallway lined with cells.
    A guard blocks your way east`,
    north: 'Locked cells block your way',
    south: 'Locked cells block your way',
    east: '--pillarroom',
    objects: [],
    enemies: ['--westhallwayguard']
  },
  {
    name: 'Pillar Room',
    code: '--pillarroom',
    des: `A room with a stone obelisk in the center. The obelisk has a slot at the top.`,
    north: '--hallway',
    east: 'A stone wall with an outline of a door.',
    south: 'The south corridor is blocked by web.',
    west: '--guardedhallway',
    objects: []
  },
  {
    name: 'Prison Hallway',
    code: '--hallway',
    des: ``,
    default: 'There is a wall here.',
    east: '--studyroom',
    south: '--pillarroom',
    objects: []
  },
  {
    name: 'Study Room',
    code: '--studyroom',
    des: `An old study room. The walls are lined with bookshelves.`,
    default: 'There is a bookshelf here.',
    west: '--hallway',
    objects: ['--stickcandle', '--oldbook']
  },
  {
    name: 'Empty Room',
    code: '--darkroom',
    des: `There is a plaque on the wall that reads:
    'Darkness will light the way'.`,
    secDes: `A passage has revealed southwards`,
    default: 'There is a wall.',
    north: '--pillarroom',
    objects: []
  },
  {
    name: 'Prayer room',
    code: '--prayerroom',
    des: `A holy room with an alter. Behind the alter there is a sword mounted on the wall.`,
    default: 'There is a wall here.',
    north: '--darkroom',
    objects: [],

  },
  {
    name: 'Cave',
    code: '--cave1',
    des: 'A labrynthine cave system. There is a passage back to the prison to the west.',
    default: '--cave1',
    west: '--pillarroom',
    south: '--cave2',
    objects: []
  },
  {
    name: 'Cave',
    code: '--cave2',
    des: 'A labrynthine cave system.',
    default: '--cave2',
    north: '--cave3',
    east: '--cave1',
    objects: []
  },
  {
    name: 'Cave',
    code: '--cave3',
    des: 'A labrynthine cave system. There is a chasm to the east',
    default: '--cave3',
    south: '--cave2',
    east: '--chasm',
    objects: []
  },
  {
    name: 'Chasm',
    code: '--chasm',
    des: `A large endless chasm stretches from north to south. There is a drawbridge and a lever on the other side.`,
    north: 'A bottomless chasm',
    east: '--freedomstairs',
    south: 'A bottomless chasm',
    west: '--cave3',
    objects: []
  },
  {
    name: 'Staircase',
    code: '--freedomstairs',
    des: 'A long staircase. There is a bright light to the east.',
    default: 'There is a wall here',
    east: '--victory',
    west: '--chasm',
    objects: []
  }
]

exampleObject = {
  noun: 'note',
  adjectives: 'scrappy',
  code: '--scrappynote',
  isTakeable: true, // take, grab, drop, put, place
  isWeapon: true, // can be used to attack. isTakeable needs to also be true for this to work.
  attackDamage: (30, 30) // min and max values of attack, only needs to be here if isWeapon is true
}

/** Used to initialize the objects, do not edit directly */
const objectListBlueprint = [
  {
    noun: 'note',
    adjectives: 'scrappy',
    des: 'A scrappy looking piece of paper, scribbled on in a hurry.',
    code: '--scrappynote',
    isTakeable: true, // take, grab, drop, put, place
    isWeapon: false,
    isAttackable: false
  },
  {
    noun: 'bone',
    adjectives: 'arm',
    code: '--armbone',
    des: 'The arm bone of a long dead prisoner. Looks like it would hurt to get hit with it.',
    isTakeable: true,
    isWeapon: true,
    isAttackable: false,
    attackDamage: (15, 30)
  },
  {
    noun: 'candle',
    adjectives: 'stick',
    code: '--stickcandle',
    des: 'A lit candle stick',
    isTakeable: true,
    isWeapon: false,
    isAttackable: false
  },
  {
    noun: 'book',
    adjectives: 'old',
    code: '--oldbook',
    des: 'An old book with ornate golden lettering.',
    isTakeable: true,
    isWeapon: false,
    isAttackable: false,
    text: `Placeholder text`
  },
  {
    noun: 'sword',
    adjectives: 'holy',
    code: '--holysword',
    des: 'A holy sword used in a long and bloody crusade.',
    isTakeable: true,
    isWeapon: true,
    attackDamage: (30, 50)
  }
]

enemyListBlueprint = [
  {
    name: 'prison guard',
    code: '--westhallwayguard',
    hp: 100,
    attackDamge: (15, 25)
  }
]

const startingRoom = '--prisoncell'

// game variables
let currentRoom
let inventory
let roomLookup
let objectLookup
let objectList
let roomMap
let gameState

const debugMode = true


/** Deep copy a nested data structure */
function copyData(data) {
  return JSON.parse(JSON.stringify(data))
}

/** Make everything back to how it was, cool JSON trick to reset big nested room and object lists */
function setupGame() {
  currentRoom = startingRoom
  inventory = []
  roomMap = copyData(roomMapBlueprint)
  objectList = copyData(objectListBlueprint)
  gameState = copyData(gameStateSettings)
  roomLookup = hashRooms()
  objectLookup = hashObjects()
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

  for (let object of objectList) {
    objects[object.code] = object
  }

  return objects
}


/** The full display name of an object, it's noun and adjectives */
function displayObjectName(obj) {
  let object
  if (typeof obj === 'string') {
    object = objectLookup[obj]
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
  action = input.split(' ', 1)[0]
  objectStr = input.split(' ').slice(1).join(' ')

  // debug commands
  if (debugMode && input.split(' ').length === 2) {
    switch (action) {
      case 'goto':
        return gotoCommand(objectStr)
      default:
        break;
    }
  }

  // prayer room
  if (currentRoom === '--prayerroom') {
    let result = prayerRoomPuzzle(action, objectStr)
    if (result) {
      return result
    }
  }


  // will attempt to turn object string into an object object
  object = null

  console.log(action + ', ' + objectStr)


  // find object
  const potentialObjects = room.objects.slice().concat(inventory.slice())

  for (let potentialObj of potentialObjects) {
    potentialObj = objectLookup[potentialObj]
    if (objectStr === potentialObj.noun || objectStr === displayObjectName(potentialObj)) {
      object = potentialObj
    }
  }


  // looked for object in room and inventory, could not find
  if (!object) {
    return objectStr + ' not found'
  }




  if (['take', 'grab'].includes(action) && object.isTakeable) {
    return takeCommand(object)
  } else if (action === 'drop' && object.isTakeable) {
    return dropCommand(object)
  } else if (action === 'describe') {
    return describeCommand(object)
  }

  if (object.code === '--holysword') {
    if (action === 'insert' && currentRoom === '--pillarroom') {
      room.east = '--cave1'
      room.des = `A room with a stone obelisk in the center. The obelisk has sword inserted in it. A passage has opened up to the east.`
      return 'You insert the sword into the obelisk and twist it. The sword is stuck and a passage opens in the east.'
    }
  }


  return 'Invalid action for ' + displayObjectName(object)
}

function takeCommand(object) {
  if (inventory.length === 2) {
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
    result += article(displayObjectName(objectLookup[inventory[0]]))
    if (inventory.length > 1) {
      result += ', and '
      result += article(displayObjectName(objectLookup[inventory[1]]))
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

  if (currentRoom === '--darkroom' && !hasLight()) {
    r.south = '--prayerroom'
  } else {
    r.south = undefined
  }


  r = roomLookup[currentRoom]
  if (r[direction] && r[direction].slice(0, 2) === '--') {
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
    if (gameStateSettings.swordTaken) {
      return
    }

    if (!gameStateSettings.prayed) {
      return 'You attempt to pry the sword off the wall but it will not budge.'
    }

    if (inventory.length > 1) {
      return 'You will need to drop something first'
    }

    gameStateSettings.swordTaken = true
    inventory.push('--holysword')
    return 'You take the sword off the wall'
  }


  if (action === 'pray' && objectStr === 'alter') {
    gameStateSettings.prayed = true
    return 'You bow your head to pay respect.'
  }
}