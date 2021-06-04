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

  /** @type {{ [buf_id: string]: WebGLBuffer }} */
  static _buffers = {};

  /** @type {{ [mat_name: string]: number[][] }} */
  static _matrices = {};

  /** @type {Transform} */
  static _model = {
    translation: [0, 0, 0],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
  };

  /** @type {Transform} */
  static _camera = {
    translation: [10, 10, 20],
    scale: [1, 1, 1],
    rotation: [-30, 0, 0],
  };

  /**
   * @param {HTMLCanvasElement} canvas2D
   * @param {HTMLCanvasElement} canvasGL
   */
  static initialize(canvas2D, canvasGL) {
    Renderer._canvas2D = canvas2D;
    Renderer._2d = canvas2D.getContext('2d');

    Renderer._canvasGL = canvasGL;
    /** @type {WebGLRenderingContext} */
    const gl = WebGLUtils.setupWebGL(canvasGL);
    Renderer._gl = gl;

    if (!gl) {
      alert("WebGL isn't available");
      return;
    }

    gl.viewport(0, 0, canvasGL.width, canvasGL.height);
    gl.clearColor(0, 0, 0, 1);

    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    Renderer._program = program;

    gl.useProgram(program);

    Renderer._matrices.perspective = perspective(90, canvasGL.width / canvasGL.height, 0.1, 120);
    Renderer._updateGlobalMatrices();
    Renderer._initBuffers();

    Renderer.clear();
  }

  static _initBuffers() {
    const gl = Renderer._gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Renderer._getBuffer('indices'));
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(
        [
          [0, 1, 2, 0, 2, 3],
          [4, 5, 6, 4, 6, 7],
          [8, 9, 10, 8, 10, 11],
          [12, 13, 14, 12, 14, 15],
          [16, 17, 18, 16, 18, 19],
          [20, 21, 22, 20, 22, 23],
        ].flat()
      ),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, Renderer._getBuffer('a_position'));
    gl.bufferData(gl.ARRAY_BUFFER, GLOBAL_CONSTANTS.SHAPES.CUBE, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, Renderer._getBuffer('a_color'));
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [
          [1.0, 1.0, 1.0], // Front face: white
          [1.0, 0.0, 0.0], // Back face: red
          [0.0, 1.0, 0.0], // Top face: green
          [0.0, 0.0, 1.0], // Bottom face: blue
          [1.0, 1.0, 0.0], // Right face: yellow
          [1.0, 0.0, 1.0], // Left face: purple
        ].flatMap(c => [c, c, c, c].flat())
      ),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, Renderer._getBuffer('a_normal'));
    gl.bufferData(gl.ARRAY_BUFFER, GLOBAL_CONSTANTS.NORMALS.CUBE, gl.STATIC_DRAW);
  }

  static _updateGlobalMatrices() {
    Renderer._matrices.model = transformM4(Renderer._model);
    Renderer._matrices.camera = transformM4(Renderer._camera);
    Renderer._matrices.projection = mult(
      Renderer._matrices.perspective,
      inverse(Renderer._matrices.camera)
    );
  }

  static setGlobalUniforms() {
    const gl = Renderer._gl;
    const program = Renderer._program;
    const { model, projection } = Renderer._matrices;

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_modelView'), false, flatten(model));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_projection'), false, flatten(projection));
  }

  /**
   * Resets both 2D and 3D canvases.
   */
  static clear() {
    const gl = Renderer._gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    Renderer.with2DContext((ctx, { width, height }) => {
      ctx.clearRect(0, 0, width, height);
    });
  }

  /**
   * Draws the contents of both 2D and 3D canvases.
   */
  static render() {
    Renderer._updateGlobalMatrices();
    Renderer.setGlobalUniforms();
    Renderer.clear();
    Renderer._render3D();
    Renderer._registered2D.forEach(Renderer.with2DContext);
  }

  static _getBuffer(id) {
    if (!Renderer._buffers[id]) {
      Renderer._buffers[id] = Renderer._gl.createBuffer();
    }
    return Renderer._buffers[id];
  }

  /**
   * fuck it, ad-hoc 3D rendering
   */
  static _render3D() {
    const gl = Renderer._gl;
    const program = Renderer._program;

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      const [x, y] = Player.headPosition;

      gl.bindBuffer(gl.ARRAY_BUFFER, Renderer._getBuffer('a_position'));
      gl.bufferData(
        gl.ARRAY_BUFFER,
        GLOBAL_CONSTANTS.SHAPES.CUBE.map((c, i) => {
          switch (i % 3) {
            case 0:
              return c + x;
            case 1:
              return c;
            case 2:
              return c + y;
          }
        }),
        gl.STATIC_DRAW
      );

      const attrPos = gl.getAttribLocation(program, 'a_position');
      gl.vertexAttribPointer(attrPos, numComponents, type, normalize, stride, offset);
      gl.enableVertexAttribArray(attrPos);
    }

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      gl.bindBuffer(gl.ARRAY_BUFFER, Renderer._getBuffer('a_color'));

      const attrPos = gl.getAttribLocation(program, 'a_color');
      gl.vertexAttribPointer(attrPos, numComponents, type, normalize, stride, offset);
      gl.enableVertexAttribArray(attrPos);
    }

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, Renderer._getBuffer('a_normal'));

      const attrPos = gl.getAttribLocation(program, 'a_normal');
      gl.vertexAttribPointer(attrPos, numComponents, type, normalize, stride, offset);
      gl.enableVertexAttribArray(attrPos);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Renderer._getBuffer('indices'));

    {
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
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
