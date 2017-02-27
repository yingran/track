import * as io from "socket.io-client";

import Game from "./classes/Game";
import Player from "./classes/Player";
import Hall from "./classes/Hall";
import {

} from "./classes/Const";

let socket = io( "http://localhost:3000" );
let hall = new Hall( socket );
let player = new Player( socket );

let containerPlayer: any = document.getElementById( "player" );
let containerWelcome: any = document.getElementById( "welcome" );


function connect() {
    containerWelcome.style.display = "none";
    if ( !player.nick ) {
        containerPlayer.style.display = "block";
    } else {
        hall.enter();
    }

    handleSetNick();
}

function handleSetNick() {
    let inputNick: any = document.getElementById( "input-nick" );
    let formNick: any = document.getElementById( "form-nick" );
    formNick.addEventListener( "submit", ( evt: Event )=> {
        evt.preventDefault();
        if ( !inputNick.value ) {
            alert( "请输入昵称！" );
            return;
        }
        player.setNick( inputNick.value );
    });
}

socket.on( "connect", connect);
socket.on( "disconnect", ()=> {
    console.log( "disconnect" );
});