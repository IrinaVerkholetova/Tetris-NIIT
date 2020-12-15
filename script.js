"use strict";
const canvas = document.querySelector('#canvas-container');
const context = canvas.getContext('2d');
const square = 24; // размер клетки поля
const rows = 20; // число строк поля
const columns = 10; // число колонок поля
let counterFPS = 0; // счетчик кадров/сек — FPS(Frames Per Second)
let speed = 20; // стартовая скорость 20 кадров/сек
let gameStart = null; // старт игры
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

function createPlayfield() { // игровое поле 10*20, заполненное нулями
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


function rotateFigure(matrix) { // создаёт новый массив с результатом вызова функции для каждого элемента массива
    const N = matrix.length - 1; // т.к. номер последний ряд(столбец) квадратной матрицы на 1 меньше
    let rotateFigire = matrix.map((row, j) => row.map((value, i) => matrix[N - i][j]));
    return rotateFigire; // на входе матрица, и на выходе новая матрица
}

function outOfBounds(matrix, cellRow, cellCol) { // выход за границы поля
    let canShift = true;
    for (let row = 0; row < matrix.length; row++) { // отслеживаем фигуру
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] &&
                (((playfield[cellRow + row] === undefined) || // выход за границы
                        (playfield[cellRow + row][cellCol + col] === undefined)) || // выход влево, вправо
                    playfield[cellRow + row][cellCol + col]) // пересечение с другой фигурой
            ) {
                canShift = false; // дальше двигаться нельзя
            }
        }
    }
    return canShift; // всё хорошо, двигаемся
}

function placeFigure() { // фиксация фигуры
    for (let row = 0; row < activeFigure.matrix.length; row++) { // следим за фигурой на поле
        for (let col = 0; col < activeFigure.matrix[row].length; col++) {
            if (activeFigure.matrix[row][col]) { // координаты фигуры на поле
                if (activeFigure.row + row < 1) { // если фигура вышла за границы поля
                    return showGameOver(); // то игра закончилась
                } else {
                    playfield[activeFigure.row + row][activeFigure.col + col] = activeFigure; // запись фигуры в поле
                    audioPlace.play(); // звук упавшей фигуры
                }
            }
        }
    }
    clearLines(); // проверка на удаление ряда и начисление очков
    upDateFigure(); // обновляем активную и следующую фигуру
}

function upDateFigure() { // обновляем активную и следующую фигуру
    activeFigure = nextFigure; // в актив помещаем следующую
    nextFigure = createFigure(); // создаем следующую
    showNextFigure(); // показываем следующую фигуру в canvas2
}

