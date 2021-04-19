class InputManager {
  static _inputStateMap = {};
  static _inputMappings = {};

  static initialize(inputs = {}) {
    InputManager._inputStateMap = {};
    InputManager._inputMappings = Object.fromEntries(
      Object.keys(inputs).map(name => [inputs[name], name])
    );

    window.addEventListener('keydown', event => {
      const mapping = InputManager._inputMappings[event?.code];
      if (mapping) InputManager._inputStateMap[mapping] = true;
    });

    window.addEventListener('keyup', event => {
      const mapping = InputManager._inputMappings[event?.code];
      if (mapping) InputManager._inputStateMap[mapping] = false;
    });

    window.addEventListener('contextmenu', InputManager.clearInputState);
  }

  static clearInputState() {
    InputManager._inputStateMap = {};
  }

  /**
   *
   * @param {'x' | 'y'} axis
   * @returns
   */
  static getAxis(axis) {
    switch (axis) {
      case 'x':
        return (InputManager._inputStateMap.right ?? 0) - (InputManager._inputStateMap.left ?? 0);
      case 'y':
        return (InputManager._inputStateMap.up ?? 0) - (InputManager._inputStateMap.down ?? 0);
      default:
        return 0;
    }
  }
}
