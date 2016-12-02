// @flow
import autobind from 'autobind-decorator'
import Plugin from './plugin'
import { find, append, forEach } from 'ramda'
import { findByProp } from 'ramdasauce'

/**
 * Loads plugins an action through the gauntlet.
 */
@autobind
class Runtime {

  plugins = []

  /**
   * Adds a plugin.
   */
  addPlugin (plugin: Plugin): void {
    this.plugins = append(plugin, this.plugins)
  }

  /**
   * Loads a plugin from a directory.
   */
  addPluginFromDirectory (directory: string): Plugin|void {
    const plugin = new Plugin()
    plugin.loadFromDirectory(directory)
    this.addPlugin(plugin)
    return plugin
  }

  /**
   * Returns a list of commands for printing
   */
  listCommands () {
    const commands = []
    const eachPlugin = plugin => {
      const eachCommand = command => {
        commands.push({
          plugin: plugin.namespace,
          command: command.name,
          description: command.description
        })
      }
      forEach(eachCommand, plugin.commands)
    }
    forEach(eachPlugin, this.plugins)
    return commands
  }

  /**
   * Runs a command.
   */
  async run (
    namespace: string,
    args: string = '',
    opts: any = {}
  ): any {
    // find the plugin
    const plugin = findByProp('namespace', namespace || '', this.plugins)
    if (!plugin) return

    // find the command
    const command = find(x => x.name === args, plugin.commands)
    if (!command) return

    // run the command
    const result = await command.run()
    return result
  }
}

export default Runtime
