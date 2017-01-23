import * as THREE from "three";
import * as Ammo from "ammo.js";

import World from "./classes/World";
import Ground from "./classes/Ground";
import RigidBody from "./classes/RigidBody";
import Vehicle from "./classes/Vehicle";

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
}

function addBoxes() {    
    let size = .75;
    let nw = 8;
    let nh = 6;
    for ( let j = 0; j < nw; j++ ) {
        for ( let i = 0; i < nh; i++ ) {
            new RigidBody( world, new THREE.Vector3( size * j - ( size * (nw - 1) ) / 2, size * i, 10 ), World.ZERO_QUATERNION, size, size, size, 10 );
        }
    }            
}

function addGround() {
    new Ground( world, 75, 75 );
}

function addRamp() {
    let ramp;
    let quaternion = new THREE.Quaternion( 0, 0, 0, 1 );
    quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 18 );
    new RigidBody( world, new THREE.Vector3( 0, -1.5, 0 ), quaternion, 8, 4, 10, 0 );
}

function addVechicle() {
    vehicle = new Vehicle( world,  new THREE.Vector3( 0, 4, -20 ), World.ZERO_QUATERNION );
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
    addVechicle();
    animate();
    
    window.addEventListener( "keydown", keydown);
    window.addEventListener( "keyup", keyup);
    window.addEventListener( "resize", () => {
        world.resize( window.innerWidth, window.innerHeight );
    } );
}

main();