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


function welcomeText() {
  return ``
}

function helpText() {
  return `These are the commands. This game is not caps sensitive:
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

  All other game commands are typically formatted: {Action} {Object}. Objects are displayed in bold, and will sometimes include adjectives (i.e. 'golden key'). Actions are short words usually 6 letters or less. For example 'throw ball'. These are purposefully unknown, go have fun and see what adventure awaits!
  `
}


gameLogic = {

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
  objects: ['scrappynote', 'bed', 'celldoor']
}






const roomMap = [
  {
    name: 'Prison Cell',
    code: '--prisoncell',
    des: `The cell you have been imprisoned to. The room is small, damp and poorly lit.
    There is a bed, a scrappy note near the cell door.
    To your north is the cell door. It is locked tight`,
    default: 'There is a stone wall here',
    north: '--prisonhallway',
    objects: ['scrappynote', 'bed', 'celldoor']
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
    des: `A cell much like your own.
    There is a bed and the bones of a long dead man.`,
    default: 'There is a stone wall here',
    south: '--prisonhallway',
    objects: ['bone', 'bed']
  },
]




const startingRoom = '--prisoncell'
let currentRoom = ''
var roomLookup = hashRooms()


function setupGame() {
  currentRoom = startingRoom

  lineHistory = []
  lineHistory.push(welcomeText())
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



/**
 * Magical function. Entry point of the game. Simply take the input and return some output. Store variables for game state in gameLogic. DO NOT USE p5js FUNCTIONS.
 */
function handleInput(input) {
  console.log(input)


  // game is not caps sensitive 
  input = input.toLowerCase()

  if (input.length === 0) {
    return 'No Command given.'
  }

  // commands without arguments
  if (input.split(' ').length === 1) {
    switch (input) {
      case 'help':
        return helpText();
      case 'look':
        return lookCommand()
      case 'north':
        return northCommand()
      case 'east':
        return eastCommand()
      case 'south':
        return southCommand()
      case 'west':
        return westCommand()
      case 'reset':
        return 'reset'
      default:
        break;
    }
  }

  // input processing
  action = input.split(' ', 1)[0]
  object = input.split(' ').slice(1).join(' ')


  return 'Invalid Action.'
}

function lookCommand() {
  r = roomLookup[currentRoom]
  return r.name + '\n' + r.des
}

function northCommand() {
  r = roomLookup[currentRoom]
  console.log(r.north.slice(0, 2))
  if (r.north && r.north.slice(0, 2) === '--') {
    currentRoom = r.north
    return lookCommand()
  } else if (r.north) {
    return r.north
  } else if (r.default.slice(0, 2) == '--') {
    currentRoom = r.default
    return lookCommand()
  } else {
    return r.default
  }
}

function eastCommand() {
  r = roomLookup[currentRoom]

  if (r.east && r.east.slice(0, 2) === '--') {
    currentRoom = r.east
    return lookCommand()
  } else if (r.east) {
    return r.east
  } else if (r.default.slice(0, 2) == '--') {
    currentRoom = r.default
    return lookCommand()
  } else {
    return r.default
  }
}

function southCommand() {
  r = roomLookup[currentRoom]

  if (r.south && r.south.slice(0, 2) === '--') {
    currentRoom = r.south
    return lookCommand()
  } else if (r.south) {
    return r.south
  } else if (r.default.slice(0, 2) == '--') {
    currentRoom = r.default
    return lookCommand()
  } else {
    return r.default
  }
}


function westCommand() {
  r = roomLookup[currentRoom]

  if (r.west && r.west.slice(0, 2) === '--') {
    currentRoom = r.west
    return lookCommand()
  } else if (r.west) {
    return r.west
  } else if (r.default.slice(0, 2) == '--') {
    currentRoom = r.default
    return lookCommand()
  } else {
    return r.default
  }
}