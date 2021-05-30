class Renderer {
  /** @type {HTMLCanvasElement} */
  static _canvas2D = null;
  /** @type {HTMLCanvasElement} */
  static _canvasGL = null;

  /** @type {CanvasRenderingContext2D} */
  static _2d = null;
  /** @type {WebGLRenderingContext} */
  static _gl = null;

  /** @type {((ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => void)[]} */
  static _registered2D = [];

  /** @type {WebGLProgram} */
  static _program = null;

  /** @type {{ [id: string]: () => GenericShape }} */
  static _toAttributesAndUniforms = {};

  /** @type {{ [id: string]: { [buf_id: string]: WebGLBuffer } }} */
  static _buffers = {};

  /** @type {{ [mat_name: string]: number[][] }} */
  static _matrices = {};

  /** @type {Transform} */
  static _model = {
    translation: [0, 0, 25],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
  };

  /** @type {Transform} */
  static _camera = {
    translation: [0, 0, 0],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
  };

  /**
   * @param {HTMLCanvasElement} canvas2D
   * @param {HTMLCanvasElement} canvasGL
   */
  static initialize(canvas2D, canvasGL) {
    Renderer._canvas2D = canvas2D;
    Renderer._2d = canvas2D.getContext('2d');

    Renderer._canvasGL = canvasGL;
    const gl = WebGLUtils.setupWebGL(canvasGL);
    Renderer._gl = gl;

    if (!gl) {
      alert("WebGL isn't available");
      return;
    }

    gl.viewport(0, 0, canvasGL.width, canvasGL.height);
    gl.clearColor(0, 0, 0, 1);

    Renderer._program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(Renderer._program);

    Renderer._matrices.model = transformM4(Renderer._model);
    Renderer._matrices.perspective = perspective(60, canvasGL.width / canvasGL.height, 1, 2000);
    Renderer._matrices.camera = transformM4(Renderer._camera.translation);
    Renderer._matrices.projection = mult(
      Renderer._matrices.perspective,
      inverse(Renderer._matrices.camera)
    );

    Renderer.clear();
  }

  static to_buffers(id) {
    const gl = Renderer._gl;
    const attrUnifGetter = Renderer._toAttributesAndUniforms[id];
    if (attrUnifGetter) {
      const { attributes = {}, uniforms = {} } = attrUnifGetter();

      if (!Renderer._buffers[id]) {
        Renderer._buffers[id] = [];
      }

      const buffers = Renderer._buffers[id];

      let vertexCount = 0;

      // Set up attributes
      for (const attr in attributes) {
        const { type, value } = attributes[attr];

        const a_attr = `a_${attr}`;
        if (!buffers[a_attr]) {
          buffers[a_attr] = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[a_attr]);
        const attrLoc = gl.getAttribLocation(Renderer._program, a_attr);
        gl.enableVertexAttribArray(attrLoc);
        gl.vertexAttribPointer(attrLoc, Number(type[0]), gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
        if (!vertexCount) {
          vertexCount = value.length / Number(type[0]);
        }
      }

      // Set up uniforms
      for (const unif in uniforms) {
        const { args = [], type } = uniforms[unif];
        const unifLoc = gl.getUniformLocation(Renderer._program, `u_${unif}`);
        switch (type) {
          case '1f':
            gl.uniform1f(unifLoc, ...args);
            break;
          case '1fv':
            gl.uniform1fv(unifLoc, ...args);
            break;
          case '2f':
            gl.uniform2f(unifLoc, ...args);
            break;
          case '2fv':
            gl.uniform2fv(unifLoc, ...args);
            break;
          case 'Matrix2fv':
            gl.uniformMatrix2fv(unifLoc, ...args);
            break;
          case '3f':
            gl.uniform3f(unifLoc, ...args);
            break;
          case '3fv':
            gl.uniform3fv(unifLoc, ...args);
            break;
          case 'Matrix3fv':
            gl.uniformMatrix3fv(unifLoc, ...args);
            break;
          case '4f':
            gl.uniform4f(unifLoc, ...args);
            break;
          case '4fv':
            gl.uniform4fv(unifLoc, ...args);
            break;
          case 'Matrix4fv':
            gl.uniformMatrix4fv(unifLoc, ...args);
            break;
          default: {
          }
        }
      }

      return vertexCount;
    }
  }

  /**
   * Resets both 2D and 3D canvases.
   */
  static clear() {
    const gl = Renderer._gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    Renderer.with2DContext((ctx, { width, height }) => {
      ctx.clearRect(0, 0, width, height);
    });
  }

  /**
   * Draws the contents of both 2D and 3D canvases.
   */
  static render() {
    Renderer.clear();
    Renderer._registered2D.forEach(Renderer.with2DContext);
    for (const id in Renderer._toAttributesAndUniforms) {
      const vertices = Renderer.to_buffers(id);
      Renderer._gl.drawArrays(Renderer._gl.TRIANGLE_FAN, 0, vertices);
    }
  }

  /**
   * Registers a 2D drawing function to call while rendering.
   *
   * @param {(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => void} fn
   * @param {number?} order
   */
  static register2D(fn, order = null) {
    if (Number.isNaN(order)) {
      Renderer._registered2D.push(fn);
    } else {
      Renderer._registered2D.splice(order, 0, fn);
    }
  }

  /**
   * Executes the given function with the current rendering context and canvas.
   * @param {(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => void} fn
   */
  static with2DContext(fn) {
    fn(Renderer._2d, Renderer._canvas2D);
  }
}
