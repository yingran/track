import RigidBody from "./RigidBody";
import World from "./World";

/**
 * Wall
 */
export default class Wall extends RigidBody {
    constructor( 
        world: World, 
        pos: THREE.Vector3, 
        quat: THREE.Quaternion, 
        width: number, 
        height: number, 
        depth: number, 
        material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: RigidBody.DEFAULT_COLOR } ) 
    ) {
        let mass = 0;
        let friction = 1;
        super( world, pos, quat, width, height, depth, mass, friction, material );
    }
}