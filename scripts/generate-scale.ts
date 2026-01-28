import { buildScale } from '../src/engine/scale'
import type { BuildScaleOptions } from '../src/engine/types'

type OutputSpace = 'auto' | 'srgb' | 'oklch' | 'p3'
type OutputFormat = 'json' | 'table'

const args = process.argv.slice(2)

const readFlag = (flag: string) => {
  const index = args.indexOf(`--${flag}`)
  return index >= 0 ? args[index + 1] : undefined
}

const readMultiFlag = (flag: string) => {
  const values: string[] = []
  args.forEach((arg, index) => {
    if (arg === `--${flag}` && args[index + 1]) {
      values.push(args[index + 1])
    }
  })
  return values
}

const keysInput = readFlag('keys')
const keyFlags = readMultiFlag('key')
const keys = [...(keysInput ? keysInput.split(',') : []), ...keyFlags]
  .map((value) => value.trim())
  .filter(Boolean)

if (!keys.length) {
  console.error(
    'Usage: npm run scales -- --keys "#3366ff,oklch(0.7 0.2 200)" --output oklch',
  )
  process.exit(1)
}

const output = (readFlag('output') as OutputSpace) ?? 'auto'
const tweenSpace = readFlag('tween') ?? 'oklch'
const semantic = readFlag('semantic') ?? 'scale'
const format = (readFlag('format') as OutputFormat) ?? 'json'

const options: BuildScaleOptions = {
  tweenSpace,
  destinationSpace: output === 'auto' ? undefined : output,
}

const scale = buildScale({ id: 1, semantic, keys }, options)

const payload = {
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

if (format === 'table') {
  console.table(payload.swatches)
} else {
  console.log(JSON.stringify(payload, null, 2))
}
