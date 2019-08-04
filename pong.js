function bounceWall(position, speed, bounds) {
  if (position < bounds.lower) { return Math.abs(speed) }
  if (position > bounds.upper) { return -Math.abs(speed) }
  return speed;
}

function insidePaddle(yPos, paddle) {
  return yPos >= paddle.center.y - paddle.height / 2 &&
    yPos <= paddle.center.y + paddle.height / 2
}

function bouncePaddle(position, speed, paddles) {
  const leftPaddle = paddles.leftPaddle
  const rightPaddle = paddles.rightPaddle
  const velocity = 300
  if (insidePaddle(position.y, leftPaddle) &&
      position.x < leftPaddle.center.x + leftPaddle.width / 2) {
    const angle = (Math.PI * (position.y - leftPaddle.center.y) / leftPaddle.height) * 0.75
    const result = {
      x: velocity * Math.cos(angle),
      y: velocity * Math.sin(angle),
    }
    return result
  }
  if (insidePaddle(position.y, rightPaddle) &&
      position.x > rightPaddle.center.x - rightPaddle.width / 2) {
    const angle = (Math.PI * (position.y - rightPaddle.center.y) / rightPaddle.height) * 0.75
    const result =  {
      x: -velocity * Math.cos(angle),
      y: velocity * Math.sin(angle),
    }
    return result
  }
  return speed;
}

function randomSpeed(velocity) {
  const angle = (Math.random() - 0.5) * Math.PI / 2;
  const x = Math.cos(angle) * velocity;
  const y = Math.sin(angle) * velocity;
  if (Math.random() < 0.5) {
    return { x: -x, y: y}
  }
  return { x: x, y: y}
}

function updatePaddleState(paddle, bounds, dt) {
  const yCenter = paddle.center.y + paddle.speed * dt
  const yTop = yCenter - paddle.height / 2
  const yBottom = yCenter + paddle.height / 2
  return {
      speed: paddle.speed,
      center: {
        y: yTop <= bounds.lower ?
          bounds.lower + paddle.height / 2 :
          yBottom >= bounds.upper ?
          bounds.upper - paddle.height / 2 :
          yCenter,
        x: paddle.center.x
      },
      height: paddle.height,
      width: paddle.width,
  }
}

function checkGoal(position, bounds, start, score) {
  if (position.x > bounds.upper) {
    return { left: score.left + 1, right: score.right }
  }
  if (position.x < bounds.lower) {
    return { left: score.left, right: score.right + 1 }
  }
  return null
}

function updateState(state, time, bounds) {
  const dt = Math.min(1, (time - state.oldTime) / 1000)
  if (state.paused) {
    return {
      ...state,
      oldTime: time,
    };
  }
  const leftPaddle = updatePaddleState(state.leftPaddle, bounds.y, dt)
  const rightPaddle = updatePaddleState(state.rightPaddle, bounds.y, dt)
  const position = { x: state.x, y: state.y };
  const speed = bouncePaddle(
    position,
    { x: state.xSpeed, y: state.ySpeed },
    {
      leftPaddle: leftPaddle,
      rightPaddle: rightPaddle
    }
  )
  speed.y = bounceWall(state.y, speed.y, bounds.y)
  const goal = checkGoal(position, bounds.x, state.start, state.score)
  if (goal) {
    const newSpeed = randomSpeed(Math.sqrt(speed.x**2 + speed.y**2))
    return {
      oldTime: time,
      start: state.start,
      x: state.start.x,
      y: state.start.y,
      xSpeed: newSpeed.x,
      ySpeed: newSpeed.y,
      leftPaddle: leftPaddle,
      rightPaddle: rightPaddle,
      score: goal,
      paused: true
    }
  }
  return {
    oldTime: time,
    start: state.start,
    x: state.x + speed.x * dt,
    y: state.y + speed.y * dt,
    xSpeed: speed.x,
    ySpeed: speed.y,
    leftPaddle: leftPaddle,
    rightPaddle: rightPaddle,
    score: state.score,
    paused: false
  }
}

function drawPaddle(ctx, paddle) {
  ctx.rect(
    paddle.center.x - paddle.width / 2,
    paddle.center.y - paddle.height / 2,
    paddle.width,
    paddle.height
  )
  ctx.fill()
}

function drawBall(state, ball, ctx) {
  ctx.beginPath()
  ctx.arc(state.x, state.y, ball.radius, 0, 2 * Math.PI, false)
  ctx.fill()
}

function draw(state, ball, ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = '24px sans-serif'
  if (state.paused) {
    ctx.fillText('🏓 Press space', canvas.width / 2 - 120, canvas.height / 2)
  } else {
    drawBall(state, ball, ctx)
  }
  drawPaddle(ctx, state.leftPaddle)
  drawPaddle(ctx, state.rightPaddle)
  ctx.font = '48px sans-serif'
  ctx.fillText(state.score.left + ' | ' + state.score.right, canvas.width / 2 - 48, 48)
}

function main() {
  const canvas = document.createElement('canvas')
  canvas.width = 500;
  canvas.height = 500;
  const ctx = canvas.getContext('2d')
  const ball = {
    radius: 2,
    bounciness: 1,
  }
  const bounds = {
    x: {lower:ball.radius,upper:canvas.width - ball.radius},
    y: {lower:ball.radius,upper:canvas.height - ball.radius}
  }
  const initialSpeed = randomSpeed(300);
  let state = {
    oldTime: window.performance && window.performance.now && window.performance.now(),
    start: {
      x: canvas.width / 2,
      y: canvas.height / 2,
    },
    x: canvas.width / 2,
    y: canvas.height / 2,
    xSpeed: initialSpeed.x,
    ySpeed: initialSpeed.y,
    leftPaddle: {
      speed: 0,
      center: {
        y: canvas.height / 2,
        x: 7.5,
      },
      height: canvas.height / 5,
      width: 5,
    },
    rightPaddle: {
      speed: 0,
      center: {
        y: canvas.height / 2,
        x: canvas.width - 7.5
      },
      height: canvas.height / 5,
      width: 5
    },
    score: {
      left: 0,
      right: 0
    },
    paused: true
  }
  function tick(time) {
    requestAnimationFrame(tick)
    state = updateState(state, time, bounds, ball)
    draw(state, ball, ctx, canvas)
  }
  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 's':
        state = {...state, leftPaddle: {...state.leftPaddle, speed: 200}}
        break;
      case 'w':
        state = {...state, leftPaddle: {...state.leftPaddle, speed: -200}}
        break;
      case 'ArrowDown':
        state = {...state, rightPaddle: {...state.rightPaddle, speed: 200}}
        break;
      case 'ArrowUp':
        state = {...state, rightPaddle: {...state.rightPaddle, speed: -200}}
        break;
      case ' ':
        state = {...state, paused: !state.paused}
        break;
    }
  })
  document.addEventListener('keyup', function (e) {
    switch (e.key) {
      case 's':
      case 'w':
        state = {...state, leftPaddle: {...state.leftPaddle, speed: 0}}
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        state = {...state, rightPaddle: {...state.rightPaddle, speed: 0}}
        break;
    }
  })
  document.body.append(canvas)
  requestAnimationFrame(tick)
}

main()
