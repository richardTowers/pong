const AREA_HEIGHT = 500
const AREA_WIDTH = 500
const BALL_SPEED = 300
const PADDLE_SPEED = 500
const INITIAL_BALL_ANGLE = Math.PI / 8

function initialiseBall() {
  return {
    radius: 5,
    velocity: {
      x: BALL_SPEED * Math.cos(INITIAL_BALL_ANGLE),
      y: BALL_SPEED * Math.sin(INITIAL_BALL_ANGLE),
    },
    position: {
      x: AREA_WIDTH / 2,
      y: AREA_HEIGHT / 2
    }
  }
}

function initialisePaddle(xPosition) {
  return {
    velocity: {
      x: 0,
      y: 0,
    },
    position: {
      x: xPosition,
      y: AREA_HEIGHT / 2,
    },
    width: 5,
    height: AREA_HEIGHT / 5
  }
}

function initialiseState(time) {
  const ball = initialiseBall()
  return {
    previousTime: time,
    ball: ball,
    paddles: {
      left: initialisePaddle(10),
      right: initialisePaddle(AREA_WIDTH - 10),
    },
    scores: {
      left: 0,
      right: 0,
    }
  }
}

function updatePosition(position, velocity, dt) {
  return {
    x: position.x + velocity.x * dt,
    y: position.y + velocity.y * dt,
  }
}

function updateBall(ball, dt) {
  return {
    ...ball,
    position: updatePosition(ball.position, ball.velocity, dt)
  }
}

function bounceWalls(ball) {
  let yVelocity = ball.velocity.y
  if (ball.position.y >= AREA_HEIGHT) {
    yVelocity = -Math.abs(ball.velocity.y)
  }
  if (ball.position.y <= 0) {
    yVelocity = Math.abs(ball.velocity.y)
  }
  return {
    ...ball,
    velocity: {
      ...ball.velocity,
      y: yVelocity
    }
  }
}

function bouncePaddle(ball, paddle, direction) {
  if (
    ball.position.x + ball.radius >= paddle.position.x - paddle.width / 2 &&
    ball.position.x - ball.radius <= paddle.position.x + paddle.width / 2 &&
    ball.position.y >= paddle.position.y - paddle.height / 2 &&
    ball.position.y <= paddle.position.y + paddle.height / 2
    ) {
      return {
        ...ball,
        velocity: {
          ...ball.velocity,
          x: direction * Math.abs(ball.velocity.x)
        }
      }
    }
    return ball
}

function updatePaddle(paddle, dt) {
  const position = updatePosition(
    paddle.position,
    paddle.velocity,
    dt
  )
  if (position.y <= paddle.height / 2) {
    position.y = paddle.height / 2
  }
  if (position.y >= AREA_HEIGHT - paddle.height / 2) {
    position.y = AREA_HEIGHT - paddle.height / 2
  }
  return {
    ...paddle,
    position: position
  }
}

function updateScores(ball, scores) {
  if (ball.position.x <= 0) {
    return {...scores, right: scores.right + 1}
  }
  if (ball.position.x >= AREA_WIDTH) {
    return {...scores, left: scores.left + 1}
  }
  return scores
}

function isGoal(ball) {
  return ball.position.x <= 0 || ball.position.x >= AREA_WIDTH
}

function updateState(state, time) {
  const dt = Math.min(1, (time - state.previousTime) / 1000)
  let scores
  let ball
  ball = bouncePaddle(state.ball, state.paddles.left, 1)
  ball = bouncePaddle(ball, state.paddles.right, -1)
  if (isGoal(state.ball)) {
    scores = updateScores(ball, state.scores)
    ball = initialiseBall()
  } else {
    scores = state.scores
    ball = bounceWalls(ball)
    ball = updateBall(ball, dt)
  }
  return {
    ...state,
    previousTime: time,
    ball: ball,
    paddles: {
      left: updatePaddle(state.paddles.left, dt),
      right: updatePaddle(state.paddles.right, dt),
    },
    scores: scores
  }
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

function drawScores(state, ctx) {
  ctx.font = '48px sans-serif'
  ctx.fillText(state.scores.left, 48, 48)
  ctx.fillText(state.scores.right, AREA_WIDTH - 48 * 2, 48)
}

function draw(state, ctx) {
  ctx.clearRect(0, 0, AREA_WIDTH, AREA_HEIGHT)
  drawScores(state, ctx)
  drawBall(state, ctx)
  drawPaddle(state.paddles.left, ctx)
  drawPaddle(state.paddles.right, ctx)
}

function addEventListeners(getState, updateState) {
  document.addEventListener('keydown', function (e) {
    const state = getState()
    switch (e.key) {
      case 's':
        state.paddles.left.velocity.y = PADDLE_SPEED
        updateState(state)
        break
      case 'w':
        state.paddles.left.velocity.y = -PADDLE_SPEED
        updateState(state)
        break
      case 'p':
        state.paddles.right.velocity.y = -PADDLE_SPEED
        updateState(state)
        break
      case ';':
        state.paddles.right.velocity.y = PADDLE_SPEED
        updateState(state)
        break
    }
  })
  document.addEventListener('keyup', function (e) {
    const state = getState()
    switch (e.key) {
      case 's':
      case 'w':
        state.paddles.left.velocity.y = 0
        updateState(state)
        break
      case 'p':
      case ';':
        state.paddles.right.velocity.y = 0
        updateState(state)
        break
    }
  })
}

function main() {
  let state = initialiseState(performance.now())
  const canvas = document.createElement('canvas')
  canvas.width = AREA_WIDTH
  canvas.height = AREA_HEIGHT
  const ctx = canvas.getContext('2d')
  function tick(time) {
    requestAnimationFrame(tick)
    state = updateState(state, time)
    draw(state, ctx)
  }
  document.getElementById('pong').append(canvas)
  addEventListeners(
    function () {
      return state
    },
    function (newState) {
      state = newState
    }
  )
  requestAnimationFrame(tick)
}
main()