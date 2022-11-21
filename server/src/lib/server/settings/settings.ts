/**
 *
 */
export interface ServerSettings {}

export namespace ServerSettings {
  export function is(value: any): value is ServerSettings {
    return true;
  }

  /**
   *
   * @param value
   * @returns
   */
  export function clone(value: ServerSettings): ServerSettings {
    return Object.assign({}, value);
  }

  export function createDefaultSettings(): ServerSettings {
    return {};
  }
}
