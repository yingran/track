import * as THREE from "three";
import * as Ammo from "ammo.js";
import RigidBody from "./RigidBody";
import World from "./World";

export default class Windmill extends RigidBody {

    private static _mesh: THREE.Mesh;

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
        let mesh: THREE.Mesh;
        if ( Windmill._mesh ) {
            mesh = Windmill._mesh;
        }
        super( world, mesh, geometry, pos, quat, mass, friction );

        if ( !Windmill._mesh ) {
            RigidBody.loadMeshResource( "/resources/meshes/windmill.mtl", "/resources/meshes/windmill.obj" ).then( ( mesh: any ) => {
                mesh.position.set( pos.x, pos.y, pos.z );
                this.mesh = mesh;
                this.appendToWorld();
            } );
        }
    }

}