const GLOBAL_CONSTANTS = {
  FPS: 60,
  TILE_SIZE: 30,
  HTML_ELEMENTS: {
    get BLUR_OVERLAY() {
      return document.getElementById('blur-overlay');
    },
    /** @returns {HTMLCanvasElement} */
    get CANVAS() {
      return document.getElementById('canvas');
    },
    get TERMINAL() {
      return document.getElementById('terminal');
    },
  },
};
