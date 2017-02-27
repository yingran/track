import {
    EVENT_ADD_PLAYER,
    EVENT_REMOVE_PLAYER,
    EVENT_PLAYER_LIST,
    EVENT_JOIN_ROOM,
    EVENT_LEAVE_ROOM
} from "./Const";

export default class Room {
    
    readonly socket: SocketIOClient.Socket;
    readonly name: string;
    readonly container: HTMLElement;
    readonly containerPlayerList: HTMLElement;
    readonly btnLeaveRoom: HTMLElement;

    constructor( socket: SocketIOClient.Socket, name: string ) {
        this.socket = socket;
        this.name = name;
        this.container = document.getElementById( "room" );
        this.containerPlayerList = document.getElementById( "player-list" );
        this.btnLeaveRoom = document.getElementById( "btn-leave-room" );

        this.btnLeaveRoom.addEventListener( EVENT_LEAVE_ROOM, ( evt )=> {
            this.socket.emit( EVENT_LEAVE_ROOM );
        });

        this.socket.on( EVENT_PLAYER_LIST, ( data: any ) => {
            data = JSON.parse( data );
            this._showPlayers( data );
        });
    }

    public show( players?: any ) {
        this.container.style.display = "block";
        this._showPlayers( players );
    }

    public hide() {
        this.container.style.display = "none";
    }

    private _showPlayers( players: Array<any> = [] ){
        let str = "";
        for ( let key in players ) {
            str += `
                <tr>
                    <td>${players[key][ "name" ]}</td>
                </tr>
            `;
        }
        this.containerPlayerList.innerHTML = str;
    }
}