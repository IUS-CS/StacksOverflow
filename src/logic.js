
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
    };

    var enemies;
    var path;
    var graphics;
    var score = 100;
    var scoreText;
    var gameOver = false;
    
    var game = new Phaser.Game(config);

    function preload ()
    {
    this.load.image('background', 'background.png');
    this.load.image('enemy', 'tempEnemy.png');
    this.load.image('turret', 'turret.png');
    this.load.image('bullet', 'bullet.png');
    }//preload

var Turret = new Phaser.Class({
 
        Extends: Phaser.GameObjects.Image,
 
        initialize:
 
        function Turret (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'turret');
            this.nextTic = 0;
        },
        place: function(i, j){
            this.y = i;
            this.x = j;
        },
        fire: function() {
            var enemy = getEnemy(this.x, this.y, 800);
            if(enemy) {
                var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                addBullet(this.x, this.y, angle);
                this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
            }
        },
        update: function (time, delta)
        {
            if(time > this.nextTic) {
                this.fire();
                this.nextTic = time + 1000;
            }
        }
}); //turret

var Enemy = new Phaser.Class({
 
        Extends: Phaser.GameObjects.Image,
        
        initialize:
 
        function Enemy (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy');
            this.hp = 100;
            this.t = 0;
        },
        damaged: function(){
            this.hp = this.hp - 50;
            if (this.hp <= 0){
                this.setActive(false);
                this.setVisible(false);
                score += 10;
                scoreText.setText('Score: ' + score);
            }
        },
        update: function (time, delta)
        {
           var t = this.z;
                var vec = this.getData('vector');
                if (t >= 1){
                    this.setActive(false);
                    this.setVisible(false);
                    score -= 10;
                    if(score < 0) gameOver = true;
                    else{
                    scoreText.setText('Score: ' + score);
                    }
                    
                }//if t is 1
                else{
                path.getPoint(t, vec);
                
                this.setPosition(vec.x, vec.y);

                this.setDepth(this.y);
                } 
        }
 
});//enemy

var Bullet = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Image,
 
    initialize:
 
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
 
        this.dx = 0;
        this.dy = 0;
        this.lifespan = 0;
 
        this.speed = Phaser.Math.GetSpeed(600, 1);
    },
 
    fire: function (x, y, angle)
    {
        this.setActive(true);
        this.setVisible(true);
        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);
 
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
 
        this.lifespan = 1100;
    },
 
    update: function (time, delta)
    {
        this.lifespan -= delta;
 
        this.x += this.dx * (this.speed * delta);
        this.y += this.dy * (this.speed * delta);
 
        if (this.lifespan <= 0)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
 
});//bullet
    
    function create (){
        this.add.image(400, 400, 'background');
        graphics = this.add.graphics();
        scoreText = this.add.text(1200, 16, 'Score: 100', { fontSize: '32px', fill: '#FFF' });
        
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
        
        for (var i = 1; i <= max; i++)
        {
        var line = {x1:0, y1:0, x2:0, y2:0};
        line.x1 = drawnLines[i-1].x2;
        line.y1 = drawnLines[i-1].y2;
        drawnLines.push(line);
        
        do{
        drawnLines[i].x2 = Math.floor(Math.random() *700);
        drawnLines[i].y2 = Math.floor(Math.random() *700); 
        }
        while(checkValidLine(drawnLines) == false);
        path.lineTo(drawnLines[i].x2, drawnLines[i].y2);
        }//for
        
        //set end point
        var endLine = {x1: drawnLines[max].x2, y1: drawnLines[max].y2, x2:0, y2:0};
        selectEndPoint(endLine);
        drawnLines.push(endLine);
        path.lineTo(endLine.x2, endLine.y2);
        
        bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        turrets = this.add.group({ classType: Turret, runChildUpdate: true });

        for (var i = 0; i < 10; i++)
        {
            var star = enemies.get();

            star.setData('vector', new Phaser.Math.Vector2());
            if (star){
                this.tweens.add({
                    targets: star,
                    z: 1,
                    ease: 'Linear',
                    duration: 16000,
                    delay: i * 1000
                });
            }
        }//for
        this.input.on('pointerdown', placeTurret);
        this.physics.add.overlap(enemies, bullets, damageEnemy);
    }//create
    
    function update (){
        if (gameOver){
            return;
        }
         graphics.clear();
         graphics.lineStyle(15, 0x8b4513, 1);
        path.draw(graphics);
    }//update

    function placeTurret(pointer) {
        if(score >= 50){
        var i = Math.floor(pointer.y);
        var j = Math.floor(pointer.x);
            var turret = turrets.get();
            if (turret)
            {
                turret.setActive(true);
                turret.setVisible(true);
                turret.place(i, j);
            }   
        score = score - 50;
        scoreText.setText('Score: ' + score);
    }
    }//place turret

    function addBullet(x, y, angle) {
        var bullet = bullets.get();
        if (bullet)
        {
            bullet.fire(x, y, angle);
        }
    }//create bullet

    function getEnemy(x, y, distance) {
        var enemyUnits = enemies.getChildren();
        for(var i = 0; i < enemyUnits.length; i++) {       
            if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
                return enemyUnits[i];
        }
        return false;
    }//get the closest enemy

    function damageEnemy(enemy, bullet) {  
        // only if both enemy and bullet are alive
        if (enemy.active === true && bullet.active === true) {
            // we remove the bullet right away
            bullet.setActive(false);
            bullet.setVisible(false); 
            enemy.damaged();
        }
    }//damage enemy
    
    function checkValidLine(drawnLines){
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
        
        return valid;
    }//draw valid line
    
    function selectEndPoint(endLine){
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
    }//draw the ending point

