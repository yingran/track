import * as THREE from "three";
import * as Ammo from "ammo.js";
import * as io from "socket.io-client";

import Resource from "./Resource";
import World from "./World";
import Map from "./Map";
import Player from "./Player";
import Vehicle from "./Vehicle";

import {
    EVENT_PLAYER_ACTION,
    EVENT_COUNTDOWN,
    EVENT_START_GAME,
    EVENT_FINISH_GAME
} from "./Const";

let clientSocket: SocketIOClient.Socket;
let world: World;
let vehicle: Vehicle;
let keysActions: any = {
    "KeyW": "acceleration",
    "KeyS": "braking",
    "KeyA": "left",
    "KeyD": "right"
};
let colors: Array<number> = [
    0x990000,
    0x999900,
    0x009900,
    0x009999,
    0x000099
];

let animateFrame: any;


export default class Game {

    static STATE_IDLE: number = 1;
    static STATE_COUNTDOWN: number = 2;
    static STATE_PLAYING: number = 3;
    static STATE_FINISH: number = 4;

    readonly socket: SocketIOClient.Socket;
    private _playerId: string;
    private _vehicles: any;
    private _vehicle: Vehicle;  
    private _players: Array<any>;
    private _map: Map;

    public container: HTMLElement;
    public containerCountdown: HTMLElement;
    public containerRankList: HTMLElement;

    public state: number;

    constructor( socket: SocketIOClient.Socket, playerId: string ) {
        this.socket = clientSocket = socket;
        this._playerId = playerId;
        this._players = [];
        this._vehicles = {};
        this.state = Game.STATE_IDLE;

        this.container = document.getElementById( "game" );
        this.containerCountdown = document.getElementById( "countdown" );
        this.containerRankList = document.getElementById( "rank-list" );

        this._attachEvent();
        this._attachDataListener();
    }

    private _addVehicles() {
        let quat: THREE.Quaternion;
        let players = this._players;
        this._map.startLine.getWorldPosition();
        quat = new THREE.Quaternion( 0, 0, 0, 1 );
        quat.setFromEuler( this._map.startLine.rotation );
        for ( let i = 0, len = players.length; i < len; i++ ) {
            let x = Math.pow( -1, i ) * Math.ceil( i / 2 ) * 4;
            let vehicle = new Vehicle( world, this._map.startLine.localToWorld( new THREE.Vector3( x, 1, -5 ) ), quat, colors[ i ], players[ i ][ "name" ] );
            this._vehicles[ players[ i ][ "id" ] ] = vehicle;
            if ( players[ i ][ "id" ] === this._playerId ) {
                this._vehicle = vehicle;
            }
        }

        vehicle = this._vehicle;
    }

    private _destinationTest( dt: any ): void {
        let callback = new Ammo.ConcreteContactResultCallback();
        let game = this;
        callback.addSingleResult = function() {
            if ( game.state === Game.STATE_PLAYING ) {
                game._finish();
            }
        }
        world.physicsWorld.contactPairTest( this._vehicle.classisBody, this._map.finishLine, callback );
    }

    private _finish() { 
        this.state = Game.STATE_FINISH;
        this.socket.emit( EVENT_FINISH_GAME, JSON.stringify( {
            "player": this._playerId
        } ));
        this.containerRankList.style.display = "block";
        this._vehicle.break();
    }

    private _handleKeyUp( evt: any ) {
        if ( this.state === Game.STATE_PLAYING && keysActions[evt.code] ) {
            evt.preventDefault();
            evt.stopPropagation();
            this.socket.emit( EVENT_PLAYER_ACTION, JSON.stringify( {
                "action": keysActions[evt.code],
                "value": 0
            } ));
            return false;
        }
    }

    private _handleKeyDown( evt: any ) {
        if ( this.state === Game.STATE_PLAYING && keysActions[evt.code] ) {
            evt.preventDefault();
            evt.stopPropagation();
            this.socket.emit( EVENT_PLAYER_ACTION, JSON.stringify( {
                "action": keysActions[evt.code],
                "value": 1
            } ));
            return false;
        }
    }

