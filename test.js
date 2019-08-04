const expect = chai.expect

describe('initialise state', function () {
  it('should have the previous time', function () {
    const result = initialiseState(314)
    expect(result.previousTime).to.equal(314)
  })

  it('should have scores', function () {
    const result = initialiseState()
    expect(result.scores).to.deep.equal({
      left: 0,
      right: 0,
    })
  })

  it('should have a ball', function () {
    const result = initialiseState()
    expect(result.ball).to.deep.equal({
      radius: 5,
      velocity: {
        x: BALL_SPEED * Math.cos(INITIAL_BALL_ANGLE),
        y: BALL_SPEED * Math.sin(INITIAL_BALL_ANGLE),
      },
      position: {
        x: AREA_WIDTH / 2,
        y: AREA_HEIGHT / 2,
      }
    })
  })

  it('should have a left paddle', function () {
    const result = initialiseState()
    expect(result.paddles.left).to.deep.equal({
      velocity: {
        x: 0,
        y: 0,
      },
      position: {
        x: 10,
        y: AREA_HEIGHT / 2,
      },
      width: 5,
      height: AREA_HEIGHT / 5,
    })
  })

  it('should have a right paddle', function () {
    const result = initialiseState()
    expect(result.paddles.right).to.deep.equal({
      velocity: {
        x: 0,
        y: 0,
      },
      position: {
        x: AREA_WIDTH - 10,
        y: AREA_HEIGHT / 2,
      },
      width: 5,
      height: AREA_HEIGHT / 5,
    })
  })
})

describe('update state', function () {
  it('should update previous time', function () {
    const initialState = initialiseState(0)
    const result = updateState(initialState, 3)
    expect(result.previousTime).to.equal(3)
  })

  describe('the ball', function () {
    it('should update its position', function () {
      const initialState = initialiseState(0)
      const dt = 3
      const result = updateState(initialState, dt)
      const initialBall = initialState.ball;
      expect(result.ball).to.deep.equal({
        radius: initialBall.radius,
        velocity: initialBall.velocity,
        position: {
          x: initialBall.position.x + initialBall.velocity.x * dt / 1000,
          y: initialBall.position.y + initialBall.velocity.y * dt / 1000,
        }
      })
    })

    it('should bounce off the floor', function () {
      const initialState = initialiseState(0)
      initialState.ball.position.y = AREA_HEIGHT
      initialState.ball.velocity.y = 1
      const dt = 1
      const result = updateState(initialState, dt)
      expect(result.ball.position.y).to.be.lessThan(AREA_HEIGHT)
    })

    it('should bounce off the ceiling', function () {
      const initialState = initialiseState(0)
      initialState.ball.position.y = 0
      initialState.ball.velocity.y = -1
      const dt = 1
      const result = updateState(initialState, dt)
      expect(result.ball.position.y).to.be.greaterThan(0)
    })
  })

  describe('the left paddle', function () {
    it('should update its position', function () {
      const initialState = initialiseState(0)
      initialState.paddles.left.velocity.y = -1
      const dt = 3
      const result = updateState(initialState, dt)
      expect(result.paddles.left.position.y).to.equal(
        initialState.paddles.left.position.y + (-1 * dt/1000)
      )
    })
    it('should not go through the ceiling', function () {
      const initialState = initialiseState(0)
      initialState.paddles.left.position.y = initialState.paddles.left.height / 2
      initialState.paddles.left.velocity.y = -1
      const dt = 3
      const result = updateState(initialState, dt)
      expect(result.paddles.left.position.y).to.equal(initialState.paddles.left.height / 2)
    })
    it('should not go through the floor', function () {
      const initialState = initialiseState(0)
      initialState.paddles.left.position.y = AREA_HEIGHT - initialState.paddles.left.height / 2
      initialState.paddles.left.velocity.y = 1
      const dt = 3
      const result = updateState(initialState, dt)
      expect(result.paddles.left.position.y).to.equal(AREA_HEIGHT - initialState.paddles.left.height / 2)
    })
  })

  describe('the right paddle', function () {
    it('should update its position', function () {
      const initialState = initialiseState(0)
      initialState.paddles.right.velocity.y = -1
      const dt = 3
      const result = updateState(initialState, dt)
      expect(result.paddles.right.position.y).to.equal(
        initialState.paddles.right.position.y + (-1 * dt/1000)
      )
    })
    it('should not go through the ceiling', function () {
      const initialState = initialiseState(0)
      initialState.paddles.right.position.y = initialState.paddles.right.height / 2
      initialState.paddles.right.velocity.y = -1
      const dt = 3
      const result = updateState(initialState, dt)
      expect(result.paddles.right.position.y).to.equal(initialState.paddles.right.height / 2)
    })
    it('should not go through the floor', function () {
      const initialState = initialiseState(0)
      initialState.paddles.right.position.y = AREA_HEIGHT - initialState.paddles.right.height / 2
      initialState.paddles.right.velocity.y = 1
      const dt = 3
      const result = updateState(initialState, dt)
      expect(result.paddles.right.position.y).to.equal(AREA_HEIGHT - initialState.paddles.right.height / 2)
    })
  })

  describe('the goals', function () {
    it('should increase left\'s score if the ball hits the right goal', function () {
      const initialState = initialiseState(0)
      initialState.scores.left = 0
      initialState.ball.position.x = AREA_WIDTH
      const result = updateState(initialState, 3)
      expect(result.scores.left).to.equal(1)
    })

    it('should increase right\'s score if the ball hits the left goal', function () {
      const initialState = initialiseState(0)
      initialState.scores.right = 0
      initialState.ball.position.x = 0
      const result = updateState(initialState, 3)
      expect(result.scores.right).to.equal(1)
    })

    it('should put the ball back into the starting position', function () {
      const initialState = initialiseState(0)
      initialState.scores.right = 0
      initialState.ball.position.x = 0
      const result = updateState(initialState, 3)
      expect(result.ball.position).to.deep.equal({
        x: AREA_WIDTH/2,
        y: AREA_HEIGHT/2,
      })
    })
  })

  describe('the ball hitting the paddles', function () {
    it('should bounce off the left paddle', function () {
      const initialState = initialiseState(0)
      initialState.ball.position.x = initialState.paddles.left.position.x
      initialState.ball.position.y = initialState.paddles.left.position.y
      initialState.ball.velocity.x = -1
      const result = updateState(initialState, 3)
      expect(result.ball.velocity.x).to.equal(1)
    })

    it('should bounce off the right paddle', function () {
      const initialState = initialiseState(0)
      initialState.ball.position.x = initialState.paddles.right.position.x
      initialState.ball.position.y = initialState.paddles.right.position.y
      initialState.ball.velocity.x = 1
      const result = updateState(initialState, 3)
      expect(result.ball.velocity.x).to.equal(-1)
    })
  })
})