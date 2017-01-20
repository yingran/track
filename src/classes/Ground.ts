import RigidBody from "./RigidBody";
import World from "./World";

/**
 * Ground
 */
export default class Ground extends RigidBody {

    constructor( width: number, depth: number, friction: number = 2, material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: RigidBody.DEFAULT_COLRO } ) ) {
        let pos: THREE.Vector3 = new THREE.Vector3( 0, -0.5, 0 );
        let quat: THREE.Quaternion = World.ZERO_QUATERNION;
        let height = 1;
        let mass = 0;
        super( pos, quat, width, height, depth, mass, friction, material );
    }
}

