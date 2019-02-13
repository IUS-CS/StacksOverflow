var game = {
  init: function() {
    game.canvas = document.getElementById("gamecanvas");
    game.context = game.canvas.getContext("2d");

    game.hideScreens();
    game.showScreen("gamestartscreen");
  },

  hideScreens: function() {
    var screens = document.getElementsByClassName("gamelayer");

    for (let i = screens.length - 1; i >= 0; i--) {
      var screen = screens[i];

      screen.style.display = "none";
    }
  },

  hideScreen: function(id) {
    var screen = document.getElementById(id);

    screen.style.display = "none";
  },

  showScreen: function(id) {
    var screen = document.getElementById(id);

    screen.style.display = "block";
  },

  Scale: 1,
  resize: function() {
    var maxWidth = window.innerWidth;
    var maxHeight = window.innerHeight;

    var scale = Math.min(maxWidth / 640, maxHeight / 480);

    var gameContainer = document.getElementById("gamecontainer");

    gameContainer.style.transform =
      "translate(-50%, -50%) " + "scale(" + scale + ")";

    game.scale = scale;

    // What is the maximum width we can set based on the current scale
    // Clamp the value between 640 and 1024
    var width = Math.max(640, Math.min(1024, maxWidth / scale));

    // Apply this new width to game container and game canvas
    gameContainer.style.width = width + "px";

    // Subtract 160px for the sidebar
    var canvasWidth = width - 160;

    // Set a flag in case the canvas was resized
    if (game.canvasWidth !== canvasWidth) {
      game.canvasWidth = canvasWidth;
      game.canvasResized = true;
    }
  }
};

//initialize game once page has fully loaded
window.addEventListener("load", function() {
  game.init();
});
