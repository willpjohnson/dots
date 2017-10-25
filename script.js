const randomDotGenerator = () => {
  let idx = Math.floor(Math.random() * 5);
  let color = ['blue', 'green', 'purple', 'red', 'yellow'][idx];
  return color;
}

const populateCellRandom = (cell) => {
  let color = randomDotGenerator();
  let img = $('<img />', {src: `images/dots/${color}.png`, color: color, draggable: false})[0]
  cell.prepend(img);
}

const populateCellFromAbove = (cell, cellAbove) => {
  let img = cellAbove.childNodes[0];
  cell.prepend(img);
}

const populateBoard = () => {
  let cells = $(".cell").toArray();
  cells.forEach( (cell) => {
    populateCellRandom(cell);
  })
}

const rePopulateBoardOnce = () => {
  let cells = $(".cell").toArray();
  cells.reverse().forEach( (cell, idx) => {
    if (cell.childNodes.length === 0) {
      let row = parseInt(cell.getAttribute('row'));
      if (row === 1) {
        populateCellRandom(cell);
      } else {
        let cellAbove = cells[idx+6];
        if (cellAbove && cellAbove.childNodes.length > 0) populateCellFromAbove(cell, cellAbove);
      }
    }
  })
}

const boardIsFull = () => {
  let full = true;
  let cells = $(".cell").toArray();
  cells.forEach( (cell) => {
    if (cell.childNodes.length == 0) full = false;
  })
  return full;
}

const rePopulateBoard = () => {
  let fallingInterval = setInterval( () => {
    rePopulateBoardOnce();
    if (boardIsFull()) clearInterval(fallingInterval);
  }, 200);
}

const findNeighbors = (cell) => {
  let r = parseInt(cell.getAttribute('row'));
  let c = parseInt(cell.getAttribute('column'));
  let neighbors = [];
  [[r, c-1], [r, c+1], [r-1, c], [r+1, c]].forEach( (combo) => {
    if (combo[0] >= 1 && combo[0] <= 6 && combo[1] >= 1 && combo[1] <= 6) neighbors.push(combo);
  })
  return neighbors;
}

const cellArrayIncludes = (cell, array) => {
  let included = false;
  array.forEach( (otherCell) => {
    if (otherCell[0] == cell[0] && otherCell[1] == cell[1]) included = true;
  });
  return included;
}

const cellArrayUniq = (array) => {
  let uniqArray = [];
  array.forEach( (cell) => {
    if (!cellArrayIncludes(cell, uniqArray)) uniqArray.push(cell);
  })
  return uniqArray;
}

const cellGoingBackwards = (cell, array) => {
  let penultimate = array[array.length - 2];
  if (penultimate) {
    return (cell[0] === penultimate[0] && cell[1] === penultimate[1]);
  } else {
    return false;
  }
}

const getAttr = (e) => {
  let color = e.target.getAttribute('color');
  let row = e.target.parentElement.getAttribute('row');
  let col = e.target.parentElement.getAttribute('column');
  return {color, row, col};
}

const toggleHighlight = (coord, adding) => {
  let cell = $(`[row=${coord[0]}][column=${coord[1]}]`)[0];
  if (adding) {
    cell.classList.add('highlighted');
  } else {
    cell.classList.remove('highlighted');
  }
}

const checkGameOver = () => {
  if ($("#blue-left")[0].innerHTML <= 0 && $("#red-left")[0].innerHTML <= 0 && $("#yellow-left")[0].innerHTML <= 0) {
    $(".game-board").empty();
    $(".game-board").addClass("final-winner")
  } else if ($(".moves-left")[0].innerHTML <= 0) {
    $(".game-board").empty();
    $(".game-board").addClass("final-loser")
  }
}

const checkSquare = (coords) => {
  let i = 0;
  let square = false;
  while (i < coords.length) {
    let j = 0;
    while (j < coords.length) {
      if (i !== j) {
        if (coords[i][0] === coords[j][0] && coords[i][1] === coords[j][1]) square = true;
      }
      j += 1;
    }
    i += 1;
  }
  return square;
}

document.addEventListener("DOMContentLoaded", () => {
  populateBoard();

  $(".moves-left")[0].innerHTML = 20;

  let dragging = false;
  let originalColor = null;
  let neighbors = [];
  let selectedCoords = []
  $(".game-board").on("mousedown", (e) => {
    dragging = true;
    originalColor = getAttr(e).color;
    neighbors = findNeighbors(e.target.parentElement);
    toggleHighlight([getAttr(e).row, getAttr(e).col], true);
    selectedCoords.push([getAttr(e).row, getAttr(e).col])
  });
  $(".game-board").on("mouseover", (e) => {
    if (dragging) {
      let cellCoords = [getAttr(e).row, getAttr(e).col]
      if (cellArrayIncludes(cellCoords, neighbors) && originalColor == getAttr(e).color) {
        neighbors = findNeighbors(e.target.parentElement)
        if (cellGoingBackwards(cellCoords, selectedCoords)) {
          toggleHighlight(selectedCoords[selectedCoords.length - 1], false);
          selectedCoords.pop();
        } else {
          toggleHighlight([getAttr(e).row, getAttr(e).col], true);
          selectedCoords.push([getAttr(e).row, getAttr(e).col]);
        }
      }
    }
  });
  $(".game-board").on("mouseup", (e) => {
    if (checkSquare(selectedCoords)) {
      $(".cell").toArray().forEach( (cell) => {
        if (cell.childNodes[0].getAttribute("color") === originalColor) {
          let coord = [cell.getAttribute("row"), cell.getAttribute("column")];
          selectedCoords.push(coord);
        }
      })
    }
    if (selectedCoords.length >= 2) {
      let uniqCoords = cellArrayUniq(selectedCoords);
      uniqCoords.forEach( (coord) => {
        let cell = $(`[row=${coord[0]}][column=${coord[1]}]`);
        cell.empty();
      })
      if (originalColor === "blue" || originalColor === "red" || originalColor === "yellow") {
        let numColor = parseInt($(`#${originalColor}-left`)[0].innerHTML) - uniqCoords.length;
        $(`#${originalColor}-left`)[0].innerHTML = numColor > 0 ? numColor : 0;
      }
      $(".moves-left")[0].innerHTML = parseInt($(".moves-left")[0].innerHTML) - 1;
    }

    selectedCoords.forEach( (coord) => {
      toggleHighlight(coord, false);
    })

    rePopulateBoard(selectedCoords);
    dragging = false;
    originalColor = null;
    neighbors = [];
    selectedCoords = [];

    checkGameOver();
  });
})
