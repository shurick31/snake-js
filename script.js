
var interval;
class Game {
    constructor(props) {
        //super(props);
        this.state = {
            width: 500,
            height: 500,
            speed: 10,
            size: 3,
            direction: 'up',
            curY: 250,
            curX: 250,
            status: false,
            snake: [],
            things: [],
            max: 2500,
            win: false

        }

        this.move = this.move.bind(this);
        this.elementSize = 10;
        this.listen();
        this.interval = null;


    }

    getScreenCoordinates = (selector) => {
        let el = document.querySelector(selector);
        if (el) {
            let rect = el.getBoundingClientRect();
            return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
        }
        return false;
    }

    createField = () => {
        let rootDiv = document.getElementById('root');
        if (!rootDiv) {
            return { error: 'Cannot run standalone!' };
        }
        let gameBox = document.createElement('div');
        gameBox.className = 'game-box';
        gameBox.id = 'game-box';

        rootDiv.appendChild(gameBox);

        let initCoords = this.getScreenCoordinates('#game-box');
        if (initCoords) {
            this.setState(initCoords);
        }
        let scoreBoard = document.createElement('div');
        scoreBoard.id = 'scoreboard';
        scoreBoard.innerHTML = '<span>Score: 0</span>';
        rootDiv.appendChild(scoreBoard);
    }

    setThing = () => {
        const { snake, things, width, height } = this.state;
        let element = null;
        while (true) {
            let x = Math.round((Math.random() * (width - 11) + 1) / 10) * 10;
            let y = Math.round((Math.random() * (height - 11) + 1) / 10) * 10;
            element = {
                x,
                y
            }
            let found = snake.find(e => e.curX === element.x && e.curY === element.y);
            if (!found) {
                break;
            }
        }

        things.push(element);
        this.setState({ things });
    }


    init = () => {

        const { curX, curY, size } = this.state;
        this.createField();

        let initSnake = [];
        // initial direction: 'up';
        for (let i = 0; i < size; i++) {
            initSnake.push({ curX, curY: curY + i * this.elementSize });
        }

        // set things
        for (let i = 0; i < size; i++) {
            this.setThing();
        }

        // draw scoreboard
        this.setState({ snake: initSnake });
        this.drawSnake();
    }



    drawSnake = () => {
        const { things, snake } = this.state;
        let gameField = document.getElementById('game-box');
        //console.log(snake, snake.length);
        while (gameField.firstChild) {
            gameField.removeChild(gameField.firstChild);
        }

        for (let i = 0; i < snake.length; i++) {

            let className = 'snake-element';
            let element = document.createElement('div');
            let style = 'top: ' + snake[i].curY + 'px;';
            style += 'left: ' + snake[i].curX + 'px;';
            style += 'position: absolute;';

            if (i === 0) {
                className += ' head';
            }



            element.className = className;
            element.style = style;
            gameField.appendChild(element);
        }

        // write things

        for (let i = 0; i < things.length; i++) {

            let className = 'thing';
            let element = document.createElement('div');


            let style = 'top: ' + things[i].y + 'px;';
            style += 'left: ' + things[i].x + 'px;';
            style += 'position: absolute';

            element.className = className;
            element.style = style;
            gameField.appendChild(element);
        }
    }

    listenerCallBack = (e) => {

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (!this.state.status) {
                    this.startGame();
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (this.state.status) {
                    this.pauseGame();
                }

                break;
            case 'KeyW':
            case 'ArrowUp':
                e.preventDefault();
                this.turn('up');
                break;
            case 'KeyS':
            case 'ArrowDown':
                e.preventDefault();
                this.turn('down');
                break;
            case 'KeyA':
            case 'ArrowLeft':
                e.preventDefault();
                this.turn('left');
                break;
            case 'KeyD':
            case 'ArrowRight':
                e.preventDefault();
                this.turn('right');
                break;
            case 'MetaLeft':
                //console.log(this.state);
                break;
            default:

                break;
        }
    }

    listen = () => {
        document.addEventListener("keydown", this.listenerCallBack);
    }



    turn = (direction) => {

        if (this.state.status) {
            this.setState({ direction });
        }

    }

    setState = (newValue, cb = false) => {
        this.state = { ...this.state, ...newValue };
        if (cb) { cb(); }
    }

    pauseGame = () => {
        clearInterval(interval);
        this.setState({ status: false });
    }

    startGame = () => {
        const { speed, status } = this.state;
        if (status) {
            return false;
        }
        this.setState({ status: true });
        let currentSpeed = 500 - 10 * speed;
        interval = setInterval(function () {
            this.move();
        }.bind(this), currentSpeed);
    }


