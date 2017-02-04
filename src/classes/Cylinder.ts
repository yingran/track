import RigidBody from "./RigidBody";
import World from "./World";

/**
 * Cylinder
 */
export default class Cylinder extends RigidBody {
    
    constructor( 
        world: World, 
        pos: THREE.Vector3, 
        quat: THREE.Quaternion, 
        radius: number, 
        height: number, 
        mass: number = 0, 
        friction: number = 1, 
        material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: RigidBody.DEFAULT_COLOR } ) 
    ) {
        let geometry: Ammo.btCylinderShape = new Ammo.btCylinderShape( new Ammo.btVector3( radius, height, 0 ) );
        let mesh: THREE.Mesh;
        mesh = Cylinder._createMesh( pos, quat, radius, height, material );
        super( world, mesh, geometry, pos, quat, mass, friction );
    }
    
    private static  _createMesh( 
        pos: THREE.Vector3, 
        quat: THREE.Quaternion, 
        radius: number, 
        height: number, 
        material: THREE.MeshPhongMaterial 
    ): THREE.Mesh {
        let shape: THREE.CylinderGeometry = new THREE.CylinderGeometry( radius, radius, height, 16);
        let mesh = new THREE.Mesh( shape, material );
        mesh.position.copy( pos );
        mesh.quaternion.copy( quat );

        return mesh;
    }
    
}