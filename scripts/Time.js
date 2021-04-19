class Time {
  static initialize() {
    Time.time = 0;
    Time.deltaTime = 1 / GLOBAL_CONSTANTS.FPS;
    Time.timeStep = 1;
  }

  static get frame() {
    return Math.round(GLOBAL_CONSTANTS.FPS * (Time.time - Math.floor(Time.time)));
  }

  static tick() {
    Time.time += Time.timeStep * Time.deltaTime;
  }
}

Time.time = 0;
Time.deltaTime = 1 / GLOBAL_CONSTANTS.FPS;
Time.timeStep = 1;
