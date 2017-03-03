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
    EVENT_START_GAME
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


let container = document.getElementById( "game" );

export default class Game {

    static IDLE: Symbol = Symbol();
    static COUNTDOWN: Symbol = Symbol();
    static PLAYING: Symbol = Symbol();

    readonly socket: SocketIOClient.Socket;
    private _playerId: string;
    private _vehicles: any;
    private _vehicle: Vehicle;  
    private _players: Array<any>;
    private _map: Map;

    public container: HTMLElement;
    public containerCountdown: HTMLElement;

    public state: Symbol;

    constructor( socket: SocketIOClient.Socket, playerId: string ) {
        this.socket = clientSocket = socket;
        this._playerId = playerId;
        this._players = [];
        this._vehicles = {};
        this.state = Game.IDLE;

        this.container = document.getElementById( "game" );
        this.containerCountdown = document.getElementById( "countdown" );

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
            let vehicle = new Vehicle( world, this._map.startLine.localToWorld( new THREE.Vector3( x, 1, -5 ) ), quat );
            this._vehicles[ players[ i ][ "id" ] ] = vehicle;
            if ( players[ i ][ "id" ] === this._playerId ) {
                this._vehicle = vehicle;
            }
        }
        vehicle = this._vehicle;
    }

    private _handleKeyUp( evt: any ) {
        if ( this.state === Game.PLAYING && keysActions[evt.code] ) {
            vehicle.actions[keysActions[evt.code]] = false;
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
        if ( this.state === Game.PLAYING && keysActions[evt.code] ) {
            vehicle.actions[ keysActions[evt.code] ] = true;
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
        if ( this.state !== Game.IDLE && world ) {
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
    }

    private _countdown( data: any ) {
        data = JSON.parse( data );
        this.containerCountdown.innerHTML = data[ "count" ];
    }

    private _prepareGame() {
        this.state = Game.COUNTDOWN;
        container.style.display = "block";
        world = new World( window.innerWidth, window.innerHeight );
        container.appendChild( world.domElement );
        this._map = new Map( world, Resource.maps[ "test" ] );

        this._addVehicles();
        animate();
    }

    private _startGame( data: any ) {
        data = JSON.parse( data );
        this.state = Game.PLAYING;
        this.containerCountdown.innerHTML = "START";
        setTimeout( () => {
            this.containerCountdown.style.display = "none";
        }, 1000 );
    }

    private _translateVehicle( data: any ) {
        data = JSON.parse( data );
        console.log( data );
        this._vehicles[ data[ "player" ] ].actions[ data[ "action" ] ] = !!data[ "value" ];
    }
    
    public prepare( players: Array<any> ): void {
        this._players = players;
        Resource.load().then( () => {
            this._prepareGame();
        });
    }
    
}

function animate(): void {
    requestAnimationFrame( animate );
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