window.onload = () => {
  const canvas = document.getElementById("gameCanvas");
  const canvasCtx = canvas.getContext("2d");
    
  const PADDLE_WIDTH = 10;
  const lPaddle = new Paddle(0, canvas.height/2, PADDLE_WIDTH);
  const rPaddle = new Paddle(canvas.width-PADDLE_WIDTH, canvas.height/2, PADDLE_WIDTH);

  const ball = new Ball();
  var gameInProgress = false;

  canvas.addEventListener('mousemove', e => {
    const mousePos = getMousePosition(e);
    lPaddle.y = mousePos.y - lPaddle.height/2;
    //rPaddle.y = mousePos.y - rPaddle.height/2;
  })

  canvas.addEventListener('click', e => {
    if (!gameInProgress) {
      resetGame();
    }
    else if (ball.waiting) {
      ball.start();
    }
  })
  
  function resetGame() {
    lPaddle.score = 0;
    rPaddle.score = 0;
    ball.start();
    gameInProgress = true;
  }

  const FPS = 30;
  setInterval(paint, 1000/FPS);

  function paint() {
    paintBackground();
    drawNet();
    updatePositions();
    ball.paint();
    lPaddle.paint();
    rPaddle.paint();
    
    canvasCtx.font = '20pt Lato';
    canvasCtx.fillText(lPaddle.score, 100, 100);
    canvasCtx.fillText(rPaddle.score, canvas.width-100, 100);
  }

  function updatePositions() {
    ball.updatePosition();
    rPaddle.autoUpdatePosition();
  }

  function paintBackground() {
    rect(0,0, canvas.width, canvas.height, "rgb(10,20,45)");
    
  }

  function drawNet() {
    for (let i=0; i < canvas.height; i+=40) {
      rect(canvas.width/2-1, i, 2, 20, 'white');
    }
  }

  function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    const root = document.documentElement;
    const mouseX = e.clientX - rect.left - root.scrollLeft;
    const mouseY = e.clientY - rect.top - root.scrollTop;

    return {
      x: mouseX,
      y: mouseY
    };
  }

  function rect(leftX, topY, width, height, color) {
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(leftX, topY, width, height);
  }

  function circle(centerX, centerY, radius, color) {
    canvasCtx.fillStyle = color;
    canvasCtx.beginPath();
    canvasCtx.arc(centerX, centerY, radius, 0, Math.PI*2);
    canvasCtx.fill();
  }

  function Paddle(x=0, y=0, width=PADDLE_WIDTH) {
    const WINNING_SCORE = 3;
    this.x = x
    this.y = y;
    this.width = 10;
    this.height = 100;
    this.score = 0;
    
    this.paint = function() {
      rect(this.x, this.y, this.width, this.height, "white");
    }

    this.autoUpdatePosition = function() {
      if (isPaddleAboveBall(this, ball)) {
        this.y += 6;
      }
      else if (isPaddleBelowBall(this, ball)) {
        this.y -= 6;
      }
    }

    this.getCenterY = function() {
      return this.y + (this.height/2);
    }

    function isPaddleAboveBall(paddle, ball) {
      return paddle.getCenterY() < ball.y - 35;
    }

    function isPaddleBelowBall(paddle, ball) {
      return paddle.getCenterY() > ball.y + 35;
    }

    this.addPoint = function() {
      this.score++;
      if (this.score == WINNING_SCORE) {
        gameInProgress = false;
        ball.waiting = true;
      }
    }
  }

  function Ball() {
    this.waiting = true;
    this.x = 50;
    this.y = 200;
    this.width = 10;
    this.height = 10;
    this.xSpeed = 15;
    this.ySpeed = 4;

    this.updatePosition = function() {
      if (this.waiting) {
        return;
      }

      this.x += this.xSpeed;
      this.y += this.ySpeed;
      
      if (isAtRightBorder(this)) {
        if (isTouchingPaddle(this, rPaddle)) {
          this.xSpeed = -this.xSpeed;

          let deltaY = this.y - (rPaddle.y + rPaddle.height/2);
          this.ySpeed = deltaY * 0.35;
        }
        else {
          this.scored(lPaddle);
        }
      }

      if (isAtLeftBorder(this)) {
        if (isTouchingPaddle(this, lPaddle)) {
          this.xSpeed = -this.xSpeed;
          
          let deltaY = this.y - (lPaddle.y + lPaddle.height/2);
          this.ySpeed = deltaY * 0.35;
        }
        else {
          this.scored(rPaddle);
        }
      }

      if (isAtTopBorder(this) || isAtBottomBorder(this)) {
        this.ySpeed = -this.ySpeed;
      }

      function isAtRightBorder(ball) {
        return ball.x > canvas.width - ball.width;
      }

      function isTouchingPaddle(ball, paddle) {
        return ball.y > paddle.y && ball.y < paddle.y + paddle.height;
      }

      function isAtLeftBorder(ball) {
        return ball.x < 0 + ball.width;
      }

      function isAtTopBorder(ball) {
        return ball.y < 0 + ball.height;
      }

      function isAtBottomBorder(ball) {
        return ball.y > canvas.height - ball.height;
      }
    
    }

    this.paint = function() {
      if (!this.waiting) {
        circle(this.x, this.y, 6, "green");
      }
    }

    this.scored = function(paddle) {
      paddle.addPoint();
      this.waiting = true;
    }

    this.start = function() {
      this.xSpeed = -this.xSpeed;
      this.x = canvas.width/2;
      this.y = canvas.height/2;
      this.waiting = false;
    }
  }
}