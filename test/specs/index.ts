import {expect} from 'chai'
import {createMockFunction, trackCalls} from 'mock-functions'

describe('createMockFunction', () => {
  it('should be possible to specify a faked return value', () => {
    const mock = createMockFunction().returns('test')

    expect(mock()).to.equal('test')
  })

  it('should be possible to specify a faked return value for specific calls', () => {
    const mock = createMockFunction().returns(0, 0).returns(1, 1)

    expect(mock()).to.equal(0)
    expect(mock()).to.equal(1)
    expect(mock()).to.be.undefined
  })

  it('should be possible to specify a faked return value for specific arguments', () => {
    const mock = createMockFunction().returns([1, 1], 2).returns([2, 2], 4)

    expect(mock()).to.be.undefined
    expect(mock(1, 1)).to.equal(2)
    expect(mock(2, 2)).to.equal(4)
  })

  it('should be possible to combine return value for specific calls and arguments', () => {
    const mock = createMockFunction().returns(1, -1).returns([1], 1)

    expect(mock(1)).to.equal(1)
    expect(mock(1)).to.equal(-1)
    expect(mock(1)).to.equal(1)
  })

  it('should prioritize return instructions by order given', () => {
    const mock = createMockFunction().returns([1], 1).returns(1, -1)

    expect(mock(1)).to.equal(1)
    expect(mock(1)).to.equal(1)
    expect(mock(1)).to.equal(1)
  })

  it('should track calls', () => {
    const mock = createMockFunction()

    mock(2)
    mock(1, 2, 3)

    expect(mock.calls.length).to.equal(2)
    expect(mock.calls[0].args).to.deep.equal([2])
    expect(mock.calls[1].args).to.deep.equal([1, 2, 3])
  })
})

describe('trackCalls', () => {

  it('should return pass the context to the inner function', () => {
    const mock = trackCalls(function () {
      expect(this).to.deep.equal({foo: 'bar'})
    })

    mock.call({foo: 'bar'})
  })

  it('should return pass the arguments to the inner function', () => {
    const mock = trackCalls((a, b) => {
      expect(a).to.equal(1)
      expect(b).to.equal(2)
    })

    mock(1, 2)
  })

  it('should return what the inner function returns', () => {
    const mock = trackCalls(() => 5)

    expect(mock()).to.equal(5)
  })

  it('should track passed arguments', () => {
    const mock = trackCalls(() => {})

    mock(2)
    mock(1, 2, 3)

    expect(mock.calls.length).to.equal(2)
    expect(mock.calls[0].args).to.deep.equal([2])
    expect(mock.calls[1].args).to.deep.equal([1, 2, 3])
  })

  it('should this context', () => {
    const mock = trackCalls(() => {})

    mock(2)
    mock.call({foo: 'bar'}, 1, 2, 3)

    expect(mock.calls.length).to.equal(2)
    expect(mock.calls[0].context).to.be.undefined
    expect(mock.calls[1].context).to.deep.equal({foo: 'bar'})
  })
})
