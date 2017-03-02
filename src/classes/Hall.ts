import {
    EVENT_ROOM_LIST,
    EVENT_CREATE_ROOM,
    EVENT_ENTER_HALL,
    EVENT_JOIN_ROOM,
    EVENT_LEAVE_ROOM
} from "./Const";

/**
 * Hall
 */
export default class Hall {
    readonly socket: SocketIOClient.Socket;
    readonly container: HTMLElement;
    readonly containerRoomList: HTMLElement;
    readonly btnCreateRoom: HTMLElement;

    constructor( socket: SocketIOClient.Socket ) {
        this.socket = socket;
        this.container = document.getElementById( "hall" );
        this.containerRoomList = document.getElementById( "room-list" );
        this.btnCreateRoom = document.getElementById( "btn-create-room" );

        this.socket.on( EVENT_ROOM_LIST, ( data: any )=> {
            let list = JSON.parse( data );
            this.showRooms( list );
        });

        this.btnCreateRoom.addEventListener( "click", (evt)=> {
            this.createRoom();
        });
    }

    public enter() {
        this.socket.emit( EVENT_ENTER_HALL );
        this.show();
    }

    public show() {
        this.container.style.display = "block";
    }

    public hide() {
        this.container.style.display = "none";
    }

    public enterRoom( room: any ) {
        this.socket.emit( EVENT_JOIN_ROOM, JSON.stringify( {
            "room": room
        } ) );
    }

    public createRoom() {
        this.socket.emit( EVENT_CREATE_ROOM );
    }

    public showRooms( rooms: any ) {
        let str = "";
        for ( let i = 0, len = rooms.length; i < len; i++ ) {
            str += `
                <tr>
                    <td>${rooms[ i ]}</td>
                    <td>
                        <button type="button" class="btn btn-default" data-room="${rooms[ i ]}" >加入</button>
                    </td>
                </tr>
            `;
        }
        this.containerRoomList.innerHTML = str;
        Array.from( this.containerRoomList.querySelectorAll( "button" ) ).forEach( ( element ) => {
            element.addEventListener( "click", ( evt ) => {
                this.enterRoom( element.dataset[ "room" ] );
            } );
        });
    }


}