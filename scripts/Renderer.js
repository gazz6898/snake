class Renderer {
  /** @type {HTMLCanvasElement} */
  static _canvas = null;

  /** @type {CanvasRenderingContext2D} */
  static _canvasContext = null;

  /**
   * @param {HTMLCanvasElement} canvas
   */
  static initialize(canvas) {
    Renderer._canvas = canvas;
    Renderer._canvasContext = canvas.getContext('2d');
    Renderer.clear();
  }

  static clear() {
    const { width, height } = Renderer._canvas;
    Renderer._canvasContext.clearRect(0, 0, width, height);
  }

  static render() {
    const { TILE_SIZE } = GLOBAL_CONSTANTS;
    Renderer.clear();
    Renderer.withContext((ctx, c) => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.fillStyle = 'red';
      const [foodX, foodY] = StateManager.foodPos;
      ctx.fillRect(foodX + 5, foodY + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    });

    Player.render();
  }

  /**
   * Executes the given function with the current rendering context and canvas.
   * @param {(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => *} fn
   * @returns {*}
   */
  static withContext(fn) {
    return fn(Renderer._canvasContext, Renderer._canvas);
  }
}
