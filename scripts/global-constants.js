/**
 * @typedef {{
 *   translation: number[],
 *   scale: number[],
 *   rotation: number[]
 * }} Transform
 */

const trace = x => console.log(x) ?? x;

const transformM4 = ({ translation, scale, rotation }) => {
  const mats = [];
  if (translation && (translation[0] || translation[1] || translation[2])) {
    mats.push(translate(...translation));
  }
  if (scale && (scale[0] || scale[1] || scale[2])) {
    mats.push(scalem(...scale));
  }
  if (rotation) {
    if (rotation[0]) {
      mats.push(rotate(rotation[0], [1, 0, 0]));
    }
    if (rotation[1]) {
      mats.push(rotate(rotation[1], [0, 1, 0]));
    }
    if (rotation[2]) {
      mats.push(rotate(rotation[2], [0, 0, 1]));
    }
  }

  const [m = mat4(), ...ms] = mats;
  return ms.reduce(mult, m);
};

const GLOBAL_CONSTANTS = {
  FPS: 60,

  SHAPES: {
    CUBE: new Float32Array([
      // Front face
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

      // Back face
      -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

      // Top face
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

      // Right face
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ]),
  },
  NORMALS: ['X', 'Y', 'Z'].reduce((obj, axis, i) => {
    obj[`${axis}+`] = new Float32Array([0, 0, 0]);
    obj[`${axis}+`][i] = 1;
    obj[`${axis}-`] = new Float32Array([0, 0, 0]);
    obj[`${axis}-`][i] = -1;
    return obj;
  }, {}),

  TILES_X: 20,
  TILES_Y: 10,
  get TILE_SIZE() {
    return (
      (this.HTML_ELEMENTS.CANVAS_2D.width / this.TILES_X +
        this.HTML_ELEMENTS.CANVAS_2D.height / this.TILES_Y) /
      2
    );
  },

  HTML_ELEMENTS: {
    get BLUR_OVERLAY() {
      return document.getElementById('blur-overlay');
    },
    /** @returns {HTMLCanvasElement} */
    get CANVAS_GL() {
      return document.getElementById('canvas-gl');
    },

    /** @returns {HTMLCanvasElement} */
    get CANVAS_2D() {
      return document.getElementById('canvas-2d');
    },

    get TERMINAL() {
      return document.getElementById('terminal');
    },
  },
};

GLOBAL_CONSTANTS.NORMALS.CUBE = new Float32Array(
  [
    GLOBAL_CONSTANTS.NORMALS['Z+'],
    GLOBAL_CONSTANTS.NORMALS['Z-'],
    GLOBAL_CONSTANTS.NORMALS['Y+'],
    GLOBAL_CONSTANTS.NORMALS['Y-'],
    GLOBAL_CONSTANTS.NORMALS['X+'],
    GLOBAL_CONSTANTS.NORMALS['X-'],
  ].flatMap(n => [...n, ...n, ...n, ...n])
);
