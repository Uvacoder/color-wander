var config = require('./config');
var assign = require('object-assign');
var createRenderer = require('./lib/createRenderer');
var createLoop = require('raf-loop');

var canvas = document.createElement('canvas');
var background = new window.Image();
var context = canvas.getContext('2d');

var opts = assign({
  backgroundImage: background,
  context: context
}, config);

var pixelRatio = typeof opts.pixelRatio === 'number' ? opts.pixelRatio : 1;
canvas.width = opts.width * pixelRatio;
canvas.height = opts.height * pixelRatio;

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = opts.palette[0];
document.body.appendChild(canvas);
canvas.style.position = 'absolute';
resize();
window.addEventListener('resize', resize);

background.onload = () => {
  var renderer = createRenderer(opts);

  if (opts.debugLuma) {
    renderer.debugLuma();
  } else {
    renderer.clear();
    var stepCount = 0;
    var loop = createLoop(() => {
      renderer.step(opts.interval);
      stepCount++;
      if (!opts.endlessBrowser && stepCount > opts.steps) {
        loop.stop();
      }
    }).start();
  }
};

background.src = config.backgroundSrc;

function resize () {
  letterbox(canvas, [ window.innerWidth, window.innerHeight ]);
}

// resize and reposition canvas to form a letterbox view
function letterbox (element, parent) {
  var aspect = opts.width / opts.height;
  var pwidth = parent[0];
  var pheight = parent[1];

  var width = pwidth;
  var height = Math.round(width / aspect);
  var y = Math.floor(pheight - height) / 2;

  element.style.top = y + 'px';
  element.style.width = width + 'px';
  element.style.height = height + 'px';
}