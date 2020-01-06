const height = 550; //Parameters
const width = height *.9; //Dimensions
const wall = width / 50;

const paddle_Height = wall;
const paddle_Width = paddle_Height * 5;
const paddle_Speed = .7; //fraction of screen width per sec

const ball_Speed = 200; 
const ball_Size = wall; 

const color_Background = "black";
const color_Wall = "grey";
const color_Paddle = "white";
const color_Ball = "white";

const Direction = {
    left: 0,
    right: 1,
    stop: 2
}

//game canvas
var canv = document.createElement("canvas");
canv.width = width;
canv.height = height;
document.body.appendChild(canv);

//set context
var ctx = canv.getContext("2d");
ctx.lineWidth = wall;

//game variables
var paddle;
var ball;

//start new game
newGame();

//event listeners
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//set game loop
var timeDelta, timeLast;
requestAnimationFrame(loop);

function loop(timeNow) 
{
    if(!timeLast) 
    {
        timeLast = timeNow;
    }

    //calculate time difference
    timeDelta = (timeNow - timeLast) / 1000; //seconds
    timeLast = timeNow;

    //update
    updatePaddle(timeDelta);
    updateBall(timeDelta);

    //draw
    drawBackground();
    drawWalls();
    drawPaddle();
    drawBall();

    //call next loop
    requestAnimationFrame(loop);
}

function applyBallSpeed(angle)
{
    //update x and y velocities of ball
    ball.xv = ball_Speed * Math.cos(angle);
    ball.yv = -ball_Speed * Math.sin(angle);

}

function drawBackground()
{
    ctx.fillStyle = color_Background;
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function drawWalls()
{
    let halfwall = wall * 0.5;
    ctx.strokeStyle = color_Wall;
    ctx.beginPath();
    ctx.moveTo(halfwall, height);
    ctx.lineTo(halfwall, halfwall);
    ctx.lineTo(width - halfwall, halfwall);
    ctx.lineTo(width - halfwall, height);
    ctx.stroke();
}

function drawPaddle()
{
    ctx.fillStyle = color_Paddle;
    ctx.fillRect(paddle.x - paddle.w *.5, paddle.y - paddle.h *.5, paddle.w, paddle.h);
}

function drawBall()
{
    ctx.fillStyle = color_Ball;
    ctx.fillRect(ball.x - ball.w *.5, ball.y - ball.h *.5, ball.w, ball.h);
}

function keyDown(ev)
{
    switch (ev.keyCode) {
        case 32: //space bar (serve the ball)
            serve();
            break;
        case 37: //left arrow
            movePaddle(Direction.left);
            break;
        case 39: //right arrow
            movePaddle(Direction.right);    
            break;
    }
}

function keyUp(ev)
{
    switch (ev.keyCode) {
        case 37: //left arrow stop
        case 39: //right arrow stop
            movePaddle(Direction.stop);    
            break;
    } 
}

function movePaddle (direction)
{
    switch(direction) {
        case Direction.left:
            paddle.xv = -paddle.spd;
            break;
        case Direction.right:
            paddle.xv = paddle.spd;
            break;
        case Direction.stop:
            paddle.xv = 0;
            break;
    }
}

function newGame()
{
    paddle = new Paddle();
    ball = new Ball();
}

function updatePaddle(delta) 
{
    paddle.x += paddle.xv * delta;

    //stop paddle at wall
    if(paddle.x < wall + paddle.w * .5)
    {
        paddle.x = wall + paddle.w * .5;
    }
    
    else if(paddle.x > canv.width - wall - paddle.w * .5)
    {
        paddle.x = canv.width - wall - paddle.w * .5;
    }
}

function updateBall(delta)
{
    ball.x += ball.xv * delta;
    ball.y += ball.yv * delta;

    //move stationary ball with paddle
    if(ball.yv == 0)
    {
        ball.x = paddle.x;
    }
}

function serve()
{
    if(ball.yv != 0)
    {
        return;
    }
    
    //random angle, between 45 and 135 degrees
    let angle = Math.random() * Math.PI / 2 + Math.PI / 4;
    applyBallSpeed(angle);
}



function Paddle()
{
    this.w = paddle_Width;
    this.h = paddle_Height;
    this.x = canv.width / 2;
    this.y = canv.height - this.h * 3;
    this.spd = paddle_Speed * width;
    this.xv = 0;
}

function Ball()
{
    this.w = ball_Size;
    this.h = ball_Size;
    this.x = paddle.x;
    this.y = paddle.y - paddle.h / 2 - this.h / 2;
    this.spd = ball_Speed * width;
    this.xv = 0;
    this.yv = 0;
}
