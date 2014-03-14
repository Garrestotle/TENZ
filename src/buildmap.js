/***
This file is going to contain all the main code to build levels for the game.
-Garrett
***/
var utils = require("./utils.js");
//Prototype for a new map.  Will contain all the data that a map for a level will need.
function MapProto(){
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
    this.rooms = [];
    //A function that will tell what tile the given X,Y are in.
    this.getLocation = function(x, y) {  
    	var tileX = Math.floor(x / map.tileSize);
        var tileY = Math.floor(y / map.tileSize);

        return  this.tiles[tileX][tileY];
	}
}
//Prototype for a new room.  Will contain all the data for an individual room.
function RoomProto(map){
	//pick a random x,y coordinate for the room's top left corner that's not too close to the edge.
    this.roomTLCornerX = utils.getRandomInt(0,(map.tiles.length-7));
    this.roomTLCornerY = utils.getRandomInt(0,(map.tiles[0].length-7));
    //stuff
    var maxWidth, maxHeight;
    this.width;
    this.height;
    //Set maximum width and height for the room
    if(this.roomTLCornerX > map.tiles.length - 25){
        maxWidth = map.tiles.length - this.roomTLCornerX+1;
    } else maxWidth = 25;
    if(this.roomTLCornerY > map.tiles[0].length - 25){
        maxHeight = map.tiles[0].length - this.roomTLCornerY+1;
    } else maxHeight = 25;
    //Randomly select a width and height for the room within the given bounds
    this.roomWidth = utils.getRandomInt(5,maxWidth);
    this.roomHeight = utils.getRandomInt(5,maxHeight);
    //Iterate through all the maximum values and create walls, and fill in the rest with floor.
    for(var x = 0; x < map.tiles.length; x++){
        for (var y = 0; y < map.tiles[x].length; y++){
            if (x >= this.roomTLCornerX && x <= this.roomTLCornerX + this.roomWidth && y >= this.roomTLCornerY && y <= this.roomTLCornerY + this.roomHeight ){
                if ( x == this.roomTLCornerX || x == this.roomTLCornerX + this.roomWidth || y == this.roomTLCornerY || y == this.roomTLCornerY + this.roomHeight ){
                    map.tiles[x][y] = new TileProtos.Wall();
                }else map.tiles[x][y] = new TileProtos.Floor();
            }
        }
    }

}
//An associative array that contains all of the prototypes for the tile types.
var TileProtos = {
	Generic: function(){
		this.name = "none";
		this.isPassable = false;
		this.blockVision = false;
		this.image = null;
		this.mapX;
		this.mapY;
		this.surroundingTiles = [];
	},
	Floor: function(){
		this.name = "floor";
        this.isPassable = true;
        this.blocksVision = false;
        this.image = new createjs.Bitmap("sprite_sheets/floor.png");
	},
	Wall: function(){
		this.name = "wall";
        this.isPassable = false;
        this.blocksVision = true;
        this.image = new createjs.Bitmap("sprite_sheets/wall.png");
	}
};
//This is used to connect two points with hallways
function makeCorridor(map,startx,starty,endx,endy){
	var r;

    if(startx < endx){
        for(r = startx; r <= endx; r++){
            map.tiles[r][starty] = new TileProtos.Floor();
            if(map.tiles[r+1][starty+1] === undefined)
                map.tiles[r+1][starty+1] = new TileProtos.Wall();
            if(map.tiles[r+1][starty-1] === undefined)
                map.tiles[r+1][starty-1] = new TileProtos.Wall();
        }
    }else {
       for(r = endx; r <= startx; r++){
            map.tiles[r][starty] = new TileProtos.Floor();
            if(map.tiles[r-1][starty+1] === undefined)
                map.tiles[r-1][starty+1] = new TileProtos.Wall();
            if(map.tiles[r-1][starty-1] === undefined)
                map.tiles[r-1][starty-1] = new TileProtos.Wall();
        } 
    }
    if(starty < endy){
        for(r = starty; r <= endy; r++){
            map.tiles[endx][r] = new TileProtos.Floor();
            if(map.tiles[endx+1][r-1] === undefined)
                map.tiles[endx+1][r-1] = new TileProtos.Wall();
            if(map.tiles[endx-1][r-1] === undefined)
                map.tiles[endx-1][r-1] = new TileProtos.Wall();
        }
    }else {
       for(r = endy; r <= starty; r++){
            map.tiles[endx][r] = new TileProtos.Floor();
            if(map.tiles[endx+1][r+1] === undefined)
                map.tiles[endx+1][r+1] = new TileProtos.Wall();
            if(map.tiles[endx-1][r+1] === undefined)
                map.tiles[endx-1][r+1] = new TileProtos.Wall();
        } 
    }

}
//Add all of the tiles to a container to be rendered.
function renderMap(map){
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
//This function will take care of all the map generating.
module.exports.generateMap = function() {
	var map = new MapProto();
	//Randomly decide the number of rooms
    var numRooms = utils.getRandomInt(10,20);
    //Make the rooms
    for (var r=0; r < numRooms; r++)
        map.rooms.push(new RoomProto(map));
    //Connect the rooms
    var corridorStartX,corridorStartY,corridorEndX,corridorEndY;
    for (var b=1; b < numRooms; b++){
    	corridorStartX = Math.floor(map.rooms[b-1].roomTLCornerX+map.rooms[b-1].roomWidth/2);
    	corridorStartY = Math.floor(map.rooms[b-1].roomTLCornerY+map.rooms[b-1].roomHeight/2);
    	corridorEndX = Math.floor(map.rooms[b].roomTLCornerX+map.rooms[b].roomWidth/2);
    	corridorEndY = Math.floor(map.rooms[b].roomTLCornerY+map.rooms[b].roomHeight/2);

        makeCorridor(map, corridorStartX, corridorStartY, corridorEndX, corridorEndY);
    }
    //Add all these shnazzy new tiles to the map container
    renderMap(map);
    //Send back the shiny new map
    return map;
};