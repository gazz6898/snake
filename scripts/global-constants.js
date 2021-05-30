/** @typedef {'1f' | '1fv' | '2f' | '2fv' | '3f' | '3fv' | '4f' | '4fv'} AttrType */
/** @typedef {AttrType | 'Matrix2fv' | 'Matrix3fv' | 'Matrix4fv' } UnifType */

/**
 * @typedef {{
 *   attributes: {
 *     [attr_name: string]: {
 *       type: AttrType,
 *       value: Float32Array,
 *     },
 *   },
 *   uniforms: {
 *     [unif_name: string]: {
 *       args: [...*, Float32Array],
 *       type: UnifType,
 *     },
 *   },
 * }} GenericShape
 */

/**
 * @typedef {{
 *   translation: number[],
 *   scale: number[],
 *   rotation: number[]
 * }} Transform
 */

const trace = x => console.log(x) ?? x;

const transformM4 = ({ translation = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }) =>
  [
    translate(...translation),
    scalem(...scale),
    rotate(rotation[0], [1, 0, 0]),
    rotate(rotation[1], [0, 1, 0]),
    rotate(rotation[2], [0, 0, 1]),
  ].reduce(mult, mat4());

const GLOBAL_CONSTANTS = {
  FPS: 60,

  SHAPES: {
    RECT: new Float32Array(
      [
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 0, 1],
        [0, 1, 0, 1],
      ].flat()
    ),
  },

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
