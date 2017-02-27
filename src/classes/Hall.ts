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

        this.socket.on( EVENT_CREATE_ROOM, ( data: any )=> {
            let room = JSON.parse( data );
            this.addRoom( room );
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

    public addRoom( data: any ) {
        let tr = document.createElement( "tr" );
        let str = `
            <td>${data["room"]}</td>
            <td>
                <button type="button" class="btn btn-default" data-room="${data["room"]}">加入</button>
            </td>
        `;
        tr.innerHTML = str;
        this.containerRoomList.appendChild( tr );
        tr.querySelector( "button" ).addEventListener( "click", ( evt ) => {
            this.enterRoom( data["room"] );
        });
    }

    public showRooms( rooms: any ) {
        let str = "";
        for ( let key in rooms ) {
            if ( !/^room_\d+$/gi.test( key.toLocaleLowerCase() ) ) {
                continue;
            }
            str += `
                <tr>
                    <td>${key}</td>
                    <td>
                        <button type="button" class="btn btn-default" data-room="${key}" >加入</button>
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