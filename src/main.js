
var MIAO= (function() {

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

// ----------------------------------------------------------------------------
// Implementation of Animation system.

// Animation map.
var mapAnimation = {};
var getAnimation = function(name) {
  if (mapAnimation[name] == undefined)
    mapAnimation[name] = new Animation(CONFIG.ANIMATION[name]);
  return mapAnimation[name];
}

// Animation clip.
class Animation {
  constructor(config) {
    this._config = config;
    this._index = 0;
    this._lastTimer = null;
    this._isPlay = true;
    this._isStop = false;
    this._isLoop = config.loop;
    this._img = new Image();
    this._img.src = config.src;
  }
  play() {
    this._lastTimer = null;
    this._index = 0;
    this._isPlay = true;
    this._isStop = false;
  }
  get isStop() {
    return this._isStop
  }
  render(context, posX, posY) {
    var dx = posX - this._config.pivotX;
    var dy = posY - this._config.pivotY;
    var sx = this._index * this._config.width;
    var sy = 0;
    var w = this._config.width;
    var h = this._config.height;
    context.drawImage(this._img, sx, sy, w, h, dx, dy, w, h);
  }
  next(currentTime) {
    if(!this._isPlay) return;
    if(!this._lastTime) this._lastTime = currentTime;
    var timelapes = currentTime - this._lastTime;
    var frameTime = 1000 / this._config.fps * this._config.timestamps[this._index];
    if (timelapes >= frameTime) {
      this._index += 1;
      // Check if playing through the end frame.
      if(this._index >= this._config.len) {
        if (this._isLoop) {
          this._index = 0;
        } else {
          this._isPlay = false;
          this._isStop = true;
          this._index = this._config.len - 1;
        }
      }
      this._lastTime = currentTime;
    }
  }
}

// Animation controller.
class Animator{
  constructor(config) {
    this._config = config;
    this._anim = getAnimation(config['default']);
    this._current = config['default'];
  }
  _setAnimation(name) {
    this._current = name;
    this._anim = getAnimation(name);
    this._anim.play();
  }
  _playNext(key) {
    var next = this._config[this._current][key];
    if (next != undefined)
      this._setAnimation(next);
  }
  onTouch() {
    this._playNext('onClick');
  }
  update(time) {
    this._anim.render(CONTEXT, POS_X, POS_Y);
    this._anim.next(time);
    if (this._anim.isStop) {
      this._playNext('next');
    }
  }
}

// ----------------------------------------------------------------------------
// Main application.

var animator = new Animator(CONFIG.ANIMATOR['main']);

var CANVAS, CONTEXT, POS_X=100, POS_Y=200;
var lastTime, currentTime;
var fps = 24.0;
var deltaTime = 1000.0/fps;

function init() {
  CANVAS = document.getElementById("myCanvas");
  CONTEXT = CANVAS.getContext("2d");
  lastTime = Date.now();
  CANVAS.addEventListener("mousedown", function (e) {animator.onTouch()}, false);
  window.requestAnimationFrame(update);
}

function update() {
    var currentTime = Date.now();
    if (currentTime - lastTime >= deltaTime) {
      CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
      animator.update(currentTime);
      lastTime = currentTime;
  }
  window.requestAnimationFrame(update);
}

return init;
}());