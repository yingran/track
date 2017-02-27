import { 
    KEY_LOCALSTORAGE_PLAYER_ID, 
    KEY_LOCALSTORAGE_PLAYER_NAME,

    EVENT_CREATE_PLAYER,
    EVENT_RENAME_PLAYER,

    EVENT_CREATE_ROOM,
    EVENT_JOIN_ROOM,
    EVENT_LEAVE_ROOM,
    EVENT_ENTER_GAME
} from "./Const";

/**
 * Player
 */
export default class Player {

    public name: string;
    readonly id: string;
    readonly socket: SocketIOClient.Socket;

    constructor( socket: SocketIOClient.Socket ) {
        this.id = this._getIdFromStorage();
        this.name = this._getnameFromStorage();
        this.socket = socket;
        this.socket.emit( EVENT_CREATE_PLAYER, JSON.stringify({
            "id": this.id,
            "name": this.name
        }));
    }

    /**
     * set name.
     */
    public setName( name: string ): void {
        this.name = name;
        localStorage.setItem( KEY_LOCALSTORAGE_PLAYER_NAME, name );
        this.socket.emit( EVENT_RENAME_PLAYER, JSON.stringify({
            "name": this.name
        }));
    }

    /**
     * enter the game
     */
    public enterGame() {
        this.socket.emit( EVENT_ENTER_GAME );
    }

    /**
     * create room
     */
    public createRoom() {
        if ( !this.id ) {
            throw( "the player has no id." );
        }
        if ( !this.name ) {
            throw( "the player has no name." );
        }
        this.socket.emit( EVENT_CREATE_ROOM );
    }

    /**
     * join room
     * @param room room name
     */
    public joinRoom( room: string ) {
        if ( !this.id ) {
            throw( "the player has no id." );
        }
        if ( !this.name ) {
            throw( "the player has no name." );
        }
        this.socket.emit( EVENT_JOIN_ROOM, { "name": room } );
    }

    /**
     * leave from room
     */
    public leavenRoom() {
        this.socket.emit( EVENT_LEAVE_ROOM );
    }

    /**
     * get id from localStorage. if no id in localStorage, will generate a random string as id.
     */
    private _getIdFromStorage(): string {
        let id = localStorage.getItem( KEY_LOCALSTORAGE_PLAYER_ID );
        if ( !id ) {
            id = (new Date().getTime() + Math.random()).toString(36);
        }
        localStorage.setItem( KEY_LOCALSTORAGE_PLAYER_ID, id );
        return id;
    }

    /**
     * get name from localStorage. if no name in localStorage, will return null.
     */
    private _getnameFromStorage(): string {
        let name = localStorage.getItem( KEY_LOCALSTORAGE_PLAYER_NAME );
        return name;
    }
}