function initialiseArea() {
  return { width: 500, height: 500 }
}

function initialiseBall(area) {
  return {
    radius: 5,
    position: {
      x: area.width / 2,
      y: area.height / 2
    }
  }
}

function initialisePaddle(area, xPosition) {
  return {
    velocity: {
      x: 0,
      y: 0,
    },
    position: {
      x: xPosition,
      y: area.height / 2,
    },
    width: 5,
    height: area.height / 5
  }
}

function initialiseState() {
  const area = initialiseArea()
  const ball = initialiseBall(area)
  return {
    area: area,
    ball: ball,
    paddles: {
      left: initialisePaddle(area, 10),
      right: initialisePaddle(area, area.width - 10),
    }
  }
}

function updateState(state, time) {
  return state
}

function drawBall(state, ctx) {
  ctx.beginPath()
  ctx.arc(state.ball.position.x, state.ball.position.y, state.ball.radius, 0, 2 * Math.PI, false)
  ctx.fill()
}
function drawPaddle(paddle, ctx) {
  ctx.rect(
    paddle.position.x - paddle.width / 2,
    paddle.position.y - paddle.height / 2,
    paddle.width,
    paddle.height
  )
  ctx.fill()
}
function draw(state, ctx) {
  ctx.clearRect(0, 0, state.area.width, state.area.height)
  drawBall(state, ctx)
  drawPaddle(state.paddles.left, ctx)
  drawPaddle(state.paddles.right, ctx)
}

function main() {
  let state = initialiseState()
  console.log(state)
  const canvas = document.createElement('canvas')
  canvas.width = state.area.width;
  canvas.height = state.area.height;
  const ctx = canvas.getContext('2d')
  function tick(time) {
    requestAnimationFrame(tick)
    state = updateState(state, time)
    draw(state, ctx)
  }
  document.body.append(canvas)
  requestAnimationFrame(tick)
}
main()