const WALL = 0.02; //wall, ball, paddle size as a fraction of the shortest screen dimension


const paddle_Width = .1;
const paddle_Speed = .7; //fraction of screen width per sec

const ball_Speed = 200; 
const ball_Spin = 0.5;//ball deflection off paddle



const color_Background = "black";
const color_Wall = "grey";
const color_Paddle = "white";
const color_Ball = "white";

const Direction = {
    left: 0,
    right: 1,
    stop: 2
}

//set up game canvas and context
var canv = document.createElement("canvas");
document.body.appendChild(canv);
var ctx = canv.getContext("2d");

//dimensions
var height, width, wall;
setDimensions();

//game variables
var paddle;
var ball;

//start new game
newGame();

//event listeners
canv.addEventListener("touchcancel", touchCancel);
canv.addEventListener("touchend", touchEnd);
canv.addEventListener("touchmove", touchMove);
canv.addEventListener("touchstart", touchStart);
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
window.addEventListener("resize", setDimensions);

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

    //keep angle between 30 and 150 degrees
    if(angle < Math.PI / 6)
    {
        angle = Math.PI / 6;
    }
    else if(angle > Math.PI * 5/6)
    {
        angle = Math.PI * 5/6;
    }

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

    //bounce ball off left wall
    if(ball.x < wall + ball.w * 0.5)
    {
        ball.x = wall + ball.w * 0.5;
        ball.xv = -ball.xv;
    }
    //bounce ball off right wall
    else if(ball.x > canv.width - wall - ball.w * 0.5)
    {
        ball.x = canv.width - wall - ball.w * 0.5;
        ball.xv = -ball.xv;
    }
    //bounce ball off top wall
    else if(ball.y < wall + ball.h * 0.5)
    {
        ball.y < wall + ball.h * 0.5;
        ball.yv = -ball.yv;
    }

    //bounce off paddle
    if(ball.y > paddle.y - paddle.h * 0.5 - ball.h * 0.5 
        && ball.y < paddle.y 
        && ball.x > paddle.x - paddle.w * 0.5 - ball.w * 0.5
        && ball.x < paddle.x + paddle.w * 0.5 + ball.w * 0.5)
    {
        ball.y = paddle.y - paddle.h * 0.5 - ball.h * 0.5;
        ball.yv = -ball.yv;

        //modify angle based on "ball spin"
        let angle = Math.atan2(-ball.yv, ball.xv);
        angle += (Math.random() * Math.PI / 2 - Math.PI / 4) * ball_Spin;
        applyBallSpeed(angle);

    }

    //handle out of bounds
    if(ball.y > canv.height)
    {
        outOfBounds();
    }

    //move stationary ball with paddle
    if(ball.yv == 0)
    {
        ball.x = paddle.x;
    }
}

function serve()
{
    //ball already in motion
    if(ball.yv != 0)
    {
        return;
    }
    
    //random angle, between 45 and 135 degrees
    let angle = Math.random() * Math.PI / 2 + Math.PI / 4;
    applyBallSpeed(angle);
}

function setDimensions()
{
    height = window.innerHeight; 
    width = window.innerWidth; 
    wall = WALL * (height < width ? height : width);
    canv.width = width;
    canv.height = height;
    ctx.lineWidth = wall;
    paddle = new Paddle();
    ball = new Ball();
}

function touch(X)
{
    if(!x)
    {
        movePaddle(Direction.STOP);
    }
    else if(x > paddle.x)
    {
        movePaddle(Direction.RIGHT);
    }
    else if(x < paddle.x)
    {
        movePaddle(Direction.LEFT);
    }
}

function touchCancel(ev)
{
    touch(null);
}

function touchEnd(ev)
{
    touch(null);
}

function touchMove(ev)
{
    touch(ev.touches[0].clientX);
}

function touchStart(ev)
{
    serve();
    touch(ev.touches[0].clientX);
}

function outOfBounds()
{
    newGame();
}

function Paddle()
{
    this.w = paddle_Width * width;
    this.h = wall;
    this.x = canv.width / 2;
    this.y = canv.height - this.h * 3;
    this.spd = paddle_Speed * width;
    this.xv = 0;
}

function Ball()
{
    this.w = wall;
    this.h = wall;
    this.x = paddle.x;
    this.y = paddle.y - paddle.h / 2 - this.h / 2;
    this.spd = ball_Speed * height;
    this.xv = 0;
    this.yv = 0;
}