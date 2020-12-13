"use strict";
const canvas = document.querySelector('#canvas-container');
const context = canvas.getContext('2d');
const square = 24; // размер клетки
const rows = 20; // число строк
const columns = 10; // число колонок
let count = 0;
let gameStart; // старт игры
let gameOver = false; // конец игры, неактив на старте

function createGrid(context) { // сетка в canvas
    let cellX = canvas.getAttribute('width'); // ширина холта из html
    let cellY = canvas.getAttribute('height'); // высота холста из html
    for (let x = 0; x <= cellX; x += square) { // вертикальные линии
        context.moveTo(x, 0);
        context.lineTo(x, cellY);
    }
    for (let y = 0; y <= cellY; y += square) { // горизонтальные линии
        context.moveTo(0, y);
        context.lineTo(cellX, y);
    }
    context.strokeStyle = "#646e24"; // цвет сетки
    context.stroke();
}

function createPlayfield() { // игровое поле 10*20
    let playfield = [];
    for (let row = 0; row < rows; row++) {
        playfield[row] = [];
        for (let col = 0; col < columns; col++) {
            playfield[row][col] = 0;
        }
    }
    return playfield;
}
let playfield = createPlayfield();

let buttonRestart = document.querySelector('#restart');
buttonRestart.addEventListener('click', restart, true);

function restart() {
    score = 0;
    lines = 0;
    level = 0;
    playfield = createPlayfield();
    activeFigure = createFigure();
    nextFigure = createFigure();
}

const FIGURE = {
    'I': [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
    ],
    'J': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'L': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'O': [
        [1, 1],
        [1, 1]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ]
};

function randomFigure() { // выбираем рандомную фигуру
    const FIGURE = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    let indexFIGURE = Math.floor(Math.random() * FIGURE.length);
    return FIGURE[indexFIGURE];
}

function randomColor() { // выбираем рандомный цвет
    const COLORS = ['#d20018', '#aa8243', '#2b1131', '#653f4e', '#be5c13', '#9adbb8', '#ff3314', '#003f2d', '#018667', '#a4af97', '#f7f9f2', '#48596c', '#e34333', '#fdab00', '#2b1718'];
    let randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    return randomColor;
}

function createFigure() { // создаем фигуру
    return {
        name: randomFigure(), // имя фигуры
        matrix: FIGURE[randomFigure()], // матрица по имени
        color: randomColor(), // цвет фигуры
        row: -1, // старт фигуры
        col: Math.floor((columns - FIGURE[randomFigure()][0].length) / 2) // старт фигуры
    };
}

let activeFigure = createFigure();
let nextFigure = createFigure();

function rotateFigure(matrix) { // поворот матрицы
    const n = matrix.length - 1;
    for (let row = 0; row < n; row++) {
        for (let col = row; col < n - row; col++) {
            const transposed = matrix[row][col];
            matrix[row][col] = matrix[n - col][row];
            matrix[n - col][row] = matrix[n - row][n - col];
            matrix[n - row][n - col] = matrix[col][n - row];
            matrix[col][n - row] = transposed;
        }
    }
    return matrix;
}

function outOfBounds(matrix, cellRow, cellCol) { // выход за границы поля
    for (let row = 0; row < matrix.length; row++) { // отслеживаем фигуру на поле
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] &&
                (((playfield[cellRow + row] === undefined) || // выход за границы поля
                        (playfield[cellRow + row][cellCol + col] === undefined)) ||
                    playfield[cellRow + row][cellCol + col])) { // пересечение с другой фигурой
                return false;
            }
        }
    }
    return true;
}

function placeFigure() { // фиксация фигуры
    for (let row = 0; row < activeFigure.matrix.length; row++) { // следим за фигурой на поле
        for (let col = 0; col < activeFigure.matrix[row].length; col++) {
            if (activeFigure.matrix[row][col]) { // координаты фигуры на поле
                if (activeFigure.row + row < 1) { // если фигура вышла за границы поля
                    return showGameOver(); // то игра закончилась
                } else {
                    playfield[activeFigure.row + row][activeFigure.col + col] = activeFigure; // запись фигуры в поле
                    // let audioPlace = new Audio('audio/notification.mp3');
                    audioPlace.play();
                }
            }
        }
    }
    clearLines(); // проверка на удаление ряда и начисление очков
    upDateFigure(); // обновляем активную и следующую фигуру
}

function upDateFigure() {
    activeFigure = nextFigure;
    nextFigure = createFigure();
    showNextFigure();
}

