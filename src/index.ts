import * as THREE from "three";
import * as Ammo from "ammo.js";

import World from "./classes/World";
import Ground from "./classes/Ground";
import Box from "./classes/Box";
import Cylinder from "./classes/Cylinder";
import Vehicle from "./classes/Vehicle";
import Wall from "./classes/Wall";
import Windmill from "./classes/Windmill";

let world: World;
let vehicle: Vehicle;
let keysActions: any = {
    "KeyW": "acceleration",
    "KeyS": "braking",
    "KeyA": "left",
    "KeyD": "right"
};

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
    world.camera.position.x = vehiclePosition.x;
    world.camera.position.z = vehiclePosition.z;
    world.controls.target.x = vehiclePosition.x;
    world.controls.target.z = vehiclePosition.z;
}

function addBoxes() {
    let size = .75;
    let nw = 8;
    let nh = 6;
    for ( let j = 0; j < nw; j++ ) {
        for ( let i = 0; i < nh; i++ ) {
            new Box( world, new THREE.Vector3( size * j - ( size * (nw - 1) ) / 2, size * i, 10 ), World.ZERO_QUATERNION, size, size, size, 10 );
        }
    }            
}

function addGround() {
    new Ground( world, 100, 100 );
}

function addRamp() {
    let ramp;
    let quaternion = new THREE.Quaternion( 0, 0, 0, 1 );
    quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 18 );
    new Box( world, new THREE.Vector3( 0, -1.5, 0 ), quaternion, 8, 4, 10, 0 );
}

function addVechicle() {
    vehicle = new Vehicle( world,  new THREE.Vector3( 0, 4, -20 ), World.ZERO_QUATERNION );
}

function addWalls() {
    new Wall( world,  new THREE.Vector3( 0, 1, -50 ), World.ZERO_QUATERNION, 100, 2, 1, new THREE.MeshPhongMaterial( { color: 0x333333 } ) );
    new Wall( world,  new THREE.Vector3( 0, 1, 50 ), World.ZERO_QUATERNION, 100, 2, 1, new THREE.MeshPhongMaterial( { color: 0x333333 } ) );
    new Wall( world,  new THREE.Vector3( -50, 1, 0 ), World.ZERO_QUATERNION, 1, 2, 100, new THREE.MeshPhongMaterial( { color: 0x333333 } ) );
    new Wall( world,  new THREE.Vector3( 50, 1, 0 ), World.ZERO_QUATERNION, 1, 2, 100, new THREE.MeshPhongMaterial( { color: 0x333333 } ) );
}

function addCylinder() {
    new Cylinder( world, new THREE.Vector3( 10, 2.5, 10 ),  World.ZERO_QUATERNION, 1, 5, 0 );
}

function addWindmill() {
    new Windmill( world, new THREE.Vector3( -20, 0, 0 ),  World.ZERO_QUATERNION );
}

function keyup( e: KeyboardEvent ) {
    if ( keysActions[e.code] ) {
        vehicle.actions[keysActions[e.code]] = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}

function keydown( e: KeyboardEvent ) {
    if ( keysActions[e.code] ) {
        vehicle.actions[keysActions[e.code]] = true;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}

function main(): void {
    let container = document.querySelector("#container");
    world = new World( window.innerWidth, window.innerHeight );
    container.appendChild( world.domElement );

    addGround();
    addRamp();
    addBoxes();
    addCylinder();
    addVechicle();
    addWalls();
    addWindmill();
    animate();
    
    window.addEventListener( "keydown", keydown);
    window.addEventListener( "keyup", keyup);
    window.addEventListener( "resize", () => {
        world.resize( window.innerWidth, window.innerHeight );
    } );
}

main();