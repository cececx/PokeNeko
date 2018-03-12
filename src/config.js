var CONFIG = {
  ANIMATION_LIST: ['idle', 'jump'],
  ANIMATION: {
    idle: {
      src: "assets/img/doodle-idle.jpg",
      width: 200, height: 200, pivotX: 100, pivotY: 200, fps: 1,
      timestamps: [1, 1],
      loop: true,
    },
    jump: {
      src: "assets/img/doodle-jump.jpg",
      width: 200, height: 200, pivotX: 100, pivotY: 200, fps: 10,
      timestamps: [2, 1, 1],
      audio: [{frame: 0, source: 'bark'}],
      loop: false
    }
  },
  ANIMATOR: {
    main: {
      default: 'idle',
      jump: {next: 'idle', onClick: 'jump'},
      idle: {onClick: 'jump'},
    }
  },
  AUDIO_LIST: ['bark'],
  AUDIO_CLIP: {
    bark: { src: 'assets/audio/bark.mp3', len: 1 }
  },
  AUDIO_SOURCE: {
    bark: {
      type: 'SINGLE',
      list: ['bark'],
      loop: false,
    }
  },
};