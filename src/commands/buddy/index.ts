import type { Command } from '../../commands.js'

const buddy: Command = {
  type: 'local-jsx',
  name: 'buddy',
  description: 'Manage your AI companion',
  load: () => import('./buddy.js'),
}

export default buddy
