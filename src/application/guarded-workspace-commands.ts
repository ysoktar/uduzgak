/** Recover from command errors at a single application boundary. */
export function guardWorkspaceCommands<T extends object>(
  commands: T,
  reportError: (message: string | null) => void,
): T {
  return new Proxy(commands, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (typeof value !== 'function') return value
      return (...args: unknown[]) => {
        try {
          const result = (value as (...callArgs: unknown[]) => unknown)(...args)
          reportError(null)
          return result
        } catch (error) {
          reportError(error instanceof Error ? error.message : 'Workspace command failed')
          return undefined
        }
      }
    },
  })
}
