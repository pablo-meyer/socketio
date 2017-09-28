(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.VideoStreamMerger = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* globals window */

module.exports = VideoStreamMerger

function VideoStreamMerger (opts) {
  var self = this
  if (!(self instanceof VideoStreamMerger)) return new VideoStreamMerger(opts)

  opts = opts || {}

  var AudioContext = window.AudioContext || window.webkitAudioContext
  var audioSupport = !!(AudioContext && (self._audioCtx = (opts.audioContext || new AudioContext())).createMediaStreamDestination)
  var canvasSupport = !!document.createElement('canvas').captureStream
  var supported = audioSupport && canvasSupport
  if (!supported) {
    throw new Error('Unsupported browser')
  }

  self.width = opts.width || 400
  self.height = opts.height || 300
  self.fps = opts.fps || 25

  // Hidden canvas element for merging
  self._canvas = document.createElement('canvas')
  self._canvas.setAttribute('width', self.width)
  self._canvas.setAttribute('height', self.height)
  self._canvas.setAttribute('style', 'position:fixed; left: 110%; pointer-events: none') // Push off screen
  self._ctx = self._canvas.getContext('2d')

  self._videos = []

  self._audioDestination = self._audioCtx.createMediaStreamDestination()

  self.started = false
  self.result = null
}

VideoStreamMerger.prototype.addStream = function (mediaStream, opts) {
  var self = this

  if (typeof mediaStream === 'string') {
    return self._addData(mediaStream, opts)
  }

  opts = opts || {}

  opts.isData = false
  opts.x = opts.x || 0
  opts.y = opts.y || 0
  opts.width = opts.width || self.width
  opts.height = opts.height || self.height
  opts.draw = opts.draw || null
  opts.mute = opts.mute || false
  opts.audioEffect = opts.audioEffect || null
  opts.index = opts.index === null ? self._videos.length : opts.index

  // If it is the same MediaStream, we can reuse our video element (and ignore sound)
  var video = null
  for (var i = 0; i < self._videos.length; i++) {
    if (self._videos[i].id === mediaStream.id) {
      video = self._videos[i].element
    }
  }

  if (!video) {
    video = document.createElement('video')
    video.autoplay = true
    video.muted = true
    video.srcObject = mediaStream

    if (!opts.mute) {
      opts.audioSource = self._audioCtx.createMediaStreamSource(mediaStream)
      opts.audioOutput = self._audioCtx.createGain() // Intermediate gain node
      opts.audioOutput.gain.value = 1
      if (opts.audioEffect) {
        opts.audioEffect(opts.audioSource, opts.audioOutput)
      } else {
        opts.audioSource.connect(opts.audioOutput) // Default is direct connect
      }
      opts.audioOutput.connect(self._audioDestination)
    }
  }

  opts.element = video
  opts.id = mediaStream.id || null
  self._videos.splice(opts.index, 0, opts)
}

VideoStreamMerger.prototype.removeStream = function (mediaStream) {
  var self = this

  if (typeof mediaStream === 'string') {
    mediaStream = {
      id: mediaStream
    }
  }

  for (var i = 0; i < self._videos.length; i++) {
    if (mediaStream.id === self._videos[i].id) {
      if (self._videos[i].audioSource) {
        self._videos[i].audioSource = null
      }
      if (self._videos[i].audioOutput) {
        self._videos[i].audioOutput.disconnect(self._audioDestination)
        self._videos[i].audioOutput = null
      }

      self._videos[i] = null
      self._videos.splice(i, 1)
      i--
    }
  }
}

VideoStreamMerger.prototype._addData = function (key, opts) {
  var self = this

  opts = opts || {}
  opts.isData = true
  opts.draw = opts.draw || null
  opts.audioEffect = opts.audioEffect || null
  opts.id = key
  opts.element = null
  opts.index = opts.index === null ? self._videos.length : opts.index

  if (opts.audioEffect) {
    opts.audioOutput = self._audioCtx.createGain() // Intermediate gain node
    opts.audioOutput.gain.value = 1
    opts.audioEffect(null, opts.audioOutput)
    opts.audioOutput.connect(self._audioDestination)
  }

  self._videos.splice(opts.index, 0, opts)
}

VideoStreamMerger.prototype.start = function () {
  var self = this

  self.started = true
  window.requestAnimationFrame(self._draw.bind(self))

  // Add video
  self.result = self._canvas.captureStream(self.fps)

  // Remove "dead" audio track
  var deadTrack = self.result.getAudioTracks()[0]
  if (deadTrack) self.result.removeTrack(deadTrack)

  // Add audio
  var audioTracks = self._audioDestination.stream.getAudioTracks()
  self.result.addTrack(audioTracks[0])
}

VideoStreamMerger.prototype._draw = function () {
  var self = this
  if (!self.started) return

  var awaiting = self._videos.length
  function done () {
    awaiting--
    if (awaiting <= 0) window.requestAnimationFrame(self._draw.bind(self))
  }

  self._ctx.clearRect(0, 0, self.width, self.height)
  self._videos.forEach(function (video) {
    if (video.draw) { // custom frame transform
      video.draw(self._ctx, video.element, done)
    } else if (!video.isData) {
      self._ctx.drawImage(video.element, video.x, video.y, video.width, video.height)
      done()
    } else {
      done()
    }
  })

  if (self._videos.length === 0) done()
}

VideoStreamMerger.prototype.destroy = function () {
  var self = this

  self.started = false

  self._canvas = null
  self._ctx = null
  self._videos = []
  self._audioCtx = null
  self._audioDestination = null

  self.result.getTracks().forEach(function (t) {
    t.stop()
  })
  self.result = null
}

module.exports = VideoStreamMerger

},{}]},{},[1])(1)
});