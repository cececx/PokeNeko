
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

    // Parameters.
    this._isPlay = true;
    this._isStop = false;
    this._isLoop = config.loop;
    this._img = new Image();
    this._img.src = config.src;
    this._frameTime = 1000 / config.fps;

    // Playing control.
    this._timer = null;
    this._index = 0;
    this._len = config.timestamps.reduce(function(a, b) { return a + b; }, 0);
    this._keyFrames = [];
    this._audioFrames = Array(this._len).fill('');

    // Setup frames.
    for (var i = 0; i < config.timestamps.length; i++) {
      var size = config.timestamps[i];
      for (var j = 0; j < size; j++) {
        this._keyFrames.push(i);
      }
    }
    if (config.audio) {
      for (var i = 0; i < config.audio.length; i++) {
        var audio = config.audio[i];
        this._audioFrames[audio.frame] = audio.source;
      }
    }
  }

  play() {
    this._lastTimer = null;
    this._index = 0;
    this._isPlay = true;
    this._isStop = false;
    this._handleFrame();
  }

  get isStop() {
    return this._isStop;
  }

  render(context, posX, posY) {
    var i = this._keyFrames[this._index];
    var dx = posX - this._config.pivotX;
    var dy = posY - this._config.pivotY;
    var sx = this._config.width * i;
    var sy = 0;
    var w = this._config.width;
    var h = this._config.height;
    context.drawImage(this._img, sx, sy, w, h, dx, dy, w, h);
  }

   _handleFrame() {
    if (this._audioFrames[this._index] != '') {
      audioManager.play(this._audioFrames[this._index]);
    }
  }

  check() {
    if(!this._isPlay) return;

    if(!this._timer) this._timer = TIME;
    var timelapes = TIME - this._timer;
    if (timelapes >= this._frameTime) {
      this._index += 1;
      if (this._index < this._len) {
        this._handleFrame();
      }
      else {
        // Playing through the end frame.
        if (this._isLoop) {
          this._index = 0;
        } else {
          this._isPlay = false;
          this._isStop = true;
          this._index = this._len - 1;
        }
      }
      this._timer = TIME;
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
  update() {
    this._anim.render(CONTEXT, POS_X, POS_Y);
    this._anim.check();
    if (this._anim.isStop) {
      this._playNext('next');
    }
  }
}


// ----------------------------------------------------------------------------
// AudioManager

// Config fields for `AudioClip`:
//   src: str.
//   len: float. Audio length in seconds.
class AudioClip {
  constructor(config) {
    this._src = config.src;
    this._len = config.len * 1000;
    this._startTime = null;
    this._playTime = 0;
  }
  play() {
    this._startTime = TIME;
    // TODO(miao): handle audio play. 
  }
  stop() {
    // TODO(miao): handle audio stop.
    audio_status.innerHTML = '';
  }
  pause() {
    this._playTime = TIME - this._startTime;
  }
  isPlaying() {
    if (this._startTime == null)  return false;
    return TIME - this._startTime < this._len;
  }
}

// Config fields for `AudioSource`:
//   type:        string. 'SINGLE', 'QUEUE' or 'RESUMABLE'.
//   audioList:   list(str).  A list of audio names.
//   timestamps:  list(float). For QUEUE type only.
//   loop:        bool.
class AudioSource {
  constructor(config) {
    this._config = config;
    this._index = 0;
    this._len = config.list.length;
    this._clipList = [];
    for (var i = 0; i < this._len; i++) {
      var name = config.list[i];
      var clipConfig = CONFIG.AUDIO_CLIP[name];
      this._clipList.push(new AudioClip(clipConfig));
    }
    this._clip = null;
  }
  play() {
    this._index = 0;
    this._clip = this._clipList[0];
    this._clip.play();
  }
  stop() {
    if (this._index < this._len)
      this._clip.stop();
  }
  resume() {}
  reset() {}
  check() {
    if (this._index >= this._len || !this._clip) return;
    if (!this._clip.isPlaying()) {
      this._clip.stop();
      this._index += 1;
      if (this._index < this._len) {
        this._clip = _clipList[this._index];
        this._clip.play();
      }
      else if (this._config.loop) {
        this.play();
      }
    } else {
      // TODO(miao): remove logging after audio functions fully completed.
      audio_status.innerHTML = 'playing: \n' + this._clip._src 
        + ' ' + ((TIME - this._clip._startTime)/1000).toFixed(1) 
        + ' / ' + (this._clip._len/1000).toFixed(1);
    }
  }
}

// Audio source dict.
var emptyAudioSource = (function(){
  function empty() { }
  return { play: empty, stop: empty, resume: empty, reset: empty, check: empty }
}())

var dictAudioSource = {};
var getAudioSource = function(name) {
  if (dictAudioSource[name] == undefined) {
    if (CONFIG.AUDIO_SOURCE[name] == undefined)
      return emptyAudioSource;
    dictAudioSource[name] = new AudioSource(CONFIG.AUDIO_SOURCE[name]);
  }
  return dictAudioSource[name];
}

// AudioManager.
var audioManager = (function(){
  var source = emptyAudioSource;

  function play(source_name) {
    source.stop();
    var new_source = getAudioSource(source_name);
    source = new_source;
    source.play();
  }
  function stop() {
    source.stop();
  }
  function update() {
    source.check();
  }

  return {
    play: play,
    stop: stop,
    update: update,
  }

}());


// ----------------------------------------------------------------------------
// Main application.

var animator = new Animator(CONFIG.ANIMATOR['main']);

// Observer. Execute update function for every registered objects.
var threadManager = (function(){
  var list = [];
  function register(object) {
    list.push(object);
  }
  function update() {
    for (var i = 0; i < list.length; i++) {
      list[i].update();
    }
  }
  return {
    register: register,
    update: update
  }
}());

threadManager.register(animator);
threadManager.register(audioManager);

var CANVAS, CONTEXT, TIME, POS_X=100, POS_Y=200;
var lastTime;
var fps = 24.0;
var deltaTime = 1000.0/fps;
var audio_status;

function init() {
  CANVAS = document.getElementById("myCanvas");
  audio_status = document.getElementById('audio_status');
  CONTEXT = CANVAS.getContext("2d");
  lastTime = Date.now();
  CANVAS.addEventListener("mousedown", function (e) {animator.onTouch()}, false);
  window.requestAnimationFrame(update);
}

function update() {
  TIME = Date.now();
  if (TIME - lastTime >= deltaTime) {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    threadManager.update();
    lastTime = TIME;
  }
  window.requestAnimationFrame(update);
}

return init;
}());