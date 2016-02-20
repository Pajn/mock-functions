'use strict'

export interface TrackingFunction {
  (...args): any
  calls: Array<{context: any, args: any[]}>
}

export interface MockFunction extends TrackingFunction {
  /**
   * Default return value, return this id no other return specified for this call.
   */
  returns(returnValue): this
  /**
   * Returns specified value if the arguments matches the passed args array.
   */
  returns(args: any[], returnValue): this
  /**
   * Returns specified value on the nth call.
   */
  returns(callCount: number, returnValue): this
}

/**
 * Wraps the passed function to track its calls.
 *
 * All calls are stored in an array on a calls property.
 * Every call is an object with a context and args property.
 */
export function trackCalls(fn) {
  const calls = []

  const wrap = function() {
    calls.push({
      args: Array.prototype.slice.call(arguments),
      context: this,
    })

    return fn.apply(this, arguments)
  } as TrackingFunction

  wrap.calls = calls

  return wrap
}

/**
 * Creates a function that is set up to track calls and can also be configured to return
 * defferent values for different calls.
 */
export function createMockFunction() {
  let defaultReturnValue
  let calls = 0
  const returnValues = []

  const mock = trackCalls(function () {
    const toReturn = returnValues.find(returnValue =>
      calls === returnValue.calls || (
        returnValue.args &&
        arguments.length === returnValue.args.length &&
        returnValue.args.every((arg, index) => arg === arguments[index])
      )
    ) || defaultReturnValue

    calls++

    return toReturn && toReturn.returnValue
  }) as MockFunction

  mock.returns = function (args, returnValue) {
    if (arguments.length === 1) {
      defaultReturnValue = {returnValue: args}
    } else if (Array.isArray(args)) {
      returnValues.push({
        args,
        returnValue,
      })
    } else if (typeof args === 'number') {
      returnValues.push({
        calls: args,
        returnValue,
      })
    }

    return mock
  } as any

  return mock
}
