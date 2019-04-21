//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//configuration information for phaser game object
var config = {
        type: Phaser.AUTO,
        width: 1600,
        height: 800,
        physics: {
        default: 'arcade'
    },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
};// config

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//global variables
    var enemies;
    var path;
    var graphics;
    var score = 100;
    var scoreText;
    var roundText;
    var turCostText;
    var gameOver = false;
    var round = 1;
    var game = new Phaser.Game(config);

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Preload, Create, Update functions for phaser game object
    
    function preload ()
    {
    this.load.image('background', 'background.png');
    this.load.image('enemy', 'tempEnemy.png');
    this.load.image('turret', 'turret.png');
    this.load.image('bullet', 'bullet.png');
    }//preload
    
    function create (){
        this.add.image(400, 400, 'background');
        graphics = this.add.graphics();
        scoreText = this.add.text(1100, 16, 'Score: 100', { fontSize: '32px', fill: '#FFF' });
        roundText = this.add.text(1100, 66, 'Round: 1', { fontSize: '32px', fill: '#FFF' });
        turCostText = this.add.text(1100, 116, 'Turret Cost: 50', { fontSize: '32px', fill: '#FFF' });
        
        var xval = Math.floor(Math.random() * 2)*800; //Either 0 or 800 so path starts on left or right only
        var yval = Math.floor(Math.random() *701);
        
        path = new Phaser.Curves.Path(xval, yval);
        
        var strtLine = {x1: xval, y1: yval, x2:0 , y2:0 };
       
        xval = Math.floor(Math.random() *700)+50;
        strtLine.x2 = xval;
        strtLine.y2 = yval;
        path.lineTo(xval, yval);
        //draw starting line
        var drawnLines = [strtLine];
        
        var max = 5; //Maximum path lines
        
        for (var i = 1; i <= max; i++)
        {
        var line = {x1:0, y1:0, x2:0, y2:0};
        line.x1 = drawnLines[i-1].x2;
        line.y1 = drawnLines[i-1].y2;
        drawnLines.push(line);
        
        do{
            if(i%2 == 0){
                drawnLines[i].x2 = Math.floor(Math.random() *700);
                drawnLines[i].y2 = drawnLines[i].y1;
            }
            else{
               drawnLines[i].y2 = Math.floor(Math.random() *700); 
               drawnLines[i].x2 = drawnLines[i].x1;
            }
        }
        while(checkValidLine(drawnLines) === false);
        path.lineTo(drawnLines[i].x2, drawnLines[i].y2);
        console.log(drawnLines[i]);
        }//for
        
        
        //set end point
        var endLine = {x1: drawnLines[max].x2, y1: drawnLines[max].y2, x2:0, y2:0};
        selectEndPoint(endLine);
        drawnLines.push(endLine);
        path.lineTo(endLine.x2, endLine.y2);
        
        bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        turrets = this.add.group({ classType: Turret, runChildUpdate: true });
        this.input.on('pointerdown', placeTurret);
        this.physics.add.overlap(enemies, bullets, damageEnemy);
        
        graphics.lineStyle(15, 0x8b4513, 1);
        path.draw(graphics);
        
        spawnEnemies(this);
    }//create
    
    function update (){
        if (gameOver){
            this.add.text(200, 200, 'Game Over', { fontSize: '64px', fill: '#FFF' });
            enemies.destroy(true);
            return;
        }
        if (enemies.countActive() === 0){
            round++;
            score += 20;
            roundText.setText('Round: ' + round);
            scoreText.setText('Score: '+score);
            spawnEnemies(this);
        }
        
    }//update
    