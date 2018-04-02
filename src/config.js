var CONFIG = (function(){
  var w = 500, h = 500, x = 250, y = 500;
  return {
    ANIMATION_LIST: ['idle', 'jump', 'touch'],
    ANIMATION: {
      idle: {
        src: "assets/img/idle.jpg",
        width: w, height: h, pivotX: x, pivotY: y, fps: 12,
        timestamps: [[0, 15], [1, 1], [0, 2], [1,1]],
        loop: true,
      },
      jump: {
        src: "assets/img/jump.jpg",
        width: w, height: h, pivotX: x, pivotY: y, fps: 10,
        timestamps: [[0, 1], [1, 1], [0, 1], [1, 1], [0, 1], [1, 1], [0, 1]],
        loop: false
      },
      touch: {
        src: "assets/img/touch.jpg",
        width: w, height: h, pivotX: x, pivotY: y, fps: 1,
        timestamps: [[0, 1]],
        audio: [{frame: 0, source: 'bark'}],
        loop: false
      }
    },
    ANIMATOR: {
      main: {
        default: 'idle',
        touch: {next: 'idle', onClick: 'touch'},
        idle: {onClick: 'jump'},
        jump: {onClick: 'touch', next: 'idle'}
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
  }

})()