export const targets = [
  100, 97.5, 95, 92.5, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25,
  20, 15, 10, 5, 0,
] as const

export const weights = [
  '000',
  '025',
  '050',
  '075',
  '100',
  '150',
  '200',
  '250',
  '300',
  '350',
  '400',
  '450',
  '500',
  '550',
  '600',
  '650',
  '700',
  '750',
  '800',
  '850',
  '900',
  '950',
  '999',
] as const

export const semantics = [
  'primary',
  'secondary',
  'tertiary',
  'positive',
  'negative',
  'highlight',
  'attention',
  'info',
  'system',
  'neutral',
] as const

export type TargetValue = (typeof targets)[number]
export type WeightValue = (typeof weights)[number]
export type SemanticValue = (typeof semantics)[number]