function showNextFigure() { // показ следующей фигуры
    const canvas2 = document.querySelector('#canvas-container2');
    const context2 = canvas2.getContext('2d');
    context2.clearRect(0, 0, canvas2.width, canvas2.height); // очищаем холст
    context2.fillStyle = nextFigure.color; // цвет следующей фигуры
    for (let row = 0; row < nextFigure.matrix.length; row++) {
        for (let col = 0; col < nextFigure.matrix[row].length; col++) {
            if (nextFigure.matrix[row][col]) {
                context2.fillRect((col) * square, (row) * square, square - 1, square - 1);
            }
        }
    }
}

let score = 0; // начисленные очки
let scoreGame = document.querySelector('#score');
scoreGame.textContent = score;

let lines = 0; // удаленные ряды
let linesGame = document.querySelector('#lines');
linesGame.textContent = lines;

let level = 0; // уровень
let levelGame = document.querySelector('#level');
levelGame.textContent = level;

let speed = 20; // стартовая скорость

function clearLines() { // удаление ряда и начисление очков
    let fillRows = []; // заполненные ряды
    for (let row = rows - 1; row >= 0; row--) { // идем снизу вверх
        let numberOfBlocks = 0; // заполненные клетки
        for (let col = 0; col < columns; col++) { // идем по ряду
            if (playfield[row][col]) {
                numberOfBlocks += 1; // считаем заполненные клетки
            }
        }
        if (numberOfBlocks === 0) { // если заполненных клеток нет, остановочка
            break;
        } else if (numberOfBlocks < columns) { // если ряд не полностью заполнен, продолжаем
            continue;
        } else if (numberOfBlocks === columns) { // если число заполненных клеток совпадает с числом колонок
            fillRows.unshift(row); // добавляем индекс ряда в массив в начало
        }
    }
    for (let index of fillRows) { // обход элементов массива по значению в соответствующем порядке, сверху вниз
        playfield.splice(index, 1); // удаляем 1 заполненный ряд сверху
        playfield.unshift(new Array(columns).fill(0)); // добавляем 1 ряд сверху, заполненный 0
        score += 10; // начисление очков за собранный ряд
        lines += 1; // счетчик удаленных рядом
        // let audioClearLines = new Audio('audio/stage-clear.mp3');
        audioClearLines.play();
        switch (score) { // уровень и скорость игры в зависимости от счета
            case 20:
                level = 1;
                speed = 15;
                break;
            case 40:
                level = 2;
                speed = 10;
                break;
            case 60:
                level = 3;
                speed = 5;
                break;
            case 80:
                level = 4;
                speed = 3;
                break;
            case 120:
                level = 5;
                speed = 2;
                break;
        }
        scoreGame.innerHTML = score; // вывод очков на экран
        linesGame.innerHTML = lines; // вывод количество заполненных рядов на экран
        levelGame.innerHTML = level; // вывод уровень игры на экран
    }
}

function instruction() {
    context.fillStyle = '#646e24'; // заливка фона
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 80); // рисуем прямоугольник
    context.fillStyle = 'black'; // цвет текста
    context.font = '36px Caveat Brush';
    context.textAlign = 'center';
    context.textBaseline = 'hanging';
}

function showGameStart() {
    instruction();
    context.fillText('GAME START', canvas.width / 2, canvas.height / 2 - 20);
    context.font = '18px Caveat Brush cursive';
    context.fillText('Press ENTER to Start', canvas.width / 2, canvas.height / 2 + 20);
}
showGameStart();

let buttonMusic = document.querySelector('#stopmusic');
buttonMusic.addEventListener('click', stopMusic, true);

let audioStart = new Audio('audio/start-tetrisa.mp3');
let audioPlace = new Audio('audio/notification.mp3');
let audioClearLines = new Audio('audio/stage-clear.mp3');

