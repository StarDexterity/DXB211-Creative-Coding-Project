function preload() {
  pixelFont = loadFont('fonts/Pixelon-E4JEg.otf')
}

// Text data
let inputBuffer = ''
let lineHistory = []


function setup() {
  createCanvas(400, 500);


  lineHistory.push(welcomeText())

  // config
  textSize(15)
  textFont(pixelFont)

}


function calculateLines(text, maxWidth) {
  const words = text.split(' ')
  let lines = 1
  let currentLine = ''



  for (let word of words) {
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
  x: 10,
  y: 10,
  textSize: 15,
  maxTextWidth: 0, // calculated below
  width: 380,
  height: 425,
  textLeading: 18,
  blockSpacing: 0,
  sb: { // scrollbar
    y: 0, // calculated y position of the scrollbar. Starts at zero. 
    offsetY: 0, // calculated y offset of the mouse from the top of the scrollbar
    width: 15,
    height: 0,
    dragging: false,
    fill: '#81D4FA'
  }
}
textbox.maxTextWidth = textbox.width - textbox.sb.width - 5


function drawTextDisplay() {
  // create offscreen buffer
  tb = createGraphics(textbox.width, textbox.height)

  // config
  tb.textAlign(LEFT, TOP)
  tb.fill(0)
  tb.background(0)
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

  tb.noStroke()
  tb.fill(textbox.sb.fill)
  tb.rect(textbox.width - textbox.sb.width, textbox.sb.y, textbox.sb.width, textbox.sb.height)


  // finally draw textbox viewable portion to screen
  image(tb, textbox.x, textbox.y, textbox.width, textbox.height)
}


function draw() {
  background(0);

  // draws main text display
  drawTextDisplay()

  // for designing the interface and debugging
  strokeWeight(1)
  fill(255)
  // text(`${mouseX}, ${mouseY}`, 320, 25)

  strokeWeight(1)

  // input
  textSize(15)
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
    output = handleInput()

    // push input and output to the history display
    lineHistory.push(inputBuffer)
    lineHistory.push(output)

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
  return `AAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA `
}


gameLogic = {

}


/**
 * Magical function. Entry point of the game. Simply take the input and return some output. DO NOT USE p5js FUNCTIONS.
 */
function handleInput(input) {

  return 'A default response here'
}