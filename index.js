// game parameters
const BALL_SPD = 0.5; // starting ball speed as a fraction of screen height per second
const BALL_SPIN = 0.2; // ball deflection off the paddle (0 = no spin, 1 = high spin)
const BRICK_COLS = 14; // number of brick columns
const BRICK_GAP = 0.3; // brick gap as a fraction of wall width
const BRICK_ROWS = 8; // starting number of brick rows
const MARGIN = 6; // number of empty rows above the bricks
const MAX_LEVEL = 10; // maximum game level (+2 rows of bricks per level)
const PADDLE_SPD = 0.5; // fraction of screen width per second
const PADDLE_W = 0.1; // paddle width as a fraction of screen width
const WALL = 0.02; // wall/ball/paddle size as a fraction of the shortest screen dimension

// colours
const COLOR_BACKGROUND = "black";
const COLOR_BALL = "white";
const COLOR_PADDLE = "white";
const COLOR_WALL = "grey";

// definitions
const Direction = {
    LEFT: 0,
    RIGHT: 1,
    STOP: 2
}

// set up the game canvas and context
var canv = document.createElement("canvas");
document.body.appendChild(canv);
var ctx = canv.getContext("2d");

// game variables
var ball, bricks = [], level, paddle, touchX;

// dimensions
var height, width, wall;
setDimensions();

// event listeners
canv.addEventListener("touchcancel", touchCancel);
canv.addEventListener("touchend", touchEnd);
canv.addEventListener("touchmove", touchMove);
canv.addEventListener("touchstart", touchStart);
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
window.addEventListener("resize", setDimensions);

// set up the game loop
var timeDelta, timeLast;
requestAnimationFrame(loop);

function loop(timeNow) {
    if (!timeLast) {
        timeLast = timeNow;
    }

    // calculate the time difference
    timeDelta = (timeNow - timeLast) * 0.001; // seconds
    timeLast = timeNow;

    // update
    updatePaddle(timeDelta);
    updateBall(timeDelta);
    updateBricks(timeDelta);

    // draw
    drawBackground();
    drawWalls();
    drawPaddle();
    drawBricks();
    drawBall();

    // call the next loop
    requestAnimationFrame(loop);
}

function applyBallSpeed(angle) {

    // keep the angle between 30 and 150 degrees
    if (angle < Math.PI / 6) {
        angle = Math.PI / 6;
    } else if (angle > Math.PI * 5 / 6) {
        angle = Math.PI * 5 / 6;
    }

    // update the x and y velocities of the ball
    ball.xv = ball.spd * Math.cos(angle);
    ball.yv = -ball.spd * Math.sin(angle);
}

function createBricks() {
    
    // row dimensions
    let minY = wall;
    let maxY = ball.y - ball.h * 3.5;
    let totalSpaceY = maxY - minY;
    let totalRows = MARGIN + BRICK_ROWS + MAX_LEVEL * 2;
    let rowH = totalSpaceY / totalRows;
    let gap = wall * BRICK_GAP;
    let h = rowH - gap;

    // column dimensions
    let totalSpaceX = width - wall * 2;
    let colW = (totalSpaceX - gap) / BRICK_COLS;
    let w = colW - gap;

    // populate the bricks array
    bricks = [];
    let cols = BRICK_COLS;
    let rows = BRICK_ROWS + level * 2;
    let color, left, rank, rankHigh, top;
    rankHigh = rows * 0.5 - 1;
    for (let i = 0; i < rows; i++) {
        bricks[i] = [];
        rank = Math.floor(i * 0.5);
        color = getBrickColor(rank, rankHigh);
        top = wall + (MARGIN + i) * rowH;
        for (let j = 0; j < cols; j++) {
            left = wall + gap + j * colW;
            bricks[i][j] = new Brick(left, top, w, h, color);
        }
    }
}

function drawBackground() {
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.fillRect(0, 0, width, height);
}

function drawBall() {
    ctx.fillStyle = COLOR_BALL;
    ctx.fillRect(ball.x - ball.w * 0.5, ball.y - ball.h * 0.5, ball.w, ball.h);
}

