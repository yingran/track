import * as io from "socket.io-client";

import Game from "./classes/Game";
import Player from "./classes/Player";
import Hall from "./classes/Hall";
import Room from "./classes/Room";
import {
    EVENT_JOIN_ROOM,
    EVENT_LEAVE_ROOM,
    EVENT_PLAYER_LIST,
    EVENT_ENTER_GAME,
    EVENT_START_GAME,
    EVENT_COUNTDOWN
} from "./classes/Const";

let socket = io( "http://localhost:8081" );
let hall: Hall;
let player: Player;
let room: Room;

let containerPlayer: any = document.getElementById( "player" );
let containerWelcome: any = document.getElementById( "welcome" );
let containerCountdown: any = document.getElementById( "countdown" );

function connect() {
    hall = new Hall( socket );
    player = new Player( socket );
    room = new Room( socket );
    enterHall();

    socket.on( EVENT_JOIN_ROOM, ( data: any )=> {
        data = JSON.parse( data );
        room.setName( data[ "room" ] );
        hideAllContainer();
        room.show();
    });

    socket.on( EVENT_LEAVE_ROOM, ( data: any )=> {
        hideAllContainer();
        hall.enter();
    });

    socket.on( EVENT_ENTER_GAME, ( data: any ) => {
        hideAllContainer();
        Game.start( socket );
        containerCountdown.style.display = "block";
    } );

    socket.on( EVENT_COUNTDOWN, ( data: any ) => {
        data = JSON.parse( data );
        containerCountdown.innerHTML = data[ "count" ];
    } );

    socket.on( EVENT_START_GAME, ( data: any ) => {
        data = JSON.parse( data );
        containerCountdown.innerHTML = "START";
        setTimeout( () => {
            containerCountdown.style.display = "none";
        }, 1000 );
    } );

    socket.on( "TEST", ( data: any ) => {
        console.log( data );
    });
}

function enterHall() {
    containerWelcome.style.display = "none";
    if ( !player.name ) {
        containerPlayer.style.display = "block";
    } else {
        hall.enter();
    }
    handleSetName();
}

function handleSetName() {
    let inputName: any = document.getElementById( "input-name" );
    let formName: any = document.getElementById( "form-name" );
    formName.addEventListener( "submit", ( evt: Event )=> {
        evt.preventDefault();
        if ( !inputName.value ) {
            alert( "请输入昵称！" );
            return;
        }
        player.setName( inputName.value );
        containerPlayer.style.display = "none";
        hall.enter();
    });
}

function hideAllContainer() {
    Array.from( document.querySelectorAll( ".container" ) ).forEach( ( element: any ) => {
        element.style.display = "none";
    });
}

socket.on( "connect", connect);
socket.on( "disconnect", ()=> {
    console.log( "disconnect" );
});