import * as THREE from "three";
import * as Ammo from "ammo.js";
import Resource from "./Resource";
import RigidBody from "./RigidBody";
import World from "./World";

export default class Tree extends RigidBody {

    constructor( 
        world: World, 
        pos: THREE.Vector3, 
        quat: THREE.Quaternion
    ) {
        let radius = 5;
        let height = 10;
        let mass = 0;
        let friction = 1;
        let geometry: Ammo.btCylinderShape = new Ammo.btCylinderShape( new Ammo.btVector3( radius, height, 0 ) );
        let mesh: THREE.Mesh = Resource.meshes[ "tree" ];
        mesh.position.set( pos.x, pos.y, pos.z );
        super( world, mesh, geometry, pos, quat, mass, friction );
        this.mesh = mesh;
    }

}