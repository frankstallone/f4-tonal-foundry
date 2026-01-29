import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { BuildScaleOptions } from '../types'
import { buildScale } from '../scale'
import { seedPalette } from '../../lib/palettes'

const runCli = (args: string[]) => {
  const bin = process.platform === 'win32' ? 'tsx.cmd' : 'tsx'
  const tsxPath = path.resolve(process.cwd(), 'node_modules', '.bin', bin)
  const result = spawnSync(tsxPath, ['scripts/generate-scale.ts', ...args], {
    encoding: 'utf8',
    cwd: process.cwd(),
  })

  if (result.status !== 0) {
    const message = ['CLI failed', result.stderr?.trim(), result.stdout?.trim()]
      .filter(Boolean)
      .join('\n')
    throw new Error(message)
  }

  return JSON.parse(result.stdout)
}

const buildExpected = (
  semantic: string,
  keys: string[],
  options: BuildScaleOptions,
) => {
  const scale = buildScale({ id: 1, semantic, keys }, options)
  return {
    semantic: scale.semantic,
    destinationSpace: scale.destinationSpace,
    tweenSpace: scale.tweenSpace,
    swatches: scale.swatches.map((swatch) => ({
      weight: swatch.weight,
      destination: swatch.value.destination,
      hex: swatch.hex,
      outOfSrgb: swatch.isOutOfGamut ?? false,
    })),
  }
}

describe('generate-scale CLI', () => {
  it('matches the Prism primary scale output', () => {
    const primary = seedPalette.seed.find((item) => item.semantic === 'primary')
    if (!primary || !primary.keys) {
      throw new Error('Missing Prism primary seed')
    }

    const cli = runCli([
      '--keys',
      primary.keys.join(','),
      '--output',
      'oklch',
      '--semantic',
      'primary',
    ])

    const expected = buildExpected('primary', primary.keys, {
      destinationSpace: 'oklch',
      tweenSpace: 'oklch',
    })

    expect(cli).toEqual(expected)
  })

  it('matches the Prism secondary scale output', () => {
    const secondary = seedPalette.seed.find(
      (item) => item.semantic === 'secondary',
    )
    if (!secondary || !secondary.keys) {
      throw new Error('Missing Prism secondary seed')
    }

    const cli = runCli([
      '--keys',
      secondary.keys.join(','),
      '--output',
      'srgb',
      '--semantic',
      'secondary',
    ])

    const expected = buildExpected('secondary', secondary.keys, {
      destinationSpace: 'srgb',
      tweenSpace: 'oklch',
    })

    expect(cli).toEqual(expected)
  })
})
