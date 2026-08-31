import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { primaryCliGolden, secondaryCliGolden } from './fixtures/scale-goldens'

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

describe('generate-scale CLI', () => {
  it('matches the Tonal Foundry primary scale output', () => {
    const cli = runCli([
      '--keys',
      primaryCliGolden.keys.join(','),
      '--output',
      primaryCliGolden.output,
      '--semantic',
      'primary',
    ])

    expect(cli).toEqual(primaryCliGolden.payload)
  })

  it('matches the Tonal Foundry secondary scale output', () => {
    const cli = runCli([
      '--keys',
      secondaryCliGolden.keys.join(','),
      '--output',
      secondaryCliGolden.output,
      '--semantic',
      'secondary',
    ])

    expect(cli).toEqual(secondaryCliGolden.payload)
  })
})
