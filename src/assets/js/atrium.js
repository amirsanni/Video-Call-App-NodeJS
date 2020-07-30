let canvas;
let ctx;
let onlineUsers = 0;
let rowPos = 0;
let rowOffset = 0;
let columnPos = 0;

const OFFSET_TOP = 200;
const TOKEN_DIAMETER = 60;

let LOBBY_AREA;
let AREA_TWO;
let AREA_THREE;
let AREA_FOUR;

function initAtrium() {
canvas = document.getElementById("mycanvas");
ctx = canvas.getContext('2d');

//Quadrants
LOBBY_AREA = [0,canvas.width*.5,OFFSET_TOP,canvas.height*.5+OFFSET_TOP];
AREA_TWO = [canvas.width*.5,canvas.width,OFFSET_TOP,canvas.height*.5+OFFSET_TOP];
AREA_THREE = [0,canvas.width*.5,canvas.height*.5+OFFSET_TOP,canvas.height];
AREA_FOUR = [canvas.width*.5,canvas.width, canvas.height*.5+OFFSET_TOP, canvas.height];

init();
}

document.addEventListener('DOMContentLoaded', function() {
    initAtrium();
}, false);

function init() {
    //top of UI
    ctx.fillRect(0, OFFSET_TOP, canvas.width, 2);
    //left of UI
    ctx.fillRect(0, OFFSET_TOP, 2, canvas.height);
    //bottom of UI    
    ctx.fillRect(0, canvas.height-2, canvas.width, 2);
    //right of UI
    ctx.fillRect(canvas.width-2, OFFSET_TOP, 2, canvas.height);
}

function createLobbyGuest(){
    checkAndSetRowPosition();
    ctx.beginPath();
    ctx.ellipse(TOKEN_DIAMETER*(rowPos+1), columnPos+OFFSET_TOP+TOKEN_DIAMETER, TOKEN_DIAMETER/2, TOKEN_DIAMETER/2, 0, 0, 360);
    ctx.stroke();
    onlineUsers++;
}

function checkAndSetRowPosition(){
    if(((rowPos+1)*TOKEN_DIAMETER) >= LOBBY_AREA[1]-TOKEN_DIAMETER) {
        rowOffset += rowPos;
        rowPos = 0;
        columnPos+=TOKEN_DIAMETER;
    }
    else{
        rowPos = onlineUsers - rowOffset;
    }
}