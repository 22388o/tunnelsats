import { useEffect } from "react";

let firstRun = false;

/**
 * Ref: https://codepen.io/jlong64/pen/kXRxpA
 */
function Thunder() {
  useEffect(() => {
    if (!firstRun) {
      firstRun = true;
    } else {
      return;
    }

    // console.time('bolt');

    // The main canvas and context.
    let THUNDER_FREQUENCY = 0.9994;
    let boltFadeDuration;
    let boltFlashDuration;
    let flashOpacity;
    let fps;
    let height;
    let lastFrame;
    let totalBoltDuration;
    let width;
    let scale;

    let canvas;
    let context;

    let bolts;
    let launchBolt;
    let lastBoltTime = new Date().getTime();
    let recursiveLaunchBolt;
    let setCanvasSize;
    let tick;

    canvas = document.getElementById("canvas");
    canvas.style.left = "0px";
    context = canvas.getContext("2d");

    // The size and scale of the canvas. The size will get set via setCanvasSize to match the size of
    // the window. Change the scale to get a more or less pixel-y effect.
    width = 0.0;

    height = 0.0;

    scale = 1.0;

    // The frames per second of the simulation. We also keep track of the time the previous frame
    // occurred so that we know the duration between each frame.
    fps = 45.0;

    lastFrame = new Date().getTime();

    // The screen will flash briefly when the flash opacity is set. The opacity will dissipate quickly
    // over time.
    flashOpacity = 0.0;

    // When a bolt appears, it will be drawn at full opacity for the flash duration, and then will fade
    // out gradually over the fade duration.
    boltFlashDuration = 0.25;

    boltFadeDuration = 0.5;

    totalBoltDuration = boltFlashDuration + boltFadeDuration;

    // The list of bolts. A bolt will get added to this list on creation, and then will be automatically
    // removed after it's done fading out.
    bolts = [];

    // Sets the size of the canvas and each bolt canvas.
    setCanvasSize = function () {
      var bolt, j, len;
      const svgElm = document.getElementById("renderBox");
      canvas.setAttribute("width", svgElm?.clientWidth.toString());
      canvas.setAttribute("height", svgElm?.clientHeight.toString());
      for (j = 0, len = bolts.length; j < len; j++) {
        bolt = bolts[j];
        bolt.canvas.width = window.innerWidth;
        bolt.canvas.height = window.innerHeight;
      }
      width = Math.ceil(window.innerWidth / scale);
      return (height = Math.ceil(window.innerHeight / scale));
    };

    // Launch a bolt!!!
    launchBolt = function (x, y, length, direction) {
      lastBoltTime = new Date().getTime();
      // console.timeLog('bolt');

      var boltCanvas;
      var boltContext;
      // Set the flash opacity.
      flashOpacity = 0.15 + Math.random() * 0.2;

      // Create the bolt canvas.
      boltCanvas = document.createElement("canvas");
      boltCanvas.width = window.innerWidth;
      boltCanvas.height = window.innerHeight;
      boltContext = boltCanvas.getContext("2d");
      boltContext.scale(scale, scale);

      // Add the bolt to the list.
      bolts.push({
        canvas: boltCanvas,
        duration: 0.0,
      });

      // Launch it!!
      return recursiveLaunchBolt(x, y, length, direction, boltContext);
    };

    // Recursive bolt action.
    recursiveLaunchBolt = function (x, y, length, direction, boltContext) {
      let boltInterval, originalDirection;
      originalDirection = direction;

      // We draw the bolt incrementally to get a nice animated effect.
      return (boltInterval = setInterval(function () {
        var alpha, i, x1, y1;
        if (length <= 0) {
          clearInterval(boltInterval);
          return;
        }
        i = 0;
        while (i++ < Math.floor(45 / scale) && length > 0) {
          x1 = Math.floor(x);
          y1 = Math.floor(y);
          x += Math.cos(direction);
          y -= Math.sin(direction);
          length--;
          if (x1 !== Math.floor(x) || y1 !== Math.floor(y)) {
            alpha = Math.min(1.0, length / 350.0);
            boltContext.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            boltContext.fillRect(x1, y1, 1.0, 1.0);
            direction =
              originalDirection +
              (-Math.PI / 8.0 + Math.random() * (Math.PI / 4.0));
            if (Math.random() > 0.99) {
              recursiveLaunchBolt(
                x1,
                y1,
                length * (0.3 + Math.random() * 0.4),
                originalDirection +
                  (-Math.PI / 6.0 + Math.random() * (Math.PI / 3.0)),
                boltContext
              );
            } else if (Math.random() > 0.95) {
              recursiveLaunchBolt(
                x1,
                y1,
                length,
                originalDirection +
                  (-Math.PI / 6.0 + Math.random() * (Math.PI / 3.0)),
                boltContext
              );
              length = 0;
            }
          }
        }
        return void 0;
      }, 10));
    };

    // This will get fired at a constant framerate.
    tick = function () {
      var bolt, elapsed, frame, i, j, len, length, x, y;
      // Keep track of the frame time.
      frame = new Date().getTime();
      elapsed = (frame - lastFrame) / 1000.0;
      lastFrame = frame;

      // Clear the canvas.
      context.clearRect(0.0, 0.0, window.innerWidth, window.innerHeight);

      // Fire a bolt every once in a while.
      if (
        Math.random() > THUNDER_FREQUENCY ||
        new Date().getTime() - lastBoltTime > 25 * 1000
      ) {
        x = Math.floor(-10.0 + Math.random() * (width + 20.0));
        y = Math.floor(5.0 + Math.random() * (height / 3.0));
        length = Math.floor(height / 2.0 + Math.random() * (height / 3.0));
        launchBolt(x, y, length, (Math.PI * 3.0) / 2.0);
      }

      // Draw the flash.
      if (flashOpacity > 0.0) {
        context.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        context.fillRect(0.0, 0.0, window.innerWidth, window.innerHeight);
        flashOpacity = Math.max(0.0, flashOpacity - 2.0 * elapsed);
      }

      // Draw each bolt.
      for (i = j = 0, len = bolts.length; j < len; i = ++j) {
        bolt = bolts[i];
        bolt.duration += elapsed;
        if (bolt.duration >= totalBoltDuration) {
          bolts.splice(i, 1);
          i--;
          return;
        }
        context.globalAlpha = Math.max(
          0.0,
          Math.min(1.0, (totalBoltDuration - bolt.duration) / boltFadeDuration)
        );
        context.drawImage(bolt.canvas, 0.0, 0.0);
      }
      return void 0;
    };

    // Start it up!!!
    window.addEventListener("resize", setCanvasSize);

    setCanvasSize();

    setInterval(tick, 1000.0 / fps);
  }, []);

  return (
    <canvas
      id="canvas"
      style={{ border: "0px solid red", position: "absolute" }}
    ></canvas>
  );
}

export default Thunder;
