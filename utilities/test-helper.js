'use strict'

var test = require('tape')
var _ = require('lodash')
const QueryString = require('query-string')

const internals = {}

/**
 * Tests a given function (methodToTest) to verify that it's "model" parameter follows
 * the mongoose model format.
 * @param t: Parent test object.
 * @param methodToTest: The method being tested.
 * @param methodName: The name of the method being called.
 * @param parameters: A string array containing the parameter names for the method.
 * @param Log: A logging object.
 */
internals.testModelParameter = function(
  t,
  methodToTest,
  methodName,
  parameters,
  Log
) {
  if (t) {
    test = t.test
  }

  var modelIndex = parameters.indexOf('model')
  var logIndex = parameters.indexOf('Log')
  var paramCopy = {}

  parameters[logIndex] = Log

  test(
    methodName + " fails if model parameter isn't a mongoose model",
    function(t) {
      t.plan(10)

      var model = {}

      paramCopy = _.extend([], parameters)
      paramCopy[modelIndex] = model
      try {
        methodToTest.apply(null, paramCopy)
        t.fail('No error was thrown.')
      } catch (error) {
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('schema') > -1,
          "assertion message contains 'schema' text."
        )
      }

      model = {
        schema: {}
      }

      paramCopy = _.extend([], parameters)
      paramCopy[modelIndex] = model
      try {
        methodToTest.apply(null, paramCopy)
        t.fail('No error was thrown.')
      } catch (error) {
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('schema.paths') > -1,
          "assertion message contains 'schema.paths' text."
        )
      }

      model = {
        schema: {
          paths: {}
        }
      }

      paramCopy = _.extend([], parameters)
      paramCopy[modelIndex] = model
      try {
        methodToTest.apply(null, paramCopy)
        t.fail('No error was thrown.')
      } catch (error) {
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('schema.tree') > -1,
          "assertion message contains 'schema.tree' text."
        )
      }

      model = {
        schema: {
          paths: {},
          tree: {}
        }
      }

      paramCopy = _.extend([], parameters)
      paramCopy[modelIndex] = model
      try {
        methodToTest.apply(null, paramCopy)
        t.fail('No error was thrown.')
      } catch (error) {
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('routeOptions') > -1,
          "assertion message contains 'routeOptions' text."
        )
      }

      model = {
        schema: {
          paths: {
            field1: {},
            field2: {},
            field3: {},
            field4: {}
          },
          tree: {}
        },
        routeOptions: {}
      }

      paramCopy = _.extend([], parameters)
      paramCopy[modelIndex] = model
      try {
        methodToTest.apply(null, paramCopy)
        t.fail('No error was thrown.')
      } catch (error) {
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('options') > -1,
          "assertion message contains 'options' text."
        )
      }
    }
  )
}

/**
 * Mock hapi auth strategy for testing.
 * @param server
 * @param strategyName
 */
internals.mockStrategy = function(server, strategyName) {
  server.auth.scheme('mock', function(server, options) {
    return {
      authenticate: function(request, h) {
        return h.continue
      }
    }
  })

  server.auth.strategy(strategyName, 'mock')
}

/**
 * Takes normal request properties and creates an options object for a server injection.
 * @param request: Mock request object.
 * @returns {{method: *, url: (string|string), payload: *, credentials: (request.credentials|{scope}|{user}|{}), headers: (request.headers|{authorization})}}
 */
internals.mockInjection = function(request) {
  let fullUrl = request.url
  for (const key in request.params) {
    fullUrl = fullUrl.replace('{' + key + '}', request.params[key])
  }
  fullUrl = fullUrl + '?' + QueryString.stringify(request.query)

  const injectOptions = {
    method: request.method,
    url: fullUrl,
    payload: request.payload,
    credentials: request.credentials,
    headers: request.headers
  }

  return injectOptions
}

/**
 * Function to run a single test file.
 * Can be used with node cli. Ex: "node utilities/test-helper.js --test tests/model-helper.tests.js"
 * @param path: path to test file.
 */
internals.runTestFile = function(path) {
  if (!path) {
    if (process.argv.slice(2)[0] !== '--test') {
      return
    }
  }
  var pathToTestFile = path || process.argv.slice(3)[0]
  if (pathToTestFile && pathToTestFile !== 'test') {
    var gulp = require('gulp')
    var tape = require('gulp-tape')
    var tapColorize = require('tap-colorize')

    return gulp.src([pathToTestFile]).pipe(
      tape({
        reporter: tapColorize()
      })
    )
  }
}

module.exports = {
  testModelParameter: internals.testModelParameter,

  mockStrategy: internals.mockStrategy,

  mockInjection: internals.mockInjection,

  runTestFile: internals.runTestFile
}

internals.runTestFile()
