import * as THREE from "three";
import * as Ammo from "ammo.js";

import Resource from "./classes/Resource";
import World from "./classes/World";
import Map from "./classes/Map";
import Box from "./classes/Box";
import Cylinder from "./classes/Cylinder";
import Vehicle from "./classes/Vehicle";

let world: World;
let map: Map;
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
    let cameraPosition = vehicle.classisBody.mesh.localToWorld(new THREE.Vector3(0, 2.5, -5));
    world.camera.position.x = cameraPosition.x;
    world.camera.position.z = cameraPosition.z;
    world.controls.target.x = vehiclePosition.x;
    world.controls.target.z = vehiclePosition.z;
}

function addVechicle() {
    let quat: THREE.Quaternion;
    map.startLine.getWorldPosition();
    quat = new THREE.Quaternion( 0, 0, 0, 1 );
    quat.setFromEuler( map.startLine.rotation );
    vehicle = new Vehicle( world, map.startLine.localToWorld(new THREE.Vector3(0, 0, -5)), quat );
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

function start(): void {
    let container = document.querySelector( "#container" );
    world = new World( window.innerWidth, window.innerHeight );
    container.appendChild( world.domElement );
    map = new Map( world, Resource.maps[ "test" ] );

    addVechicle();
    animate();
    
    window.addEventListener( "keydown", keydown);
    window.addEventListener( "keyup", keyup);
    window.addEventListener( "resize", () => {
        world.resize( window.innerWidth, window.innerHeight );
    } );
}

function main() {
    Resource.load().then( () => {
        start();
    });
}

main();