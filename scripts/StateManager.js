class StateManager {
  static initialize() {
    const {
      HTML_ELEMENTS: { CANVAS_GL, CANVAS_2D },
      TILES_X,
      TILES_Y,
      TILE_SIZE,
    } = GLOBAL_CONSTANTS;
    Time.initialize();

    InputManager.initialize({
      up: 'KeyW',
      left: 'KeyA',
      down: 'KeyS',
      right: 'KeyD',
    });

    Renderer.initialize(CANVAS_2D, CANVAS_GL);
    Renderer.register2D((ctx, c) => {
      ctx.fillStyle = 'red';
      const [foodX, foodY] = StateManager.foodPos;
      ctx.fillRect(foodX * TILE_SIZE + 5, foodY * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    });

    Player.initialize();
    Renderer.register2D(Player.render);

    StateManager.foodPos = [
      Math.floor(Math.random() * TILES_X),
      Math.floor(Math.random() * TILES_Y),
    ];
    StateManager.start();

    window.addEventListener('blur', StateManager.pause, { once: true });
  }

  static start(event) {
    if (!StateManager._updateHandle && StateManager.canStart) {
      StateManager._updateHandle = setInterval(StateManager.update, 1000 / GLOBAL_CONSTANTS.FPS);
    }
    if (event) {
      GLOBAL_CONSTANTS.HTML_ELEMENTS.BLUR_OVERLAY.style.visibility = 'hidden';
      window.addEventListener('blur', StateManager.pause, { once: true });
    }
  }

  static pause(event) {
    InputManager.clearInputState();
    clearInterval(StateManager._updateHandle);
    StateManager._updateHandle = null;
    if (event) {
      GLOBAL_CONSTANTS.HTML_ELEMENTS.BLUR_OVERLAY.style.visibility = 'visible';
      window.addEventListener('focus', StateManager.start, { once: true });
    }
  }

  static gameOver() {
    StateManager.canStart = false;
    StateManager.pause();
    Renderer.clear();
    Renderer.with2DContext((ctx, c) => {
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'monospace';
      ctx.scale(5, 5);
      ctx.fillText('GAME OVER', c.width / 10, c.height / 10, c.width / 5);
    });
  }

  static update() {
    const {
      HTML_ELEMENTS: { CANVAS_2D },
      TILES_X,
      TILES_Y,
    } = GLOBAL_CONSTANTS;

    const startTime = new Date();

    const axes = {
      x: InputManager.getAxis('x'),
      y: InputManager.getAxis('y'),
    };

    if (axes.x && !Player.velocity[0]) {
      Player.nextVelocity = [axes.x, 0];
    } else if (axes.y && !Player.velocity[1]) {
      Player.nextVelocity = [0, -axes.y];
    }

    if (!((Time.frame - 1) % 15)) {
      StateManager.grid = {};
      Player.move();
      const [headX, headY] = Player.headPosition;
      if (headX < 0 || headY < 0 || headX >= TILES_X || headY >= TILES_Y) {
        StateManager.gameOver();
        return;
      }

      let gotFood = false;
      for (const [x, y] of Player.positions) {
        if (StateManager.grid[`${x},${y}`]) {
          StateManager.gameOver();
          return;
        } else if (StateManager.foodPos[0] === x && StateManager.foodPos[1] === y) {
          gotFood = true;
        }
        StateManager.grid[`${x},${y}`] = true;
      }

      if (gotFood) {
        let newFoodX = Math.floor(Math.random() * TILES_X);
        let newFoodY = Math.floor(Math.random() * TILES_Y);
        while (StateManager.grid[`${newFoodX},${newFoodY}`]) {
          newFoodX = Math.floor(Math.random() * TILES_X);
          newFoodY = Math.floor(Math.random() * TILES_Y);
        }
        StateManager.foodPos = [newFoodX, newFoodY];
        Player.size++;
      }
    }

    const boardStr = [...new Array(TILES_Y)].map((_, row) => {
      const rowStr = [];
      for (let col = 0; col < TILES_X; col++) {
        if (StateManager.grid[`${col},${row}`]) {
          rowStr.push('#');
        } else if (StateManager.foodPos[0] === col && StateManager.foodPos[1] === row) {
          rowStr.push('@');
        } else {
          rowStr.push(' ');
        }
      }
      return rowStr.join(' ');
    });

    const joystickStr = [];
    for (let i = 1; i >= -1; i--) {
      if (i === axes.y) {
        joystickStr.push(['O--', '-O-', '--O'][axes.x + 1]);
      } else {
        joystickStr.push('---');
      }
    }

    GLOBAL_CONSTANTS.HTML_ELEMENTS.TERMINAL.innerText = `${boardStr
      .map(s => `| ${s} |`)
      .join('\n')}\n\n${joystickStr.join('\n')}`;

    Renderer.render();
    const endTime = new Date();
    GLOBAL_CONSTANTS.HTML_ELEMENTS.TERMINAL.innerText += `\n${endTime - startTime} ms`;

    Time.tick();
  }
}

StateManager._updateHandle = null;

StateManager.canStart = true;

StateManager.grid = {};

StateManager.foodPos = [0, 0];
