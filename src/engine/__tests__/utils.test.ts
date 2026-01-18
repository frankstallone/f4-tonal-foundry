import { describe, expect, it } from 'vitest'
import { luminanceToWeight } from '../utils'

describe('luminanceToWeight', () => {
  it('maps boundary values to expected weights', () => {
    expect(luminanceToWeight(100)).toBe('000')
    expect(luminanceToWeight(50)).toBe('500')
    expect(luminanceToWeight(0)).toBe('999')
  })
})
