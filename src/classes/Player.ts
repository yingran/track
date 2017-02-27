import { 
    KEY_LOCALSTORAGE_PLAYER_ID, 
    KEY_LOCALSTORAGE_PLAYER_NICK,
    EVENT_CREATE_ROOM,
    EVENT_JOIN_ROOM,
    EVENT_LEAVE_ROOM,
    EVENT_ENTER_GAME
} from "./Const";

/**
 * Player
 */

export default class Player {

    public nick: string;
    readonly id: string;
    readonly socket: SocketIOClient.Socket;

    constructor( socket: SocketIOClient.Socket ) {
        this.id = this._getIdFromStorage();
        this.nick = this._getNickFromStorage();
        this.socket = socket;
    }

    /**
     * set nick.
     */
    public setNick( nick: string ): void {
        this.nick = nick;
        localStorage.setItem( KEY_LOCALSTORAGE_PLAYER_NICK, nick );
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
        if ( !this.nick ) {
            throw( "the player has no nick." );
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
        if ( !this.nick ) {
            throw( "the player has no nick." );
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
     * get nick from localStorage. if no nick in localStorage, will return null.
     */
    private _getNickFromStorage(): string {
        let nick = localStorage.getItem( KEY_LOCALSTORAGE_PLAYER_NICK );
        return nick;
    }
}