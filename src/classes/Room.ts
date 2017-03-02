import {
    EVENT_ADD_PLAYER,
    EVENT_REMOVE_PLAYER,
    EVENT_PLAYER_LIST,
    EVENT_JOIN_ROOM,
    EVENT_LEAVE_ROOM,
    EVENT_ASSIGN_ADMINISTRATOR,
    EVENT_REVOKE_ADMINISTRATOR,
    EVENT_ENTER_GAME,
    EVENT_LEAVE_GAME
} from "./Const";

export default class Room {
    
    public name: string;
    readonly socket: SocketIOClient.Socket;
    readonly container: HTMLElement;
    readonly containerRoomName: HTMLElement;
    readonly containerPlayerList: HTMLElement;
    readonly btnLeaveRoom: HTMLElement;
    readonly btnStartGame: HTMLElement;

    constructor( socket: SocketIOClient.Socket ) {
        this.socket = socket;
        this.container = document.getElementById( "room" );
        this.containerRoomName = this.container.querySelector( "h2" );
        this.containerPlayerList = document.getElementById( "player-list" );
        this.btnLeaveRoom = document.getElementById( "btn-leave-room" );
        this.btnStartGame = document.getElementById( "btn-start-game" );

        this.btnLeaveRoom.addEventListener( "click", ( evt )=> {
            this.socket.emit( EVENT_LEAVE_ROOM, JSON.stringify( {
                "room": this.name
            }) );
        });

        this.btnStartGame.addEventListener( "click", ( evt )=> {
            this.socket.emit( EVENT_ENTER_GAME );
        });

        this.socket.on( EVENT_PLAYER_LIST, ( data: any ) => {
            data = JSON.parse( data );
            this._showPlayers( data );
        });

        this.socket.on( EVENT_ASSIGN_ADMINISTRATOR, ( data: any ) => {
            this.btnStartGame.className = this.btnStartGame.className.replace( / *hidden/gi, "");
        } );

        this.socket.on( EVENT_REVOKE_ADMINISTRATOR, ( data: any ) => {
            this.btnStartGame.className = this.btnStartGame.className + " hidden";
        } );
    }

    public show() {
        this.container.style.display = "block";
    }

    public hide() {
        this.container.style.display = "none";
    }

    public setName( name: string ) {
        this.name = name;
        this.containerRoomName.innerHTML = this.name;
    }

    private _showPlayers( players: Array<any> = [] ){
        let str = "";
        for ( let i = 0, len = players.length; i < len; i++ ) {
            str += `
                <tr>
                    <td>${players[ i ][ "name" ]}</td>
                </tr>
            `;
        }
        this.containerPlayerList.innerHTML = str;
    }
}