export interface StandardError {
  /**
   * Http error status
   * @example 400
   */
  httpStatus?: number

  /**
   * Some backends name their errors
   */
  name: string

  /**
   * error message, usually "human readable" version
   * of the error presented to the user
   */
  message: string

  /**
   * Any additional details related to this error
   * this can be helpful for gathering more
   * information around what went wrong.
   */
  details?: Record<string, any>
}

export type StandardErrors = StandardError[]