    private _handleWindowResize( evt: any ) {
        if ( this.state !== Game.STATE_IDLE && world ) {
            world.resize( window.innerWidth, window.innerHeight );
        }
    }
    
    private _attachEvent() {   
        window.addEventListener( "keydown", ( evt: any ) => {
            this._handleKeyDown( evt );
        } );
        window.addEventListener( "keyup", ( evt: any ) => {
            this._handleKeyUp( evt );
        } );
        window.addEventListener( "resize", ( evt: any ) => {
            this._handleWindowResize( evt );
        } );
    }

    private _attachDataListener() {

        this.socket.on( EVENT_COUNTDOWN, ( data: any ) => {
            this._countdown( data );
        } );
        this.socket.on( EVENT_START_GAME, ( data: any ) => {
            this._startGame( data );
        } );

        this.socket.on( EVENT_PLAYER_ACTION, ( data: any ) => {
            this._translateVehicle( data );
        } );

        this.socket.on( EVENT_FINISH_GAME, ( data: any ) => {
            this._updateRankList( data );
        } );
    }

    private _countdown( data: any ) {
        data = JSON.parse( data );
        this.containerCountdown.innerHTML = data[ "count" ];
    }

    private _prepareGame() {
        this.state = Game.STATE_COUNTDOWN;
        this.container.style.display = "block";
        world = new World( window.innerWidth, window.innerHeight );
        this.container.appendChild( world.domElement );
        this._map = new Map( world, Resource.maps[ "test" ] );

        this._addVehicles();
        world.syncList.push( this._destinationTest.bind( this ) );
        animate();
    }

    private _startGame( data: any ) {
        data = JSON.parse( data );
        this.state = Game.STATE_PLAYING;
        this.containerCountdown.innerHTML = "START";
        setTimeout( () => {
            this.containerCountdown.style.display = "none";
            this.containerCountdown.innerHTML = "";
        }, 1000 );
    }

    private _translateVehicle( data: any ) {
        data = JSON.parse( data );
        this._vehicles[ data[ "player" ] ].actions[ data[ "action" ] ] = !!data[ "value" ];
    }

    private _updateRankList( data: any ) {
        data = JSON.parse( data );
        let element = document.createElement( "li" );
        for ( let i = 0, len = this._players.length; i < len; i++ ) {
            if ( this._players[ i ][ "id" ] === data[ "player" ] ) {
                element.innerHTML =  this._players[ i ][ "name" ];
            }
        }
        this.containerRankList.querySelector( "ol" ).appendChild( element );
    }
    
    public prepare( players: Array<any> ): void {
        this._players = players;
        Resource.load().then( () => {
            this._prepareGame();
        });
    }

    public over() {
        this.state = Game.STATE_IDLE;
        this.containerRankList.style.display = "none";
        this.containerRankList.querySelector( "ol" ).innerHTML = "";
        this.container.innerHTML = "";
        this._vehicle = null;
        this._vehicles.lenght = 0;
        world = null;
        cancelAnimationFrame( animateFrame );
    }
    
}

function animate(): void {
    animateFrame = requestAnimationFrame( animate );
    let dt = world.clock.getDelta();
    for ( let i = 0; i < world.syncList.length; i++ ) {
        world.syncList[i]( dt );
    }
    world.physicsWorld.stepSimulation( dt, 10 );
    world.controls.update();
    world.renderer.render( world.scene, world.camera );
    world.time += dt;
    resetCamera();
}

function resetCamera() {
    let vehiclePosition = vehicle.classisBody.mesh.position;
    let cameraPosition = vehicle.classisBody.mesh.localToWorld(new THREE.Vector3(0, 2.5, -5));
    world.camera.position.x = cameraPosition.x;
    world.camera.position.z = cameraPosition.z;
    world.controls.target.x = vehiclePosition.x;
    world.controls.target.z = vehiclePosition.z;
}