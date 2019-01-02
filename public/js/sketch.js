var grid;
var buttons;


function setup () {
  var canvas = createCanvas(800, 800); //400, 400
  canvas.parent('sketch-holder');
  grid = new Grid(40); //20
  grid.randomize();

  buttons = new Button(0, 400);
}

function draw () {
  background(250);

  grid.updateNeighborCounts();
  grid.updatePopulation();
  grid.draw();

  buttons.draw();
}

function mousePressed () {
  buttons.refresh();
  buttons.pause_play();
  buttons.fastForward();
  buttons.rewind();
}



class Grid {
  constructor (cellSize) {
    this.cellSize = cellSize;
    this.numberOfColumns = width / this.cellSize;
    this.numberOfRows = height / this.cellSize;
    this.x = this.numberOfRows;
    this.y = this.numberOfColumns;

    this.cells = new Array(this.x);
    for (let i = 0; i < this.x; i++) {
      this.cells[i] = new Array(this.y);
    }

    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
          this.cells[column][row] = new Cell(column, row, cellSize);
        }
      }

    this.currentGeneration = 0;

    this.play = true;
    this.fastForward = false;
    this.rewind = false;
    }

  randomize () {
    this.currentGeneration = 0;
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
      this.cells[column][row].setIsAlive(floor(random(2)));
      this.cells[column][row].colorR = 10 * column;
      this.cells[column][row].colorG = 10 * row;
      this.cells[column][row].colorB = column + row;
      this.cells[column][row].generation_isAlive = [];
      this.cells[column][row].generation_isAlive.push(this.cells[column][row].isAlive);
        }
      }
    }

 isValidPosition (column, row) {
  if(column < this.numberOfColumns && column >= 0 && row < this.numberOfRows && row >=0) {
      return true;
  } else {
    return false;
      }
  }

  getNeighbors (currentCell){
  var neighbors = [];

  for (var xOffset = -1; xOffset <= 1; xOffset++) {
  for (var yOffset = -1; yOffset <= 1; yOffset++) {
    var neighborColumn = currentCell.column + xOffset;
    var neighborRow = currentCell.row + yOffset;
  if(this.isValidPosition(neighborColumn, neighborRow) && xOffset * yOffset + xOffset + yOffset !== 0) {
    neighbors.push(this.cells[neighborColumn][neighborRow]);
      }
    }
  }
  return neighbors;
}

  updateNeighborCounts () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        this.cells[column][row].liveNeighborCount = 0;
        var neighbors = this.getNeighbors(this.cells[column][row]);
    for(var i = 0; i < neighbors.length; i++) {
     if (neighbors[i].isAlive){
      this.cells[column][row].liveNeighborCount++;
        }
      }
    }
  }
}


 cellColor () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
        if(this.cells[column][row].birth === true) {
         var neighbors = this.getNeighbors(this.cells[column][row]);
         for(var i = 0; i < neighbors.length; i++) {
           if(neighbors[i].isAlive === true){
          this.cells[column][row].colorR = this.cells[column][row].colorR + neighbors[i].colorR;
          this.cells[column][row].colorG = this.cells[column][row].colorG + neighbors[i].colorG;
          this.cells[column][row].colorB = this.cells[column][row].colorB + neighbors[i].colorB;
           }
        }
          this.cells[column][row].colorR = this.cells[column][row].colorR / 3.6;
          this.cells[column][row].colorG = this.cells[column][row].colorG / 3.6;
          this.cells[column][row].colorB = this.cells[column][row].colorB / 3.6;

         //dividing by 3 wasn't giving me the colors I wanted. (3.6)

          this.cells[column][row].birth = false;
        }
      }
  }
}

  playRewind () {
  this.currentGeneration = 0;
  for (var column = 0; column < this.numberOfColumns; column ++) {
  for (var row = 0; row < this.numberOfRows; row++) {
      this.cells[column][row].isAlive = this.cells[column][row].generation_isAlive[0];
      this.cells[column][row].colorR = 10 * column;
      this.cells[column][row].colorG = 10 * row;
      this.cells[column][row].colorB = column + row;
    }
  }
  }

  updatePopulation () {
  if (this.rewind === true && this.currentGeneration >= 1) {
       this.playRewind();
       this.rewind = false;
} else if(this.fastForward === true){
    this.currentGeneration = this.currentGeneration + 1;
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
      this.cells[column][row].liveOrDie();
      this.cellColor();
    }
   }
  } else if(this.play === true && frameCount % 10 === 0) {
      this.currentGeneration = this.currentGeneration + 1;
    for (this.column = 0; this.column < this.numberOfColumns; this.column ++) {
      for (this.row = 0; this.row < this.numberOfRows; this.row++) {
      this.cells[this.column][this.row].liveOrDie();
      this.cellColor();
    }
  }
  }
}

  draw () {
    for (var column = 0; column < this.numberOfColumns; column ++) {
      for (var row = 0; row < this.numberOfRows; row++) {
       this.cells[column][row].draw();
      }
    }
  }
}

