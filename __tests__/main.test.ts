import {expect, test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  const toolPath = 123
  expect(toolPath).toEqual(123)
})
