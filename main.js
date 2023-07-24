const squaresElem = document.querySelectorAll('.square');
const startButtonElem = document.getElementById('start-button');
const resetButtonElem = document.getElementById('restart-button');
const levelSelected = document.querySelector('input[name="levels"]:checked');
const optionsLevelInput = document.querySelectorAll('input[type="radio"]');
const resultsContainerElem = document.querySelector('.container-results');
const textSpan = document.querySelector('.text-results');

///CONSTANTS
const circle = 'O';
const cross = 'X';
const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [2, 4, 6],
  [2, 5, 8],
  [0, 3, 6],
  [1, 4, 7],
];

///////////STATES
let turn = cross;
let winner = null;
let board = Array(9).fill(null);
let level = levelSelected.value;

///////////FUNCTIONS
const startGame = () => {
  resetGame();
};
const resetBannerResults = () => {
  textSpan.innerText = `Que gane el mejor`;
  resultsContainerElem.querySelector('p').classList.remove('grow');
};
const resetGame = () => {
  turn = cross;
  board.fill(null);
  level = document.querySelector('input[name="levels"]:checked').value;
  resetBannerResults();
  renderBoard();
};
const endGame = () => {
  showResults();
  turn = false;
};
const showResults = () => {
  if (winner) textSpan.innerText = `Ganó ${turn}`;
  else textSpan.innerText = `${circle} -Empate- ${cross}`;
  resultsContainerElem.querySelector('p').classList.add('grow');
};
////////////LOGIC
const renderBoard = () => {
  board.forEach((square, index) => {
    const moveClass = square === cross ? 'cross' : 'circle';
    squaresElem[index].classList.remove('cross', 'circle');
    squaresElem[index].classList.add(moveClass);
    squaresElem[index].innerText = square;
  });
};
const checkWin = () => {
  const isAWinner = winningCombos.some((combo) => {
    const [a, b, c] = combo;
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
  return isAWinner;
};
const nextTurn = () => {
  const availableMove = getAvailableMoves().length > 0;
  const isWinner = checkWin();
  if (isWinner || !availableMove) {
    winner = !availableMove && !isWinner ? false : turn;
    return endGame();
  }
  if (turn === cross) {
    turn = circle;
    computerMove();
  } else turn = cross;
};
const winningMovesPlayer = (playerMoves) => {
  const nextPosibleMovements = winningCombos.reduce((acc, currentWinCombo) => {
    const movesFilter = playerMoves.filter(
      (m) =>
        currentWinCombo.includes(m) &&
        currentWinCombo.some((squareIndex) => board[squareIndex] === null)
    );
    return movesFilter.length === 2 ? [...acc, ...currentWinCombo] : acc;
  }, []);
  return nextPosibleMovements;
};
const getCurrentPlayerMove = (turn) =>
  board
    .map((square, i) => (square == turn ? i : false))
    .filter((index) => index !== false);
const getAvailableMoves = () =>
  board
    .map((square, i) => (!square ? i : false))
    .filter((index) => index !== false);
const getRandomMove = (availableMoves = getAvailableMoves()) => {
  let randomIndexComputer = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndexComputer];
};

//////////PLAYER MOVES
const computerMove = () => {
  if (turn !== circle) return;
  const index = nextComputerMove();
  board[index] = circle;
  setTimeout(() => {
    renderBoard();
    nextTurn();
  }, 300);
};
const playerMove = (e) => {
  if (turn !== cross) return;
  const index = Number(e.target.id);
  if (!board[index]) {
    board[index] = cross;
    renderBoard();
    nextTurn();
  }
};

//////////LEVELS
const nextComputerMove = () => {
  switch (level) {
    case 'easy':
      return levelOneMove();
    case 'medium':
      return levelTwoMove();
    case 'heavy':
      return levelThreeMove();
  }
};
//Nivel 1: jugadas random
const levelOneMove = () => {
  const availableMoves = getAvailableMoves();
  const isFirstMove = availableMoves.length >= 8;
  const filteredMoves = isFirstMove
    ? availableMoves.filter((move) => move !== 4)
    : availableMoves;
  return getRandomMove(filteredMoves);
};
//Nivel 2: Bloquea jugadas ganadoras del oponente, si no hay posibilidad de lograrlo, juega random
const levelTwoMove = () => {
  const availableMoves = getAvailableMoves();
  const currentUserMoves = getCurrentPlayerMove(cross);
  const winnerUserMoves = winningMovesPlayer(currentUserMoves);
  if (!winnerUserMoves.length) {
    return getRandomMove();
  } else {
    const lastMove = winnerUserMoves.find((winnerMove) =>
      availableMoves.includes(winnerMove)
    );
    return lastMove;
  }
};
//NIvel 3: Bloquea jugadas ganadoras, Si hay posibilidad juega a ganar. Empieza con mas chances de victoria contra el oponente
const levelThreeMove = () => {
  const availableMoves = getAvailableMoves();
  const currentUserMoves = getCurrentPlayerMove(cross);
  const currentComputerMoves = getCurrentPlayerMove(circle);
  const winnerUserMoves = winningMovesPlayer(currentUserMoves);
  const winnerComputerMoves = winningMovesPlayer(currentComputerMoves);
  if (winnerComputerMoves.length || !winnerUserMoves.length) {
    const lastMove =
      availableMoves.find((move) => move === 4) ||
      winnerComputerMoves.find((winnerMove) =>
        availableMoves.includes(winnerMove)
      );
    return lastMove ? lastMove : getRandomMove();
  } else {
    const lastMove =
      availableMoves.find((move) => move === 4) ||
      winnerUserMoves.find((winnerMove) => availableMoves.includes(winnerMove));
    return lastMove;
  }
};

////ADD EVENT LISTENER////
startButtonElem.addEventListener('click', startGame);
resetButtonElem.addEventListener('click', resetGame);
squaresElem.forEach((square) => square.addEventListener('click', playerMove));
optionsLevelInput.forEach((option) =>
  option.addEventListener('change', (e) => {
    resetGame();
    level = e.target.value;
  })
);
