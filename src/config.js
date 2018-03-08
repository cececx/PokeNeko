var CONFIG = {
  ANIMATION_LIST: ['idle', 'jump'],
  ANIMATION: {
    idle: {
      src: "img/doodle-idle.jpg",
      len: 2,
      width: 200,
      height: 200,
      pivotX: 100,
      pivotY: 200,
      fps: 1,
      timestamps: [1, 1],
      loop: true,
    },
    jump: {
      src: "img/doodle-jump.jpg",
      len: 3,
      width: 200,
      height: 200,
      pivotX: 100,
      pivotY: 200,
      fps: 10,
      timestamps: [2, 1, 1],
      loop: false
    }
  },
  ANIMATOR: {
    main: {
      default: 'idle',
      jump: {next: 'idle', onClick: 'jump'},
      idle: {onClick: 'jump'},
    }
  }
};