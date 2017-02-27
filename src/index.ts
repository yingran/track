import * as io from "socket.io-client";

import Game from "./classes/Game";
import Player from "./classes/Player";
import Hall from "./classes/Hall";
import Room from "./classes/Room";
import {
    EVENT_JOIN_ROOM,
    EVENT_LEAVE_ROOM
} from "./classes/Const";

let socket = io( "http://localhost:3000" );
let hall: Hall;
let player: Player;
let room: Room;

let containerPlayer: any = document.getElementById( "player" );
let containerWelcome: any = document.getElementById( "welcome" );

function connect() {
    hall = new Hall( socket );
    player = new Player( socket );
    enterHall();

    socket.on( EVENT_JOIN_ROOM, ( data: any )=> {
        data = JSON.parse( data );
        room = new Room( socket, data[ "room" ]);
        hideAllContainer();
        room.show( data[ "players" ] );
    });

    socket.on( EVENT_LEAVE_ROOM, ( data: any )=> {
        hideAllContainer();
        hall.show();
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