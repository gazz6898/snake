class Player {
  static initialize() {
    Player.size = 4;
    Player.positions = [[0, 0]];
    Player.velocity = [1, 0];
    Player.nextVelocity = [1, 0];
  }

  static get headPosition() {
    return Player.positions[0] ?? [0, 0];
  }

  static move() {
    Player.velocity = Player.nextVelocity;
    const [x, y] = Player.headPosition;
    const [dx, dy] = Player.velocity;

    const newPosition = [x + dx, y + dy];
    while (Player.size && Player.positions.length >= Player.size) {
      Player.positions.pop();
    }
    Player.positions.unshift(newPosition);
  }

  /** @returns {GenericShape} */
  static toAttributesAndUniforms() {
    return {
      attributes: {
        position: {
          type: '4fv',
          value: new Float32Array(
            Player.positions
              .flatMap(([x, y]) => mult(translate(x, y, 0), mat4(...GLOBAL_CONSTANTS.SHAPES.RECT)))
              .flat()
          ),
        },
        color: {
          type: '4fv',
          value: new Float32Array(Player.positions.flatMap(() => [0, 1, 0, 1])),
        },
      },
      uniforms: {
        modelMatrix: {
          args: [false, flatten(Renderer?._matrices?.model)],
          type: 'Matrix4fv',
        },
        projectionMatrix: {
          args: [false, flatten(Renderer?._matrices?.projection)],
          type: 'Matrix4fv',
        },
      },
    };
  }

  static render(ctx, c) {
    const { TILE_SIZE } = GLOBAL_CONSTANTS;
    const [headPos, ...tail] = Player.positions.map(coords =>
      coords.map(c => (c + 0.5) * TILE_SIZE)
    );

    ctx.lineWidth = TILE_SIZE - 15;
    ctx.strokeStyle = 'darkgreen';
    ctx.fillStyle = 'green';

    ctx.beginPath();
    ctx.moveTo(...headPos);
    ctx.lineTo(...headPos);

    let lastPos = headPos;
    tail.forEach(([x, y]) => {
      const dx = x - lastPos[0];
      const dy = y - lastPos[1];

      if (Math.abs(dx) + Math.abs(dy) <= 1) {
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }

      ctx.lineTo(x, y);
      lastPos = [x, y];
    });

    ctx.stroke();
    ctx.closePath();

    [headPos, ...tail].forEach(([x, y]) => {
      ctx.fillRect(x - TILE_SIZE / 2 + 5, y - TILE_SIZE / 2 + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    });
  }
}

Player.size = 0;
Player.positions = [];
Player.velocity = [0, 0];
Player.nextVelocity = [0, 0];
