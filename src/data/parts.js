export const PARTS = [
  { id: 'outsideBody',  label: 'Outside Body',  description: 'Cabedal externo', defaultColor: '#ffffff' },
  { id: 'insideBody',   label: 'Inside Body',   description: 'Cabedal interno', defaultColor: '#f5f0e8' },
  { id: 'tongue',       label: 'Tongue',        description: 'Língua',          defaultColor: '#ffffff' },
  { id: 'heelStripe',   label: 'Heel Stripe',   description: 'Faixa do calcanhar', defaultColor: '#c0392b' },
  { id: 'lining',       label: 'Lining',        description: 'Forro interno',   defaultColor: '#ffffff' },
  { id: 'stitch',       label: 'Stitch',        description: 'Costuras',        defaultColor: '#222222' },
  { id: 'laces',        label: 'Laces',         description: 'Cadarços',        defaultColor: '#ffffff' },
  { id: 'eyelets',      label: 'Eyelets',       description: 'Ilhós',           defaultColor: '#aaaaaa' },
  { id: 'patchLogo',    label: 'Patch Logo',    description: 'Patch All Star',  defaultColor: '#ffffff' },
  { id: 'rubber',       label: 'Rubber',        description: 'Sola de borracha', defaultColor: '#f0ede0' },
  { id: 'racingStripe', label: 'Racing Stripe', description: 'Faixa lateral',   defaultColor: '#111111' },
]

export const PALETTES = {
  outsideBody:  ['#ffffff','#111111','#1a1a2e','#c0392b','#2471a3','#1e8449','#d4ac0d','#7d3c98','#e8d5b7','#f5a7b8','#2c3e50','#e74c3c'],
  insideBody:   ['#ffffff','#111111','#f0e6d3','#ffd6d6','#d6eaff','#d6ffd6','#fffbd6','#f0d6ff','#e8e8e8','#1a1a2e','#c0392b','#2471a3'],
  tongue:       ['#ffffff','#111111','#e8d5b7','#c0392b','#2471a3','#1e8449','#d4ac0d','#7d3c98','#f5a7b8','#1a1a2e','#e74c3c','#117a65'],
  heelStripe:   ['#c0392b','#111111','#ffffff','#2471a3','#1e8449','#d4ac0d','#7d3c98','#e74c3c','#1a1a2e','#f5a7b8','#117a65','#d35400'],
  lining:       ['#ffffff','#111111','#f0e6d3','#ffd6d6','#d6eaff','#fffbd6','#e8e8e8','#c0392b','#2471a3','#1e8449','#7d3c98','#1a1a2e'],
  stitch:       ['#222222','#ffffff','#c0392b','#2471a3','#d4ac0d','#1e8449','#7d3c98','#e8d5b7','#f5a7b8','#1a1a2e','#e74c3c','#117a65'],
  laces:        ['#ffffff','#111111','#c0392b','#2471a3','#d4ac0d','#1e8449','#7d3c98','#f5a7b8','#e8d5b7','#1a1a2e','#e74c3c','#117a65'],
  eyelets:      ['#aaaaaa','#c8a000','#111111','#ffffff','#c0392b','#2471a3','#d4ac0d','#1e8449','#7d3c98','#e8d5b7','#e74c3c','#1a1a2e'],
  patchLogo:    ['#ffffff','#111111','#c0392b','#2471a3','#d4ac0d','#1e8449','#7d3c98','#f5a7b8','#e8d5b7','#1a1a2e','#e74c3c','#117a65'],
  rubber:       ['#f0ede0','#e8e8e8','#111111','#c0392b','#2471a3','#d4ac0d','#1e8449','#7d3c98','#f5a7b8','#1a1a2e','#e74c3c','#117a65'],
  racingStripe: ['#111111','#c0392b','#2471a3','#ffffff','#d4ac0d','#1e8449','#7d3c98','#f5a7b8','#e8d5b7','#1a1a2e','#e74c3c','#117a65'],
}

export const VIEWS = {
  side:  { theta: 0.5,  phi: 1.25, r: 3.0 },
  front: { theta: 1.57, phi: 1.25, r: 3.0 },
  top:   { theta: 0.5,  phi: 0.4,  r: 3.0 },
  back:  { theta: -2.6, phi: 1.25, r: 3.0 },
}

export const DEFAULT_COLORS = Object.fromEntries(
  PARTS.map(p => [p.id, p.defaultColor])
)
