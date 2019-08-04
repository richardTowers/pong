function bounceWall(position, speed, bounds, acceleration, bounciness) {
  if (position < bounds.lower) { return Math.abs(speed) * bounciness }
  if (position > bounds.upper) { return -Math.abs(speed) * bounciness }
  return speed + acceleration;
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

function updateState(state, time, bounds, ball) {
  const dt = Math.min(1, (time - state.oldTime) / 1000)
  const xSpeed = bounceWall(state.x, state.xSpeed, bounds.x, state.xAcceleration, ball.bounciness)
  const ySpeed = bounceWall(state.y, state.ySpeed, bounds.y, state.yAcceleration, ball.bounciness)
  return {
    oldTime: time,
    x: state.x + xSpeed * dt,
    y: state.y + ySpeed * dt,
    xSpeed: xSpeed,
    ySpeed: ySpeed,
    xAcceleration: state.xAcceleration,
    yAcceleration: state.yAcceleration,
    leftPaddle: updatePaddleState(state.leftPaddle, bounds.y, dt),
    rightPaddle: updatePaddleState(state.rightPaddle, bounds.y, dt),
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

function draw(state, ball, ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.beginPath()
  ctx.arc(state.x, state.y, ball.radius, 0, 2 * Math.PI, false)
  ctx.fill()
  drawPaddle(ctx, state.leftPaddle)
  drawPaddle(ctx, state.rightPaddle)
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
  let state = {
    oldTime: window.performance && window.performance.now && window.performance.now(),
    x: canvas.width / 2,
    y: canvas.height / 2,
    xSpeed: 200,
    ySpeed: 100,
    xAcceleration: 0,
    yAcceleration: 0,
    leftPaddle: {
      speed: 0,
      center: {
        y: canvas.height / 2,
        x: 7.5,
      },
      height: canvas.height / 3,
      width: 5,
    },
    rightPaddle: {
      speed: 0,
      center: {
        y: canvas.height / 2,
        x: canvas.width - 7.5
      },
      height: canvas.height / 3,
      width: 5
    }
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
