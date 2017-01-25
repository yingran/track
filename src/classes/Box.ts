import RigidBody from "./RigidBody";
import World from "./World";

/**
 * Box
 */
export default class Box extends RigidBody {
    
    constructor( 
        world: World, 
        pos: THREE.Vector3, 
        quat: THREE.Quaternion, 
        width: number, 
        height: number, 
        depth: number, 
        mass: number = 0, 
        friction: number = 1, 
        material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: RigidBody.DEFAULT_COLOR } ) 
    ) {
        let geometry: Ammo.btBoxShape = new Ammo.btBoxShape( new Ammo.btVector3( width * 0.5, height * 0.5, depth * 0.5 ) );
        let mesh: THREE.Mesh;
        mesh = Box._createMesh( pos, quat, width, height, depth, material );
        super( world, mesh, geometry, pos, quat, mass, friction, material );
    }
    
    private static  _createMesh( pos: THREE.Vector3, quat: THREE.Quaternion, width: number, height: number, depth: number,  material: THREE.MeshPhongMaterial ): THREE.Mesh {
        let shape: THREE.BoxGeometry = new THREE.BoxGeometry( width, height, depth);
        let mesh = new THREE.Mesh( shape, material );
        mesh.position.copy( pos );
        mesh.quaternion.copy( quat );

        return mesh;
    }
    
}