    increaseSpeed = () => {
        const { speed } = this.state;
        if (speed >= 48) { //max speed
            return true;
        }

        let currentSpeed = 500 - 10 * (speed + 1);
        this.setState({ speed: speed + 1 });
        clearInterval(interval);
        interval = setInterval(function () {
            this.move();
        }.bind(this), currentSpeed);
    }

    clearSnake = () => {
        document.querySelectorAll('.snake-element').forEach(e => e.remove());
    }

    checkPosition = (posX, posY) => {
        const { width, height, snake } = this.state;
        if (posX < 0 || posX > width - this.elementSize) {
            return false;
        }
        if (posY < 0 || posY > height - this.elementSize) {
            return false;
        }
        let tail = snake[snake.length - 1];
        if (posX === tail.curX && posY === tail.curY) {
            return false; // ate own tail
        }
        return true;
    }

    updateScore = () => {
        if (this.state.gameOver) {
            return false;
        }
        const { snake, max } = this.state;
        let html = '<span>Score: ' + (snake.length - 3) + '</span>';
        if (snake.length === max) {
            this.setState({ win: true });
            html += '<span class="game-over-label">You win!</span>';
            clearInterval(interval);
            document.getElementById('restart-game').style.display = 'inline-block';
            document.getElementById('restart-game').addEventListener('click', this.restartGame);

        }

        let scoreBoard = document.getElementById('scoreboard');
        scoreBoard.innerHTML = html;
    }

    checkForEat = (pos) => {
        const { curY, curX } = pos;
        const { things } = this.state;
        let thingIndex = things.findIndex(e => e.x === curX && e.y === curY);

        if (thingIndex > -1) {
            things.splice(thingIndex, 1);
            this.setThing();
            this.increaseSpeed();
            return true;
        }

        return false;
    }

    gameOver = () => {

        let scoreBoard = document.getElementById('scoreboard');
        let html = scoreBoard.innerHTML;

        html += '<span class="game-over-label">GAME OVER!!!</span>';


        scoreBoard.innerHTML = html;
        this.setState({ gameOver: true });
        clearInterval(interval);
        document.getElementById('restart-game').style.display = 'inline-block';
        document.getElementById('restart-game').addEventListener('click', this.restartGame);
    }

    restartGame = () => {
        document.removeEventListener("keydown", this.listenerCallBack);
        document.getElementById('restart-game').removeEventListener("click", this.restartGame);
        document.getElementById('restart-game').style.display = 'none';
        let root = document.getElementById('root');
        //console.log(snake, snake.length);
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }

        this.setState({
            width: 500,
            height: 500,
            speed: 10,
            size: 3,
            direction: 'up',
            curY: 250,
            curX: 250,
            status: false,
            snake: [],
            things: [],
            max: 2500,
            win: false
        });
        this.listen();
        this.init();
    }


    move = () => {
        const { curX, curY, direction, snake } = this.state;
        let newX, newY = 0;
        let newPos = null;
        let offset = this.elementSize;
        switch (direction) {
            case 'up':

                newY = snake[0].curY - offset;
                if (!this.checkPosition(snake[0].curX, newY)) {
                    newY = snake[0].curY
                    this.gameOver();
                }
                newPos = { curY: newY, curX: snake[0].curX }
                snake.splice(0, 0, newPos);
                if (!this.checkForEat(newPos)) {
                    snake.pop();
                } else {
                    this.updateScore();
                }

                break;
            case 'down':
                newY = snake[0].curY + offset;
                if (!this.checkPosition(snake[0].curX, newY)) {
                    newY = snake[0].curY
                    this.gameOver();
                }
                newPos = { curY: newY, curX: snake[0].curX };
                snake.splice(0, 0, newPos);
                if (!this.checkForEat(newPos)) {
                    snake.pop();
                } else {
                    this.updateScore();
                }

                break;
            case 'left':
                newX = snake[0].curX - offset;

                if (!this.checkPosition(newX, snake[0].curY)) {
                    newX = snake[0].curX
                    this.gameOver();
                }
                newPos = { curY: snake[0].curY, curX: newX };
                snake.splice(0, 0, newPos);
                if (!this.checkForEat(newPos)) {
                    snake.pop();
                } else {
                    this.updateScore();
                }

                break;
            case 'right':
                newX = snake[0].curX + offset;

                if (!this.checkPosition(newX, snake[0].curY)) {
                    newX = snake[0].curX
                    this.gameOver();
                }
                newPos = { curY: snake[0].curY, curX: newX };
                snake.splice(0, 0, newPos);
                if (!this.checkForEat(newPos)) {
                    snake.pop();
                } else {
                    this.updateScore();
                }

                break;
            default:
                newX = curX;
                newY = curY;
                break;

        }

        this.setState({ curX: newX, curY: newY, snake });
        this.drawSnake();

    }

    render() {
        this.clearSnake();
        this.drawSnake();
    }
}




