let playerSwitch = true; // if true 'X' starts
let currentGame;

const startButton = document.querySelector('#start');
startButton.addEventListener('click', startGame);
const resetButton = document.querySelector('#reset');
resetButton.addEventListener('click', resetGame);
const Gameboard = (function(){
    let board = [['','',''], ['','',''], ['','','']];
    const pushElement = (row, column, mark) => {
        board[row][column] = mark;
        playerSwitch = !playerSwitch;
        let winner = checkForWin();
        if(winner) return winner;
    }
    const checkForWin = () => {
        for (let i = 0; i < 3; i++) {
            if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== '') {
                return [[i, 0], [i, 2]];
            }
        }
        for (let i = 0; i < 3; i++) {
            if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== '') {
                return [[0, i], [2, i]];
            }
        }
        if ((board[0][0] === board[1][1] && board[1][1] === board[2][2])){
            if (board[1][1] !== '') {
                return [[0, 0], [2, 2]];
            }
        }
        if(board[0][2] === board[1][1] && board[1][1] === board[2][0]){
            if (board[1][1] !== '') {
                return [[0, 2], [2, 0]];
            }
        }
        return null;
    }
    const checkCell = (row, col) => {
        return board[row][col] === '' ? false : true;
    }
    const clearBoard = () => {
        board = [['','',''], ['','',''], ['','','']];
    }
    const getMark = (row, col) =>  {
        return board[row][col];
    }
    return {pushElement, checkCell, clearBoard, getMark};
})();

function createPlayer(name, mark){
    const displayName = name.charAt(0).toUpperCase() + name.toLowerCase().slice(1);
    return {displayName, mark}
}

function createGame(player1Name, player2Name){
    const player1 = createPlayer(player1Name, 'X');
    const player2 = createPlayer(player2Name, 'O');
    const placeMarkOnBoard = (row, column) => {
        let winner = playerSwitch ? Gameboard.pushElement(row, column, player1.mark) : Gameboard.pushElement(row, column, player2.mark);
        if(winner){
            let winnerName = Gameboard.getMark(winner[0][0], winner[0][1]) === player1.mark ? player1.displayName : player2.displayName;
            let winText = `${winnerName} is the winner!`;
            DisplayManipulation.displayWinner(winText);
            DisplayManipulation.blockBoard();
            DisplayManipulation.drawLine(getIndexOfCell(winner[0][0], winner[0][1]), getIndexOfCell(winner[1][0],winner[1][1]));
        }
    };
    const currentPlayer = () => {
        return playerSwitch ? player1 : player2;
    }
    return {player1, player2, placeMarkOnBoard, currentPlayer};
}

const DisplayManipulation = (function(doc){
    const drawBoard = () => {
        const board = doc.querySelector('.board');
        for (let index = 0; index < 9; index++) {
            const element = doc.createElement('div');
            element.className = 'cell clickable';
            board.appendChild(element);
            element.setAttribute('id', `cell-${index}`);
            element.addEventListener('click', () => {
                if (element.classList.contains('clickable')) {
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    placeMark(row, col);
                }
            });
        }
    }
    const placeMark = (row, col) => {
        const cellId = `cell-${row * 3 + col}`;
        const cell = doc.getElementById(cellId);
        const mark = doc.createElement('span');
        mark.className = 'mark';
        mark.textContent = currentGame.currentPlayer().mark;
        if(Gameboard.checkCell(row, col) !== true){
            cell.appendChild(mark);
            currentGame.placeMarkOnBoard(row,col);
        }
    }

    const blockBoard = () => {
        const board = doc.querySelector('.board');
        board.classList.add('blocked');
        const cells = doc.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('clickable');
        });
        startButton.disabled = true;
    }
    const displayWinner = (text) => {
        const winnerDisplay = doc.querySelector('.winner-display');
        winnerDisplay.textContent = text;
    }
    const clearBoard = () => {
        const board = doc.querySelector('.board');
        while(board.firstChild){
            board.removeChild(board.firstChild);
        }
        board.classList.remove('blocked');
        startButton.disabled = false;
        displayWinner('');
    }
    const drawLine = (id1, id2) => {
        const cell1 = document.getElementById(`cell-${id1}`);
        const cell2 = document.getElementById(`cell-${id2}`);
        const line = document.createElement('div');

        // Find the center points based on the elements' left, top, width, and height
        const p1 = { x: cell1.offsetLeft + cell1.offsetWidth / 2, y: cell1.offsetTop + cell1.offsetHeight / 2 };
        const p2 = { x: cell2.offsetLeft + cell2.offsetWidth / 2, y: cell2.offsetTop + cell2.offsetHeight / 2 };

        // Get distance between the centers for the length of the line
        const a = p1.x - p2.x;
        const b = p1.y - p2.y;
        const length = Math.sqrt(a * a + b * b) + 50; // Extend length by 30px

        // Get angle between centers
        const angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

        // Find the midpoint between the two centers
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        // Set line distance and position
        line.style.width = length + 'px';
        line.style.left = midX - length / 2 + 'px'; // Adjusted left position
        line.style.top = midY - 1 + 'px'; // Adjusted top position

        // Rotate line to match angle between centers
        line.style.transform = "rotate(" + angleDeg + "deg)";
        line.style.position = 'absolute';
        line.style.height = '10px';
        line.style.backgroundColor = 'red';

        // Append the line to the board
        const board = document.querySelector('.board');
        board.appendChild(line);

    }
    return { drawBoard, blockBoard, displayWinner, clearBoard, drawLine }
})(document);

function startGame(){
    let player1Name = prompt('Enter name for the first player:');
    let player2Name = prompt('Enter name for the second player:');
    currentGame = createGame(player1Name, player2Name);
    DisplayManipulation.drawBoard();
    startButton.disabled = true;
}
function resetGame(){
    Gameboard.clearBoard();
    DisplayManipulation.clearBoard();
    playerSwitch = true;
}

function getIndexOfCell(row, column) {
    return row * 3 + column;
}