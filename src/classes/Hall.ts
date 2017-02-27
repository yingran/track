import {
    EVENT_ROOM_LIST,
    EVENT_ENTER_HALL
} from "./Const";

/**
 * Hall
 */

export default class Hall {
    readonly socket: SocketIOClient.Socket;
    readonly container: HTMLElement;
    readonly containerRoomList: HTMLElement;

    constructor( socket: SocketIOClient.Socket ) {
        this.socket = socket;
        this.container = document.getElementById( "hall" );
        this.containerRoomList = document.getElementById( "room-list" );

        this.socket.on( EVENT_ROOM_LIST, ( data: any )=> {
            let list = JSON.parse( data );
            this.showRooms( list );
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

    public showRooms( rooms: any ) {

    }


}