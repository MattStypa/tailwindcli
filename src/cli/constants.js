import path from 'path'

export const cli = 'tailwindcli' // Core: Replace with 'tailwind'
export const defaultConfigFile = 'tailwind.js'
export const configStubFile = path.resolve(
  __dirname,
  '../../node_modules/tailwindcss/defaultConfig.stub.js' // Core: Replace with '../../defaultConfig.stub.js'
)
