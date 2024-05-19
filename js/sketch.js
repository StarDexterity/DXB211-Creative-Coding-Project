function preload() {
    pixelFont = loadFont('fonts/Pixelon-E4JEg.otf')
  }
  
  
  function setup() {
    createCanvas(400, 500);
    
    // config
    textSize(15)
    textFont(pixelFont)
    
  }
  
  // Text data
  let inputBuffer = ''
  let lineHistory = []
  
  
  
  // textbox element
  let textbox =  {
    x: 10,
    y: 10,
    width: 380,
    height:425,
    lineOffset:5,
    sb: { // scrollbar
      y: 0,
      offsetY: 0,
      width: 15,
      height: 0,
      dragging: false,
      fill: '#81D4FA'
    }
  }
  
  function drawTextDisplay() {
    // create offscreen buffer
    tb = createGraphics(textbox.width, textbox.height)
    tb.fill(0)
    tb.background(0, 255, 0)
    
    
    // set scrollbar height based on line count
    const lineHeight = textAscent() + textDescent()
    const lineCount = lineHistory.length + 1
    const totalTextHeight = lineCount * lineHeight
    const shownPortion = min(1, tb.height / totalTextHeight)
    
    // debug
    console.log(lineHeight)
    console.log(lineCount)
    console.log(totalTextHeight)
    console.log(shownPortion)
  
    
    
    // scrollbar height is the shown portion of text multiplied by the texbox height
    textbox.sb.height = shownPortion * tb.height
    
    
    // draw scrollbar
    tb.noStroke()
    tb.fill(textbox.sb.fill)
    tb.rect(textbox.width-textbox.sb.width, textbox.sb.y,     textbox.sb.width, textbox.sb.height)
    
    
    // set offset
    const scrollOffset = (textbox.sb.offsetY / textbox.height) * totalTextHeight
    
    
    // scroll offset
    tb.translate(0, -scrollOffset)
    
    // drawing config
    tb.fill(255)
    tb.strokeWeight(1)
    
    
    // draw lines
    for (let i = 0; i < lineHistory.length; i++) { 
      const y = (i + 1) * lineHeight
      tb.text(lineHistory[i], 0, y, textbox.width)
    }
    
    // finally draw textbox viewable portion to screen
    image(tb, textbox.x, textbox.y, textbox.width, textbox.height)
    
    
  }
  
  
  function draw() {
    
    // static ui
    background(0);  
    noFill()
    stroke('white')
    strokeWeight(3)
    rect(5, 5, width-10, height-10)
    line(5, 440, 395, 440)
    
    
    
    // draws main text display
    drawTextDisplay()
    
    // for designing the interface and debugging
    strokeWeight(1)
    fill(255)
    text(`${mouseX}, ${mouseY}`, 320, 25)
    
    
    // input
    text(inputBuffer, 15, 470)
    rect(textWidth(inputBuffer) + 15, 470, 6, 1) // cursor
    
  }
  
  function keyPressed() {  
    if (keyCode === ENTER) {
      handleInput()
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
    const lineHeight = textAscent() + textDescent()
    const lineCount = lineHistory.length + 1
    const textBoundY = lineCount * lineHeight
    const viewTotalRatio = min(1, height / textBoundY)
    
    
    textbox.sb.height = viewTotalRatio * height
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
      textbox.sb.y = min(textbox.height - textbox.sb.height, max(textbox.y, tbMouseY - textbox.sb.offsetY))
    }
  }
  
  function mouseReleased() {
    // scrollbar
    textbox.sb.dragging = false
  }
  
  /////////////////////////////////////////////////////////////|
  ////////////////// Logic section ////////////////////////////|
  /////////////////////////////////////////////////////////////|
  
  function handleInput() {
    // input to line history
    lineHistory.push('>'+inputBuffer)
  
    // commands
    lineHistory.push('... A default response here')
  }