function stopMusic() {
    audioStart.pause();
    let imgStop = document.querySelector('#stopmusic svg');
    imgStop.innerHTML = '<path d="M18.084,11.639c0.168,0.169,0.168,0.442,0,0.611c-0.084,0.084-0.195,0.127-0.306,0.127c-0.111,0-0.221-0.043-0.306-0.127l-1.639-1.639l-1.639,1.639c-0.084,0.084-0.195,0.127-0.306,0.127c-0.111,0-0.222-0.043-0.307-0.127c-0.168-0.169-0.168-0.442,0-0.611L15.223,10l-1.64-1.639c-0.168-0.168-0.168-0.442,0-0.61c0.17-0.169,0.442-0.169,0.612,0l1.639,1.639l1.639-1.639c0.169-0.169,0.442-0.169,0.611,0c0.168,0.168,0.168,0.442,0,0.61L16.445,10L18.084,11.639z M12.161,2.654v14.691c0,0.175-0.105,0.333-0.267,0.4c-0.054,0.021-0.109,0.032-0.166,0.032c-0.111,0-0.223-0.043-0.305-0.127l-3.979-3.979H2.222c-0.237,0-0.432-0.194-0.432-0.432V6.759c0-0.237,0.195-0.432,0.432-0.432h5.222l3.979-3.978c0.123-0.125,0.309-0.163,0.471-0.095C12.056,2.322,12.161,2.479,12.161,2.654 M7.192,7.192H2.654v5.617h4.538V7.192z M11.296,3.698l-3.24,3.241v6.123l3.24,3.24V3.698z"></path>';
}

let buttonPlayGame = document.querySelector("#play");
let animation = buttonPlayGame.addEventListener("click", gameStartPlay, true);

function gameStartPlay() {
    loopGame();
    audioStart.play();
}

let buttonPauseGame = document.querySelector("#pause");
buttonPauseGame.addEventListener("click", showGamePause, true);

function showGamePause() {
    cancelAnimationFrame(gameStart); // выкл анимацию
    audioStart.pause();
    instruction();
    context.fillText('PAUSE', canvas.width / 2, canvas.height / 2 - 20);
    context.font = '18px Caveat Brush';
    context.fillText('Press ENTER to Continue ', canvas.width / 2, canvas.height / 2 + 20);
}

let buttonStopGame = document.querySelector("#gameover");
buttonStopGame.addEventListener("click", showGameOver, true);

function showGameOver() {
    cancelAnimationFrame(gameStart); // выкл анимацию
    gameOver = true;
    instruction();
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    let audioGameOver = document.querySelector('#gameover audio');
    audioGameOver.play();
}


function loopGame() {
    gameStart = requestAnimationFrame(loopGame); // начинаем анимацию
    context.clearRect(0, 0, canvas.width, canvas.height); // очищаем холст
    createGrid(context); // рисуем сетку
    for (let row = 0; row < rows; row++) { // игровое поле с фигурами
        for (let col = 0; col < columns; col++) {
            if (playfield[row][col]) {
                let figure = playfield[row][col];
                context.fillStyle = figure.color;
                context.fillRect(col * square, row * square, square - 1, square - 1);
            }
        }
    }
    if (activeFigure) { // активная фигура
        if (++count > speed) {
            activeFigure.row++;
            count = 0;
            if (!outOfBounds(activeFigure.matrix, activeFigure.row, activeFigure.col)) {
                activeFigure.row--;
                placeFigure();
            }
        }
        context.fillStyle = activeFigure.color; // цвет фигуры
        for (let row = 0; row < activeFigure.matrix.length; row++) {
            for (let col = 0; col < activeFigure.matrix[row].length; col++) {
                if (activeFigure.matrix[row][col]) {
                    // эффект в клетке
                    context.fillRect((activeFigure.col + col) * square, (activeFigure.row + row) * square, square - 1, square - 1);
                }
            }
        }
    }
}

document.addEventListener('keydown', function (event) {
    switch (event.code) {
        case 'ArrowLeft': // LEFT ARROW
            const colLeft = activeFigure.col - 1;
            if (outOfBounds(activeFigure.matrix, activeFigure.row, colLeft)) {
                activeFigure.col = colLeft;
            }
            break;
        case 'ArrowUp': // UP ARROW
            const matrix = rotateFigure(activeFigure.matrix);
            if (outOfBounds(matrix, activeFigure.row, activeFigure.col)) {
                activeFigure.matrix = matrix;
            }
            break;
        case 'ArrowRight': // RIGHT ARROW
            const colRight = activeFigure.col + 1;
            if (outOfBounds(activeFigure.matrix, activeFigure.row, colRight)) {
                activeFigure.col = colRight;
            }
            break;
        case 'ArrowDown': // DOWN ARROW
            const row = activeFigure.row + 1;
            if (!outOfBounds(activeFigure.matrix, row, activeFigure.col)) {
                activeFigure.row = row - 1;
                placeFigure();
                return;
            }
            activeFigure.row = row;
            break;
    }
});