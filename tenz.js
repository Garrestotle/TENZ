(function () {
    "use strict";
    var RIGHT_KEY_CODE = 68; //letter d
    var LEFT_KEY_CODE = 65; //letter a
    var UP_KEY_CODE = 87; //letter w
    var DOWN_KEY_CODE = 83; //letter s
    var KEYCODE_LEFT = 37; //left arrow
    var KEYCODE_RIGHT = 39; //right arrow
    //This contains all the information about the map of the current level
    function MapProto() {
        //A container to drop all of the map in
        this.container = new createjs.Container();
        //Number of pixels in the map based on height and width
        this.width = 3000;
        this.height = 3000;
        //arbitrary starting x/y location
        this.container.x = this.container.y = 0;
        //The height and width of tiles.
        this.tileSize = 30;
        //A 2d array that will contain all of the actual map tiles
        this.tiles = new Array(this.width / this.tileSize); //currently 100
        for (var i = 0; i <= this.width / this.tileSize; i++)
            this.tiles[i] = new Array(this.height / this.tileSize); //currently 50
        //How many tiles there are in both dimensions
        this.numTilesX = this.tiles.length;
        this.numTilesY = this.tiles[0].length;
        //An array that will contain info about each room
        this.rooms = new Array();


    }
    var map = new MapProto();

    //Returns a random integer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    //Prototype for creating new rooms
    function RoomProto(){
        //pick a random x,y coordinate for the room's top left corner that's not too close to the edge.
        this.roomTLCornerX = getRandomInt(0,map.tiles.length-7);
        this.roomTLCornerY = getRandomInt(0,map.tiles[0].length-7);
        var maxWidth, maxHeight;
        //Set maximum width and height for the room
        if(this.roomTLCornerX > map.tiles.length - 30){
            maxWidth = map.tiles.length - this.roomTLCornerX;
        } else maxWidth = 25;
        if(this.roomTLCornerY > map.tiles[0].length - 30){
            maxHeight = map.tiles[0].length - this.roomTLCornerY;
        } else maxHeight = 25;
        //Randomly select a width and height for the room within the given bounds
        this.roomWidth = getRandomInt(5,maxWidth);
        this.roomHeight = getRandomInt(5,maxHeight);
        //Iterate through all the maximum values and create walls, and fill in the rest with floor.
        for(var x = 0; x < map.tiles.length; x++){
            for (var y = 0; y < map.tiles[x].length; y++){
                if (x >= this.roomTLCornerX && x <= this.roomTLCornerX + this.roomWidth && y >= this.roomTLCornerY && y <= this.roomTLCornerY + this.roomHeight ){
                    if ( x == this.roomTLCornerX || x == this.roomTLCornerX + this.roomWidth || y == this.roomTLCornerY || y == this.roomTLCornerY + this.roomHeight ){
                        map.tiles[x][y] = new tileProtos.Wall();
                    }else map.tiles[x][y] = new tileProtos.Floor();
                }
            }
        }

    }
    //An object containing all the prototypes for all of the different tile types
    var tileProtos = {
        Floor: function () {
            this.name = "floor";
            this.isPassable = true;
            this.blocksVision = false;
            this.image = new createjs.Bitmap("sprite_sheets/floor.png");
        },
        Wall: function () {
            this.name = "wall";
            this.isPassable = false;
            this.blocksVision = true;
            this.image = new createjs.Bitmap("sprite_sheets/wall.png");
        },
        Blank: function () {
            this.name = "thevoid";
            this.blocksVision = true;
            this.isPassable = false;
            this.image = null;
        }
    };
    //A prototype for a generic game object (non-topography/tile)
    function GameObject() {

    }
    //A prototype for a game object with some form of intelligence
    function Actor() {

    }
    //A prototype for a game object for a player that in theory has some form of intelligencew
    function Player() {


        var spritesheetdata ={
            framerate: 1,
            images: ["./sprite_sheets/player.png"],
            frames: {width:40,height:40,count:4,regx:20,regy:20},
            animations:{
                standing: 0,
                down: 0,
                up: 2,
                right: 1,
                left: 3
            }
        };
        var spritesheet = new createjs.SpriteSheet(spritesheetdata);
        //Create a sprite for the player and set the initial x,y coord
        this.sprite = new createjs.Sprite(spritesheet);
        this.sprite.gotoAndStop("standing");
        this.sprite.x = this.sprite.y = 50;
        //An array for various key presses so that we can tell when the player wants to move about
        this.keysPressed = [];
        this.keysPressed[RIGHT_KEY_CODE] = false;
        this.keysPressed[LEFT_KEY_CODE] = false;
        this.keysPressed[UP_KEY_CODE] = false;
        this.keysPressed[DOWN_KEY_CODE] = false;
        //How fast the player can move in pixels/second
        this.maxSpeed = 170;
        this.speed = this.maxSpeed;
        //This is run every update of the game loop to carry out the player's will
        this.update = function (delta) {
            //Remember the players current x,y coordinates, in case they try to do something verboten
            var prevX = this.sprite.x;
            var prevY = this.sprite.y;
            var mapPrevX = map.container.x;
            var mapPrevY = map.container.y;

            //this.sprite.gotoAndStop("standing");

            if(this.keysPressed[UP_KEY_CODE] || this.keysPressed[DOWN_KEY_CODE]){
                if(this.keysPressed[LEFT_KEY_CODE] || this.keysPressed[RIGHT_KEY_CODE]){
                    this.speed = Math.sqrt(Math.pow(this.maxSpeed,2)/2);
                }else this.speed = this.maxSpeed;
            }else this.speed = this.maxSpeed;

            //Check if a button is pressed and move the player in the correct direction
            if (this.keysPressed[RIGHT_KEY_CODE] && !this.keysPressed[LEFT_KEY_CODE]){
               this.sprite.x += (delta)/1000 * this.speed; 
               map.container.x -= (delta)/1000 * this.speed;
               //if(this.sprite.currentAnimation == "standing" || this.sprite.currentAnimation == "left")
               this.sprite.gotoAndPlay("right");
            } 
            if (this.keysPressed[LEFT_KEY_CODE] && !this.keysPressed[RIGHT_KEY_CODE]){
                this.sprite.x -= (delta)/1000 * this.speed;
                map.container.x += (delta)/1000 * this.speed;
                //if(this.sprite.currentAnimation == "standing" || this.sprite.currentAnimation == "right")
                this.sprite.gotoAndPlay("left");
            } 
            if (this.keysPressed[UP_KEY_CODE] && !this.keysPressed[DOWN_KEY_CODE]) {
                this.sprite.y -= (delta)/1000 * this.speed;
                map.container.y += (delta)/1000 * this.speed;
                //if(this.sprite.currentAnimation == "standing" || this.sprite.currentAnimation == "down")
                this.sprite.gotoAndPlay("up");
            }
            if (this.keysPressed[DOWN_KEY_CODE] && !this.keysPressed[UP_KEY_CODE]) {
                this.sprite.y += (delta)/1000 * this.speed;
                map.container.y -= (delta)/1000 * this.speed;
                //if(this.sprite.currentAnimation == "standing" || this.sprite.currentAnimation == "up")
                this.sprite.gotoAndPlay("down");
            }
            //check if the player moved somewhere they shouldn't, at which point, move them back
            if (currentTile(this.sprite.x+20, this.sprite.y+35).tile !== undefined)
                if (!currentTile(this.sprite.x+20, this.sprite.y+35).tile.isPassable) {
                    this.sprite.x = prevX;
                    this.sprite.y = prevY;
                    map.container.x = mapPrevX;
                    map.container.y = mapPrevY;
                }

            //check if the player changed which tile was being stood on
            if(currentTile(this.sprite.x, this.sprite.y).x !== currentTile(prevX, prevY).x || currentTile(this.sprite.x, this.sprite.y).y !== currentTile(prevX, prevY).y){
                this.fieldOfVision(); 
            }
            
        };
        this.fieldOfVision = function(){
            //get rid of the currently seen tiles
                for (var r = 0; r <= map.tiles.length; r++) {
                    if (map.tiles[r] !== undefined) {
                        for (var b = 0; b <= map.tiles[r].length; b++) {
                            if (map.tiles[r][b] !== undefined) {
                                map.tiles[r][b].image.alpha = .3;
                            }
                        }
                    }
                }
                //update it with the newly seen tiles
                for (var r = 0; r < 360; r+=3){ 
                    lineOfSight(this.sprite.x+8, this.sprite.y+20, r);
                }
        };

    }
    function Pet(){

        var spritesheetdata ={
            framerate: 1,
            images: ["./sprite_sheets/Cat.png"],
            frames: {width:30,height:20,count:4,regx:15,regy:19},
            animations:{
                standing: getRandomInt(0,2),
                down: 0,
                up: 3,
                right: 1,
                left: 2
            }
        };
        var spritesheet = new createjs.SpriteSheet(spritesheetdata);

        var Destination = null;

        
        this.goingRight = false;
        this.goingLeft = false;
        this.goingUp = false;
        this.goingDown = false;

        //Create a sprite for the player and set the initial x,y coord
        this.sprite = new createjs.Sprite(spritesheet);
        this.sprite.gotoAndStop("standing");
        this.sprite.x = this.sprite.y = 50;

        this.speed = 10;

        function aStar(){

        }

        function isSeen(sprite){
            if(currentTile(sprite.x,sprite.y).tile.image.alpha == .3)
                sprite.visible = false;
            else sprite.visible = true;
        }



        this.update = function(){
            //AI stuff
            //check to see if the pet has a straight shot
            /*
            if(this.Destination === null){
                var playerTile = currentTile(player.sprite.x, player.sprite.y);
                if(map.tile[playerTile.x+1][playerTile.y].isPassable)
                    Destination = {
                        x: playerTile.x*map.tileSize + map.tileSize/2,
                        y: playerTile.y*map.tileSize + map.tileSize/2
                    };
            }else{

            }
            */
            isSeen(this.sprite);

        }

    }
    //Establish pecking order
    Actor.prototype = new GameObject();
    Player.prototype = new Actor();
    //Wait till the window loads before you start doing things
    document.addEventListener('DOMContentLoaded', function () {
        init();
    });
    //Actually start the game 
    function init() {
        //Crreate a stage and bind it to the canvas
        var stage = new createjs.Stage("gamewindow");
        //Tell it to use requestAnimationFrame API and set function to be called as game loop
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener('tick', tick);
        //Get dimensions of canvas
        var VIEW_WIDTH = parseInt(document.getElementById("gamewindow").getAttributeNode("width").value);
        var VIEW_HEIGHT = parseInt(document.getElementById("gamewindow").getAttributeNode("height").value);
        //Describe some rooms in terms of tile locations
        buildmaparray();
        //Actually render the tiles to the map container
        buildmap();
        //Make a player and set initial location
        var player = new Player();
        player.sprite.x = map.rooms[0].roomTLCornerX*map.tileSize + 77;
        player.sprite.y = map.rooms[0].roomTLCornerY*map.tileSize + 77;
        //Make a pet and set initial location
        var pet = new Pet();
        pet.sprite.x = player.sprite.x + 77;
        pet.sprite.y = player.sprite.y + 77;
        //Add player & pet to the map
        map.container.addChild(pet.sprite);
        map.container.addChild(player.sprite);
        //Move the map container so that the player is actually on the screen
        map.container.x += Math.floor(VIEW_WIDTH/2) - player.sprite.x - 15;
        map.container.y += Math.floor(VIEW_HEIGHT/2) - player.sprite.y - 15;
        
        //Actually listen for key press events
        document.addEventListener('keydown', keyDown, false);
        document.addEventListener('keyup', keyUp, false);
        //Apparently I didn't actually end up using these...because they seem like decent ideas
        var translateX = player.sprite.x+map.container.x+10;
        var translateY = player.sprite.y+map.container.y+15;
        

        //Make the map unseen
        for (var r = 0; r <= map.tiles.length; r++) {
            if (map.tiles[r] !== undefined) {
                for (var b = 0; b <= map.tiles[r].length; b++) {
                    if (map.tiles[r][b] !== undefined) {
                        map.tiles[r][b].image.visible = false; //comment out this line to get rid of exploring
                        map.tiles[r][b].image.alpha = .3;
                    }
                }
            }
        }
        //Add Player's initial view
        player.fieldOfVision();
        //Add the map to the stage
        stage.addChild(map.container);
        
        //The function that builds the rooms
        function buildmaparray() {
            //Randomly decide the number of rooms
            var numRooms = getRandomInt(10,20);
            //Make the rooms
            for (var r=0; r < numRooms; r++)
                map.rooms[r] = new RoomProto;
            //Connect the rooms
            for (var b=1; b < numRooms; b++){
                makeCorridor(Math.floor(map.rooms[b-1].roomTLCornerX+map.rooms[b-1].roomWidth/2),Math.floor(map.rooms[b-1].roomTLCornerY+map.rooms[b-1].roomHeight/2),Math.floor(map.rooms[b].roomTLCornerX+map.rooms[b].roomWidth/2),Math.floor(map.rooms[b].roomTLCornerY+map.rooms[b].roomHeight/2));

            }
            //Make Corridors between the rooms
            function makeCorridor(startx,starty,endx,endy){
                var r;

                if(startx < endx){
                    for(r = startx; r <= endx; r++){
                        map.tiles[r][starty] = new tileProtos.Floor();
                        if(map.tiles[r+1][starty+1] === undefined)
                            map.tiles[r+1][starty+1] = new tileProtos.Wall();
                        if(map.tiles[r+1][starty-1] === undefined)
                            map.tiles[r+1][starty-1] = new tileProtos.Wall();
                    }
                }else {
                   for(r = endx; r <= startx; r++){
                        map.tiles[r][starty] = new tileProtos.Floor();
                        if(map.tiles[r-1][starty+1] === undefined)
                            map.tiles[r-1][starty+1] = new tileProtos.Wall();
                        if(map.tiles[r-1][starty-1] === undefined)
                            map.tiles[r-1][starty-1] = new tileProtos.Wall();
                    } 
                }
                if(starty < endy){
                    for(r = starty; r <= endy; r++){
                        map.tiles[endx][r] = new tileProtos.Floor();
                        if(map.tiles[endx+1][r-1] === undefined)
                            map.tiles[endx+1][r-1] = new tileProtos.Wall();
                        if(map.tiles[endx-1][r-1] === undefined)
                            map.tiles[endx-1][r-1] = new tileProtos.Wall();
                    }
                }else {
                   for(r = endy; r <= starty; r++){
                        map.tiles[endx][r] = new tileProtos.Floor();
                        if(map.tiles[endx+1][r+1] === undefined)
                            map.tiles[endx+1][r+1] = new tileProtos.Wall();
                        if(map.tiles[endx-1][r+1] === undefined)
                            map.tiles[endx-1][r+1] = new tileProtos.Wall();
                    } 
                }

            }
        }
        //Render the tiles described by the map arrays
        function buildmap() {
            for (var r = 0; r <= map.tiles.length; r++) {
                if (map.tiles[r] !== undefined) {
                    for (var b = 0; b <= map.tiles[r].length; b++) {
                        if (map.tiles[r][b] !== undefined) {
                            map.tiles[r][b].image.x = r * map.tileSize;
                            map.tiles[r][b].image.y = b * map.tileSize;
                            map.container.addChild(map.tiles[r][b].image);
                        }
                    }
                }
            }
        }
        //Set up a FPS counter
        var fps = new createjs.Text("FPS: --", "20px Arial", "#F00");
            fps.x = fps.y = 10;
            stage.addChild(fps);
        var ptile = new createjs.Text("Player's Coord: --", "20px Arial", "#F00");
            ptile.x = 10;
            ptile.y = 30;
            stage.addChild(ptile);
        //Main game loop
        function tick(event) {

            //Update the FPS counter
            fps.text = "FPS: "+Math.round(createjs.Ticker.getMeasuredFPS());
            ptile.text = "Player's Coord: "+currentTile(player.sprite.x,player.sprite.y).x+","+currentTile(player.sprite.x,player.sprite.y).y;
            //Update the player
            player.update(event.delta);
            //Update the pet
            pet.update();
            //Redraw the screen
            stage.update();
        }
        //What to do if a button is pressed
        function keyDown(e) {
            if (e.keyCode in player.keysPressed) player.keysPressed[e.keyCode] = true;
        }
        //What to do if a button is released
        function keyUp(e) {
            if (e.keyCode in player.keysPressed) player.keysPressed[e.keyCode] = false;
        }


    }

    

//Casts a ray from a given x,y coordinate in a degree and illuminates all touched tiles.
    function lineOfSight(startx, starty, degree){
        var nextX = Math.cos(degree * (Math.PI / 180));
        var nextY = Math.sin(degree * (Math.PI / 180));
        var currX = startx;
        var currY = starty;
        var counter = 0;
        var viewDist = 260;
        var currentDist = 0;


        while (currentTile(currX,currY).tile !== undefined && counter < 10){
            currentTile(currX,currY).tile.image.alpha = 1;
            if (!currentTile(currX,currY).tile.image.visible) 
                currentTile(currX,currY).tile.image.visible = true;
            if (currentTile(currX,currY).tile.blocksVision) counter++;
            currX += nextX;
            currY += nextY;
            if (currY/map.tileSize > map.numTilesY) currY = currY-(currY-(map.numTilesY*map.tileSize));
            if (currX < 0) currX = 0;

            currentDist = Math.sqrt(Math.pow(currX-startx,2)+Math.pow(currY-starty,2));
            if(currentDist > viewDist) break;
            

        }
        currX += map.container.x;
        currY += map.container.y;

    }
    //Given an x and y value, returns what tile that point is within
    function currentTile(x, y) {
        var tilex = Math.floor(x / map.tileSize);
        var tiley = Math.floor(y / map.tileSize);

        return {
            tile: map.tiles[tilex][tiley],
            x: tilex,
            y: tiley
        };  
        
    };
}());