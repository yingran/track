import * as THREE from "three";
import * as Ammo from "ammo.js";

import World from "./classes/World";
import Ground from "./classes/Ground";
import RigidBody from "./classes/RigidBody";

let world: World;

function animate(): void {
    requestAnimationFrame( animate );
    let dt = world.clock.getDelta();
        
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
            world.add( new RigidBody( new THREE.Vector3( size * j - ( size * (nw - 1) ) / 2, size * i, 10 ), World.ZERO_QUATERNION, size, size, size, 10 ) );
        }
    }            
}

function addGround() {
    let ground = new Ground( 75, 75 );
    world.add( ground );
}

function addRamp() {
    let quaternion = new THREE.Quaternion( 0, 0, 0, 1 );
    quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 18 );
    world.add( new RigidBody( new THREE.Vector3( 0, -1.5, 0 ), quaternion, 8, 4, 10, 0 ) );
}

function main(): void {
    let container = document.querySelector("#container");
    world = new World( window.innerWidth, window.innerHeight );
    container.appendChild( world.domElement );
    window.addEventListener( "resize", () => {
        world.resize( window.innerWidth, window.innerHeight );
    } );

    addGround();
    addRamp();
    addBoxes();
    animate();
}

main();