class Cell {
  constructor (column, row, cellSize) {

    this.column = column;
    this.row = row;
    this.cellSize = cellSize;
    this.isAlive = false;
    this.liveNeighborCount = 0;
    this.colorR = 10 * this.column;
    this.colorG = 10 * this.row;
    this.colorB = this.column + this.row;
    this.birth = false;


    this.generation_isAlive = [];

    //Initially rewind was meant to be an array that stored this.isAlive per cell each generation, but I couldn't figure out how to play them back with a for loop, despite managing to store them. I tried a number of things...

  }

  setIsAlive (value) {
    if (value === 1) {
      this.isAlive = true;
    } else {
      this.isAlive = false;
    }
  }


  liveOrDie () {
    if (this.isAlive === true && this.liveNeighborCount < 2 || this.isAlive === true && this.liveNeighborCount > 3) {
      this.isAlive = false;
    } else if (this.isAlive === false && this.liveNeighborCount === 3) {
      this.isAlive = true;
      this.birth = true;
      }
    }

  draw () {
    if(this.isAlive === true) {
    fill(color(this.colorR, this.colorG, this.colorB));
    } else {
      fill(240);
    }
    noStroke();
    rect(this.column * this.cellSize + 1, this.row * this.cellSize + 1, this.cellSize - 1, this.cellSize - 1);
  }
}



class Button {
  constructor (x,y){
    this.x = x;
    this.y = y;
  }

  refresh (){
 if(11.5 + this.x  < mouseX && mouseX < 28.5 + this.x && mouseY > 359  + this.y && mouseY < 376  + this.y )
    grid.randomize();
}

pause_play(){
 if(51  + this.x < mouseX && mouseX < 64  + this.x && mouseY > 359  + this.y && mouseY < 373  + this.y) {
   if(grid.play === true) {
      grid.play = false;
      grid.fastForward = false;
  } else {
  grid.play = true;
   }
  }
}

fastForward (){
  if((68  + this.x) < mouseX && mouseX < (82 + this.x) && mouseY > (358 + this.y) && mouseY < (374  + this.y) && grid.fastForward === false) {
  grid.fastForward = true;
  grid.play = true;
  } else if (grid.fastForward === true && (68  + this.x) < mouseX && mouseX < (82  + this.x) && mouseY > (358  + this.y) && mouseY < (374  + this.y)){
    grid.fastForward = false;
  }
}
 rewind () {
   if((32  + this.x) < mouseX && mouseX < (45 + this.x) && mouseY > (358 + this.y) && mouseY < (374  + this.y) && grid.rewind === false){
     grid.rewind = true;
   }
   }


  draw(){
    push();
    translate(this.x, this.y);

  if(dist(mouseX, mouseY, 45 + this.x, 362 + this.y) > 65) {
  stroke(0, 0, 0, 20);
  } else {
  stroke(0, 0, 0, 20 + 255*norm((dist(mouseX, mouseY, 45 + this.x, 362 + this.y)), 65, 0));
  } //refresh circle_strokeOpacity_distance to mouse


  strokeWeight(3);
  noFill();
  arc(19, 367.3, 13, 13, QUARTER_PI + QUARTER_PI, 2*PI);//refresh circle

  strokeWeight(1);
  line(32, 360, 32, 375); //rewind line

  noStroke();
  if(dist(mouseX, mouseY, 45 + this.x, 362 + this.y) > 65) {
  fill(0, 0, 0, 20);
  } else {
  fill(0, 0, 0, 20 + 255*norm((dist(mouseX, mouseY, 45  + this.x, 362 + this.y)), 65, 0));
} //buttons_fillOpacity_distance to mouse

  push();
  translate(-39, 302);
  rotate(radians(10));
  triangle(75, 61, 70, 55, 80, 55);
  pop(); //refresh_triangle

  push();
  translate(20, 0);
  noStroke();
  if(grid.play === false){
  triangle(30, 360, 30, 375, 45, 367.5); // play_triangle
  } else {
  rect(30, 360, 4, 15);
  rect(40, 360, 4, 15); // pause_rects
    }

  triangle(48, 360, 48, 375, 55, 367.5);
  triangle(55, 360, 55, 375, 62, 367.5); //fastfoward

  triangle(26, 360, 26, 375, 19, 367.5);
  triangle(19, 360, 19, 375, 12, 367.5);//rewind to beginning
  pop();

  text("Generation: " + grid.currentGeneration, 10, 390); //300, 390
  pop();
}
}
