const expect = chai.expect

const AREA_HEIGHT = 500;
const AREA_WIDTH = 500;

describe('initialise state', function () {
  it('should have an area', function () {
    const result = initialiseState()
    expect(result.area).to.deep.equal({
      width: AREA_WIDTH,
      height: AREA_HEIGHT,
    })
  })

  it('should have a ball', function () {
    const result = initialiseState()
    expect(result.ball).to.deep.equal({
      radius: 5,
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