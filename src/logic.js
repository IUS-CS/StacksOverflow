
    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 800,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var enemies;
    var path;
    var graphics;
    
    var game = new Phaser.Game(config);

    function preload ()
    {
    this.load.image('background', 'background.png');
    this.load.image('enemy', 'tempEnemy.png');
    }//preload

    function create ()
    {
    this.add.image(400, 400, 'background');
    graphics = this.add.graphics();
    
    var xval = Math.floor(Math.random() * 2)*800;
    var yval = Math.floor(Math.random() *701);
    
    path = new Phaser.Curves.Path(xval, yval);
    
    var strtLine = {x1: xval, y1: yval, x2:0 , y2:0 };
   
    xval = Math.floor(Math.random() *700)+50;
    strtLine.x2 = xval;
    strtLine.y2 = yval;
    path.lineTo(xval, yval);
    //draw starting line
    var drawnLines = [strtLine];
    
    var max = 5;
    
    for (var i = 0; i < max; i++)
    {
    var line = {x1:0, y1:0, x2:0, y2:0};
    line.x1 = drawnLines[drawnLines.length-1].x2;
    line.y1 = drawnLines[drawnLines.length-1].y2;
    line.x2 = Math.floor(Math.random() *700);
    line.y2 = Math.floor(Math.random() *700);
    drawnLines.push(line);
    drawValidLine(drawnLines);
    }
    //set end point
    var endLine = {x1: drawnLines[max].x2, y1: drawnLines[max].y2, x2:0, y2:0};
    if(endLine.x1 < 400 && endLine.y1 <400){ //quadrant one
      if(endLine.x1 < endLine.y1){
      endLine.y2 = endLine.y1;
      }
      else{
      endLine.x2 = endLine.x1;
      }
    }
    else if (endLine.x1 >= 400 && endLine.y1 <400){ //quadrant two
      if(800-endLine.x1 < endLine.y1){
      endLine.y2 = endLine.y1;
      endLine.x2 = 800;
      }
      else{
      endLine.x2 = endLine.x1;
      }
    }//q2
    else if (endLine.x1 < 400 && endLine.y1 >= 400){ //quadrant three
    if(endLine.x1 < 800-endLine.y1){
    endLine.y2 = endLine.y1;
    }
    else{
    endLine.x2 = endLine.x1;
    endLine.y2 =800;
    }
    }//q3
    else{ //quadrant four
    if(endLine.x1 > endLine.y1){
    endLine.y2 = endLine.y1;
    endLine.x2 =800;
    }
    else{
    endLine.x2 = endLine.x1;
    endLine.y2 =800;
    }
    }//q4
    drawnLines.push(endLine);
    path.lineTo(endLine.x2, endLine.y2);
    enemies = this.add.group();

    for (var i = 0; i < 10; i++)
    {
        var ball = enemies.create(0, -50, 'enemy');

        ball.setData('vector', new Phaser.Math.Vector2());

        this.tweens.add({
            targets: ball,
            z: 1,
            ease: 'Linear',
            duration: 12000,
            delay: i * 100
        });
    
    }
    }//create
    
    function drawValidLine(drawnLines){
    var j = drawnLines.length-2;
    var valid = true;
    var denominator;
    var lineToDraw = drawnLines.length -1;
    var t1;
    var t2;
    
    while (valid && j >= 0){
    //x1 y1, x2 y2 are line already drawn
    //x3 y3, x4 y4 are line to be drawn
    
    denominator = ((drawnLines[lineToDraw].x2 - drawnLines[lineToDraw].x1)*(drawnLines[j].y1 - drawnLines[j].y2))-((drawnLines[j].x1 - drawnLines[j].x2)*(drawnLines[lineToDraw].y2 - drawnLines[lineToDraw].y1));
    t1 = (((drawnLines[lineToDraw].y1-drawnLines[lineToDraw].y2)*(drawnLines[j].x1-drawnLines[lineToDraw].x1))+((drawnLines[lineToDraw].x2-drawnLines[lineToDraw].x1)*(drawnLines[j].y1-drawnLines[lineToDraw].y1)))/denominator;
    t2 = (((drawnLines[j].y1-drawnLines[j].y2)*(drawnLines[j].x1-drawnLines[lineToDraw].x1))+((drawnLines[j].x2-drawnLines[j].x1)*(drawnLines[j].y1-drawnLines[lineToDraw].y1)))/denominator;
    
    if (0<t1 && t1<1 && 0<t2 && t2<1){
    valid =false;
    }
    j--;
    }//while
    if(valid == false){
    drawnLines[lineToDraw].x2 = Math.floor(Math.random() *700);
    drawnLines[lineToDraw].y2 = Math.floor(Math.random() *700);
    drawValidLine(drawnLines);
    }//if
    else path.lineTo(drawnLines[lineToDraw].x2, drawnLines[lineToDraw].y2);
    }//draw valid line

    function update ()
    {
     graphics.clear();
     graphics.lineStyle(15, 0x8b4513, 1);

    path.draw(graphics);

     var balls = enemies.getChildren();

    for (var i = 0; i < balls.length; i++)
    {
        var t = balls[i].z;
        var vec = balls[i].getData('vector');

        path.getPoint(t, vec);
        
        balls[i].setPosition(vec.x, vec.y);

        balls[i].setDepth(balls[i].y);
    }
    }//update