function drawBricks() {
    for (let row of bricks) {
        for (let brick of row) {
            if (brick == null) {
                continue;
            }
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.left, brick.top, brick.w, brick.h);
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = COLOR_PADDLE;
    ctx.fillRect(paddle.x - paddle.w * 0.5, paddle.y - paddle.h * 0.5, paddle.w, paddle.h);
}

function drawWalls() {
    let hwall = wall * 0.5;
    ctx.strokeStyle = COLOR_WALL;
    ctx.beginPath();
    ctx.moveTo(hwall, height);
    ctx.lineTo(hwall, hwall);
    ctx.lineTo(width - hwall, hwall);
    ctx.lineTo(width - hwall, height);
    ctx.stroke();
}

// red = 0, orange = 0.33, yellow = 0.67, green = 1
function getBrickColor(rank, highestRank) {
    let fraction = rank / highestRank;
    let r, g, b = 0;

    // red to orange to yellow (increase green)
    if (fraction <= 0.67) {
        r = 255;
        g = 255 * fraction / 0.67;
    }

    // yellow to green (reduce red)
    else {
        r = 255 * (1 - fraction) / 0.33;
        g = 255;
    }

    // return the rgb colour string
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function keyDown(ev) {
    switch (ev.keyCode) {
        case 32: // space bar (serve the ball)
            serve();
            break;
        case 37: // left arrow (move paddle left)
            movePaddle(Direction.LEFT);
            break;
        case 39: // right arrow (move paddle right)
            movePaddle(Direction.RIGHT);
            break;
    }
}

function keyUp(ev) {
    switch (ev.keyCode) {
        case 37: // left arrow (stop moving)
        case 39: // right arrow (stop moving)
            movePaddle(Direction.STOP);
            break;
    }
}

function movePaddle(direction) {
    switch (direction) {
        case Direction.LEFT:
            paddle.xv = -paddle.spd;
            break;
        case Direction.RIGHT:
            paddle.xv = paddle.spd;
            break;
        case Direction.STOP:
            paddle.xv = 0;
            break;
    }
}

function newGame() {
    paddle = new Paddle();
    ball = new Ball();
    level = 0;
    touchX = null;
    createBricks();
}

function outOfBounds() {
    // TODO out of bounds
    newGame();
}

function serve() {

    // ball already in motion
    if (ball.yv != 0) {
        return false;
    }

    // random angle, between 45 and 135 degrees
    let angle = Math.random() * Math.PI / 2 + Math.PI / 4;
    applyBallSpeed(angle);
    return true;
}

function setDimensions() {
    height = window.innerHeight;
    width = window.innerWidth;
    wall = WALL * (height < width ? height : width);
    canv.width = width;
    canv.height = height;
    ctx.lineWidth = wall;
    newGame();
}

function touchCancel(ev) {
    touchX = null;
    movePaddle(Direction.STOP);
}

function touchEnd(ev) {
    touchX = null;
    movePaddle(Direction.STOP);
}

function touchMove(ev) {
    touchX = ev.touches[0].clientX;
}

function touchStart(ev) {
    if (serve()) {
        return;
    }
    touchX = ev.touches[0].clientX;
}

function updateBall(delta) {
    ball.x += ball.xv * delta;
    ball.y += ball.yv * delta;

    // bounce the ball off the walls
    if (ball.x < wall + ball.w * 0.5) {
        ball.x = wall + ball.w * 0.5;
        ball.xv = -ball.xv;
    } else if (ball.x > width - wall - ball.w * 0.5) {
        ball.x = width - wall - ball.w * 0.5;
        ball.xv = -ball.xv;
    } else if (ball.y < wall + ball.h * 0.5) {
        ball.y = wall + ball.h * 0.5;
        ball.yv = -ball.yv;
    }

    // bounce off the paddle
    if (ball.y > paddle.y - paddle.h * 0.5 - ball.h * 0.5
        && ball.y < paddle.y + paddle.h * 0.5
        && ball.x > paddle.x - paddle.w * 0.5 - ball.w * 0.5
        && ball.x < paddle.x + paddle.w * 0.5 + ball.w * 0.5
    ) {
        ball.y = paddle.y - paddle.h * 0.5 - ball.h * 0.5;
        ball.yv = -ball.yv;

        // modify the angle based off ball spin
        let angle = Math.atan2(-ball.yv, ball.xv);
        angle += (Math.random() * Math.PI / 2 - Math.PI / 4) * BALL_SPIN;
        applyBallSpeed(angle);
    }

    // handle out of bounds
    if (ball.y > height) {
        outOfBounds();
    }

    // move the stationary ball with the paddle
    if (ball.yv == 0) {
        ball.x = paddle.x;
    }
}

function updateBricks(delta) {

    // check for ball collisions
    OUTER: for (let i = 0; i < bricks.length; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            if (bricks[i][j] != null && bricks[i][j].intersect(ball)) {
                bricks[i][j] = null;
                ball.yv = -ball.yv;
                // TODO score etc.
                break OUTER;
            }
        }
    }
}

function updatePaddle(delta) {

    // handle touch
    if (touchX != null) {
        if (touchX > paddle.x + wall) {
            movePaddle(Direction.RIGHT);
        } else if (touchX < paddle.x - wall) {
            movePaddle(Direction.LEFT);
        } else {
            movePaddle(Direction.STOP);
        }
    }

    // move the paddle
    paddle.x += paddle.xv * delta;

    // stop paddle at walls
    if (paddle.x < wall + paddle.w * 0.5) {
        paddle.x = wall + paddle.w * 0.5;
    } else if (paddle.x > width - wall - paddle.w * 0.5) {
        paddle.x = width - wall - paddle.w * 0.5;
    }
}

function Ball() {
    this.w = wall;
    this.h = wall;
    this.x = paddle.x;
    this.y = paddle.y - paddle.h / 2 - this.h / 2;
    this.spd = BALL_SPD * height;
    this.xv = 0;
    this.yv = 0;
}

function Brick(left, top, w, h, color) {
    this.w = w;
    this.h = h;
    this.bot = top + h;
    this.left = left;
    this.right = left + w;
    this.top = top;
    this.color = color;

    this.intersect = function(ball) {
        let bBot = ball.y + ball.h * 0.5;
        let bLeft = ball.x - ball.w * 0.5;
        let bRight = ball.x + ball.w * 0.5;
        let bTop = ball.y - ball.h * 0.5;
        return this.left < bRight
            && bLeft < this.right
            && this.bot > bTop
            && bBot > this.top;
    }
}

function Paddle() {
    this.w = PADDLE_W * width;
    this.h = wall;
    this.x = width / 2;
    this.y = height - this.h * 3;
    this.spd = PADDLE_SPD * width;
    this.xv = 0;
}