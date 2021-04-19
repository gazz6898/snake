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
    const { TILE_SIZE } = GLOBAL_CONSTANTS;
    Player.velocity = Player.nextVelocity;
    const [x, y] = Player.headPosition;
    const [dx, dy] = Player.velocity;

    const newPosition = [x + dx * TILE_SIZE, y + dy * TILE_SIZE];
    while (Player.size && Player.positions.length >= Player.size) {
      Player.positions.pop();
    }
    Player.positions.unshift(newPosition);
  }

  static render() {
    const { TILE_SIZE } = GLOBAL_CONSTANTS;

    Renderer.withContext((ctx, c) => {
      const [headPos, ...tail] = Player.positions.map(coords => coords.map(c => c + TILE_SIZE / 2));

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

        if (Math.abs(dx) + Math.abs(dy) > TILE_SIZE) {
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
    });
  }
}

Player.size = 0;
Player.positions = [];
Player.velocity = [0, 0];
Player.nextVelocity = [0, 0];
