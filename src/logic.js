
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

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/*Turret Class for handling turret objects
* Properties: nextTic, x, y, damage, level
* Methods: initialize, place, fire, update, upgrade
*/
var Turret = new Phaser.Class({
 
        Extends: Phaser.GameObjects.Image,
 
        initialize:
 
        function Turret (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'turret');
            this.nextTic = 0;
            this.damage = 100;
            this.level = 1;
            this.turLevelText;
        },
        place: function(y, x){
            this.y = y;
            this.x = x;
        },
        upgrade: function(){
            
            this.damage += 100;
            score -= (50);
            this.level++;
            this.turLevelText.setText(this.level);
            scoreText.setText("Score: "+score);
            
        },
        fire: function() {
            var enemy = getEnemy(this.x, this.y, 800);
            if(enemy) {
                var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                addBullet(this.x, this.y, angle, this.damage);
                this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
                
            }
        },
        update: function (time, delta)
        {
            if(time > this.nextTic) {
                this.fire();
                this.nextTic = time + 800;
            }
        }
}); //turret

/*Enemy Class for handling enemy objects
*Properties: hp, t
*Methods: initialize, update
*/
var Enemy = new Phaser.Class({
 
        Extends: Phaser.GameObjects.Image,
        
        initialize:
 
        function Enemy (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy');
            this.hp = (round*10)+80;
            this.t = 0;
        },
        update: function (time, delta)
        {
           var t = this.z;
                var vec = this.getData('vector');
                if (t >= 1){
                    this.destroy();
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

/*Bullet Class for handling bullet objects
*Properties: dx, dy, lifespan, speed, damage
*Method: initialize, fire, update
*/

var Bullet = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Image,
 
    initialize:
 
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
 
        this.dx = 0;
        this.dy = 0;
        this.lifespan = 0;
        this.damage = 0;
        this.speed = Phaser.Math.GetSpeed(1300, 1);
    },
 
    fire: function (x, y, angle, damage)
    {
        this.setActive(true);
        this.setVisible(true);
        this.damage = damage;
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
            this.destroy();
        }
    }
 
});//bullet
    
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
        drawnLines[i].x2 = Math.floor(Math.random() *700);
        drawnLines[i].y2 = Math.floor(Math.random() *700); 
        }
        while(checkValidLine(drawnLines) === false);
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
    
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Spawns Enemies at start of each round
    function spawnEnemies(sceneObj){
        var enNum = Math.floor(Math.random()*(round))+5;
        for (var i = 0; i < enNum; i++)
        {
            var star = enemies.get();
            star.setData('vector', new Phaser.Math.Vector2());
            if (star){
               sceneObj.tweens.add({
                    targets: star,
                    z: 1,
                    ease: 'Linear',
                    duration: Math.floor(Math.random()*16000)+7000,
                    delay: i * 300
                });
            }
        }//for
    }// spawn enemies

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //place turret where player clicks on screen at the cost of score
    function placeTurret(pointer) {
        var y = Math.floor(pointer.y);
        var x = Math.floor(pointer.x);
        var upgraded = false;
        if(x <= 800){
            if(score >= 50){
                var allTurrets = turrets.getChildren();
                for(var i = 0; i < allTurrets.length; i++) { 
                    if (((allTurrets[i].x-24) < x && x < (allTurrets[i].x+24)) && ((allTurrets[i].y-33) < y && y < (allTurrets[i].y+33))){
                        allTurrets[i].upgrade();
                        upgraded = true;
                    }
                }//check upgrade
            }
        if (!upgraded){
         var turretCost = (turrets.countActive() * 50)+50;
        if(score >= turretCost){
            var turret = turrets.get();
            if (turret)
            {
                turret.setActive(true);
                turret.setVisible(true);
                turret.place(y, x);
                turret.turLevelText = game.scene.scenes[0].add.text(turret.x, turret.y - 55, '1', { fontSize: '12px', fill: '#000' });
            }   
        score = score - turretCost;
        scoreText.setText('Score: ' + score);
        turCostText.setText('Turret Cost: ' + (turretCost+50));  
        }
    }//not upgraded
        }//within game map
    }//place turret

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Adds a bullet object to get fired
    function addBullet(x, y, angle, damage) {
        var bullet = bullets.get();
        if (bullet)
        {
            bullet.fire(x, y, angle, damage);
        }
    }//create bullet

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Gets closest enemy to turret
    function getEnemy(x, y, distance) {
        var enemyUnits = enemies.getChildren();
        for(var i = 0; i < enemyUnits.length; i++) {       
            if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
                return enemyUnits[i];
        }
        return false;
    }//get the closest enemy

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //bullet hits enemy and enemy takes damage and possibly dies
    function damageEnemy(enemy, bullet) {  
        // only if both enemy and bullet are alive
        if (enemy.active === true && bullet.active === true) {
            //remove the bullet right away
            enemy.hp = enemy.hp - bullet.damage;
            if (enemy.hp <= 0){
                enemy.destroy();
                score += 2;
                scoreText.setText('Score: ' + score);
            }
            bullet.destroy();
        }
    }//damage enemy
    
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //returns true/false if path line to be drawn intersects with already drawn lines
   function checkValidLine(drawnLines){
        var j = drawnLines.length-2;
        var denominator;
        var lineToDraw = drawnLines.length -1;
        var t1;
        var t2;
        
        while (j >= 0){
        //x1 y1, x2 y2 are line already drawn
        //x3 y3, x4 y4 are line to be drawn
        
        denominator = ((drawnLines[lineToDraw].x2 - drawnLines[lineToDraw].x1)*(drawnLines[j].y1 - drawnLines[j].y2))-((drawnLines[j].x1 - drawnLines[j].x2)*(drawnLines[lineToDraw].y2 - drawnLines[lineToDraw].y1));
        t1 = (((drawnLines[lineToDraw].y1-drawnLines[lineToDraw].y2)*(drawnLines[j].x1-drawnLines[lineToDraw].x1))+((drawnLines[lineToDraw].x2-drawnLines[lineToDraw].x1)*(drawnLines[j].y1-drawnLines[lineToDraw].y1)))/denominator;
        t2 = (((drawnLines[j].y1-drawnLines[j].y2)*(drawnLines[j].x1-drawnLines[lineToDraw].x1))+((drawnLines[j].x2-drawnLines[j].x1)*(drawnLines[j].y1-drawnLines[lineToDraw].y1)))/denominator;
        
        if (0<t1 && t1<1 && 0<t2 && t2<1){
        return false;
        console.log(drawnLines[lineToDraw].x1 + "," +drawnLines[lineToDraw].y1 + "," +drawnLines[lineToDraw].x2 + "," +drawnLines[lineToDraw].y2);
        console.log(drawnLines[j].x1 + "," + drawnLines[j].y1 + "," + drawnLines[j].x2 + "," + drawnLines[j].y2);
        }
        j--;
        }//while
        return true;
    }//draw valid line
    
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //selects an end point to finish the path based on which quadrant the last drawn line ended up
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

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



