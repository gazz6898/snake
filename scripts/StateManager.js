class StateManager {
  static initialize() {
    const {
      HTML_ELEMENTS: { CANVAS },
      TILE_SIZE,
    } = GLOBAL_CONSTANTS;
    Time.initialize();

    InputManager.initialize({
      up: 'KeyW',
      left: 'KeyA',
      down: 'KeyS',
      right: 'KeyD',
    });

    Renderer.initialize(CANVAS);

    Player.initialize();

    StateManager.foodPos = [
      Math.round((Math.random() * (CANVAS.width - TILE_SIZE)) / TILE_SIZE) * TILE_SIZE,
      Math.round((Math.random() * (CANVAS.height - TILE_SIZE)) / TILE_SIZE) * TILE_SIZE,
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
    Renderer.withContext((ctx, c) => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, c.width, c.height);
    });
    Player.render();
    Renderer.withContext((ctx, c) => {
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
      HTML_ELEMENTS: { CANVAS },
      TILE_SIZE,
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
      if (headX < 0 || headY < 0 || headX >= CANVAS.width || headY >= CANVAS.height) {
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
        let newFoodX =
          Math.round((Math.random() * (CANVAS.width - TILE_SIZE)) / TILE_SIZE) * TILE_SIZE;
        let newFoodY =
          Math.round((Math.random() * (CANVAS.height - TILE_SIZE)) / TILE_SIZE) * TILE_SIZE;
        while (StateManager.grid[`${newFoodX},${newFoodY}`]) {
          newFoodX =
            Math.round((Math.random() * (CANVAS.width - TILE_SIZE)) / TILE_SIZE) * TILE_SIZE;
          newFoodY =
            Math.round((Math.random() * (CANVAS.height - TILE_SIZE)) / TILE_SIZE) * TILE_SIZE;
        }
        StateManager.foodPos = [newFoodX, newFoodY];
        Player.size++;
      }
    }

    const joystick = [];
    for (let i = 1; i >= -1; i--) {
      if (i === axes.y) {
        joystick.push(['O--', '-O-', '--O'][axes.x + 1]);
      } else {
        joystick.push('---');
      }
    }

    GLOBAL_CONSTANTS.HTML_ELEMENTS.TERMINAL.innerText = joystick.join('\n');

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