function showNextFigure() { // показ следующей фигуры в canvas2
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

let level = 0; // уровень игры
let levelGame = document.querySelector('#level');
levelGame.textContent = level;

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
            fillRows.unshift(row); // добавляем индекс ряда в fillRows в начало
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

const audioStart = new Audio('audio/start-tetrisa.mp3');
const audioPlace = new Audio('audio/notification.mp3');
const audioClearLines = new Audio('audio/stage-clear.mp3');

let buttonMusic = document.querySelector('#stopmusic');
buttonMusic.addEventListener('click', stopMusic, true);

function stopMusic() {
    audioStart.pause();
    let imgMusic = document.querySelector('#stopmusic svg');
    imgMusic.innerHTML = '<path d="M18.084,11.639c0.168,0.169,0.168,0.442,0,0.611c-0.084,0.084-0.195,0.127-0.306,0.127c-0.111,0-0.221-0.043-0.306-0.127l-1.639-1.639l-1.639,1.639c-0.084,0.084-0.195,0.127-0.306,0.127c-0.111,0-0.222-0.043-0.307-0.127c-0.168-0.169-0.168-0.442,0-0.611L15.223,10l-1.64-1.639c-0.168-0.168-0.168-0.442,0-0.61c0.17-0.169,0.442-0.169,0.612,0l1.639,1.639l1.639-1.639c0.169-0.169,0.442-0.169,0.611,0c0.168,0.168,0.168,0.442,0,0.61L16.445,10L18.084,11.639z M12.161,2.654v14.691c0,0.175-0.105,0.333-0.267,0.4c-0.054,0.021-0.109,0.032-0.166,0.032c-0.111,0-0.223-0.043-0.305-0.127l-3.979-3.979H2.222c-0.237,0-0.432-0.194-0.432-0.432V6.759c0-0.237,0.195-0.432,0.432-0.432h5.222l3.979-3.978c0.123-0.125,0.309-0.163,0.471-0.095C12.056,2.322,12.161,2.479,12.161,2.654 M7.192,7.192H2.654v5.617h4.538V7.192z M11.296,3.698l-3.24,3.241v6.123l3.24,3.24V3.698z"></path>';
}

let buttonPlayGame = document.querySelector("#play");
let animation = buttonPlayGame.addEventListener("click", gameStartPlay, true);

function gameStartPlay() {
    loopGame();
    audioStart.play();
    let imgMusic = document.querySelector('#stopmusic svg');
    imgMusic.innerHTML = '<path d="M17.969,10c0,1.707-0.5,3.366-1.446,4.802c-0.076,0.115-0.203,0.179-0.333,0.179c-0.075,0-0.151-0.022-0.219-0.065c-0.184-0.122-0.233-0.369-0.113-0.553c0.86-1.302,1.314-2.812,1.314-4.362s-0.454-3.058-1.314-4.363c-0.12-0.183-0.07-0.43,0.113-0.552c0.186-0.12,0.432-0.07,0.552,0.114C17.469,6.633,17.969,8.293,17.969,10 M15.938,10c0,1.165-0.305,2.319-0.88,3.339c-0.074,0.129-0.21,0.201-0.347,0.201c-0.068,0-0.134-0.016-0.197-0.052c-0.191-0.107-0.259-0.351-0.149-0.542c0.508-0.9,0.776-1.918,0.776-2.946c0-1.028-0.269-2.046-0.776-2.946c-0.109-0.191-0.042-0.434,0.149-0.542c0.193-0.109,0.436-0.042,0.544,0.149C15.634,7.681,15.938,8.834,15.938,10 M13.91,10c0,0.629-0.119,1.237-0.354,1.811c-0.063,0.153-0.211,0.247-0.368,0.247c-0.05,0-0.102-0.01-0.151-0.029c-0.203-0.084-0.301-0.317-0.217-0.521c0.194-0.476,0.294-0.984,0.294-1.508s-0.1-1.032-0.294-1.508c-0.084-0.203,0.014-0.437,0.217-0.52c0.203-0.084,0.437,0.014,0.52,0.217C13.791,8.763,13.91,9.373,13.91,10 M11.594,3.227v13.546c0,0.161-0.098,0.307-0.245,0.368c-0.05,0.021-0.102,0.03-0.153,0.03c-0.104,0-0.205-0.04-0.281-0.117l-3.669-3.668H2.43c-0.219,0-0.398-0.18-0.398-0.398V7.012c0-0.219,0.179-0.398,0.398-0.398h4.815l3.669-3.668c0.114-0.115,0.285-0.149,0.435-0.087C11.496,2.92,11.594,3.065,11.594,3.227 M7.012,7.41H2.828v5.18h4.184V7.41z M10.797,4.189L7.809,7.177v5.646l2.988,2.988V4.189z"></path>';
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
    audioStart.pause();
    instruction();
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    let audioGameOver = document.querySelector('#gameover audio');
    audioGameOver.play();
}

function loopGame() {
    // начинаем анимацию, вызов callback loop, позволяет запланировать исполнение кода перед следующей перерисовкой интерфейса без увеличения нагрузки на систему
    gameStart = requestAnimationFrame(loopGame);
    context.clearRect(0, 0, canvas.width, canvas.height); // очищаем холст
    createGrid(context); // рисуем сетку
    showNextFigure();
    for (let row = 0; row < rows; row++) { // игровое поле с фигурами
        for (let col = 0; col < columns; col++) {
            if (playfield[row][col]) {
                let figure = playfield[row][col];
                context.fillStyle = figure.color;
                context.fillRect(col * square, row * square, square - 1, square - 1);
            }
        }
    }
    if (activeFigure) { // активная фигура, если она отсутствует, то будет ложь undefined
        // когда задача завершена, идентификатор обратного вызова кадра анимации увеличивается на единицу
        if (counterFPS++ > speed) { // визуализация до максимальной кадровой частоты fps
            activeFigure.row++; // двигаемся вниз
            counterFPS = 0; // счетчик
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

let buttonRestart = document.querySelector('#restart');
buttonRestart.addEventListener('click', restart, true);

function restart() {
    score = 0;
    let scoreGame = document.querySelector('#score');
    scoreGame.textContent = score;
    lines = 0;
    let linesGame = document.querySelector('#lines');
    linesGame.textContent = lines;
    level = 0;
    let levelGame = document.querySelector('#level');
    levelGame.textContent = level;
    playfield = createPlayfield();
    activeFigure = createFigure();
    nextFigure = createFigure();
    context.clearRect(0, 0, canvas.width, canvas.height); // очищаем холст
    showGameStart();
    let imgMusic = document.querySelector('#stopmusic svg');
    imgMusic.innerHTML = '<path d="M17.969,10c0,1.707-0.5,3.366-1.446,4.802c-0.076,0.115-0.203,0.179-0.333,0.179c-0.075,0-0.151-0.022-0.219-0.065c-0.184-0.122-0.233-0.369-0.113-0.553c0.86-1.302,1.314-2.812,1.314-4.362s-0.454-3.058-1.314-4.363c-0.12-0.183-0.07-0.43,0.113-0.552c0.186-0.12,0.432-0.07,0.552,0.114C17.469,6.633,17.969,8.293,17.969,10 M15.938,10c0,1.165-0.305,2.319-0.88,3.339c-0.074,0.129-0.21,0.201-0.347,0.201c-0.068,0-0.134-0.016-0.197-0.052c-0.191-0.107-0.259-0.351-0.149-0.542c0.508-0.9,0.776-1.918,0.776-2.946c0-1.028-0.269-2.046-0.776-2.946c-0.109-0.191-0.042-0.434,0.149-0.542c0.193-0.109,0.436-0.042,0.544,0.149C15.634,7.681,15.938,8.834,15.938,10 M13.91,10c0,0.629-0.119,1.237-0.354,1.811c-0.063,0.153-0.211,0.247-0.368,0.247c-0.05,0-0.102-0.01-0.151-0.029c-0.203-0.084-0.301-0.317-0.217-0.521c0.194-0.476,0.294-0.984,0.294-1.508s-0.1-1.032-0.294-1.508c-0.084-0.203,0.014-0.437,0.217-0.52c0.203-0.084,0.437,0.014,0.52,0.217C13.791,8.763,13.91,9.373,13.91,10 M11.594,3.227v13.546c0,0.161-0.098,0.307-0.245,0.368c-0.05,0.021-0.102,0.03-0.153,0.03c-0.104,0-0.205-0.04-0.281-0.117l-3.669-3.668H2.43c-0.219,0-0.398-0.18-0.398-0.398V7.012c0-0.219,0.179-0.398,0.398-0.398h4.815l3.669-3.668c0.114-0.115,0.285-0.149,0.435-0.087C11.496,2.92,11.594,3.065,11.594,3.227 M7.012,7.41H2.828v5.18h4.184V7.41z M10.797,4.189L7.809,7.177v5.646l2.988,2.988V4.189z"></path>';
}

document.addEventListener('keydown', function (event) {
    switch (event.code) {
        case 'Enter': // запуск игры
            loopGame();
            break;
        case 'ArrowLeft': // сдвиг влево
            const colLeft = activeFigure.col - 1; // шаг влево
            if (outOfBounds(activeFigure.matrix, activeFigure.row, colLeft)) {
                activeFigure.col = colLeft; // можно? запоминаем
            }
            break;
        case 'ArrowUp': // поворот фигуры
            const matrix = rotateFigure(activeFigure.matrix); // поворачиваем
            if (outOfBounds(matrix, activeFigure.row, activeFigure.col)) {
                activeFigure.matrix = matrix; // можно повернуть? запоминаем
            }
            break;
        case 'ArrowRight': // сдвиг вправо
            const colRight = activeFigure.col + 1; // шаг вправо
            if (outOfBounds(activeFigure.matrix, activeFigure.row, colRight)) {
                activeFigure.col = colRight; // можно? запоминаем
            }
            break;
        case 'ArrowDown': // ускорить падение фигуры
            const row = activeFigure.row + 1; // шаг вниз
            if (!outOfBounds(activeFigure.matrix, row, activeFigure.col)) {
                activeFigure.row = row - 1; // если некуда вниз, то запоминаем
                placeFigure(); // проверка на место, заполн ряды, вызов след фигуры
                return;
            }
            activeFigure.row = row; // запоминаем строку, куда встала фигура
            break;
        case 'Space': // пауза
            showGamePause();
            break;
    }
});