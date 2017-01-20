/**
 * RigidBody
 */
export default class RigidBody extends Ammo.btRigidBody {

    public static readonly DEFAULT_COLRO = 0x999999;
    public static readonly DISABLE_DEACTIVATION: number = 4;
    public static readonly TRANSFORM_AUX: Ammo.btTransform = new Ammo.btTransform();

    public readonly mesh: THREE.Mesh;

    constructor( pos: THREE.Vector3, quat: THREE.Quaternion, width: number, height: number, depth: number, mass: number = 0, friction: number = 1, material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: RigidBody.DEFAULT_COLRO } ) ) {
        let geometry: Ammo.btBoxShape = new Ammo.btBoxShape( new Ammo.btVector3( width * 0.5, height * 0.5, depth * 0.5 ) );
        let mesh: THREE.Mesh;
        let transform: Ammo.btTransform;
        let motionState: Ammo.btDefaultMotionState;
        let localInertia: Ammo.btVector3;
        let rbInfo: Ammo.btRigidBodyConstructionInfo;
        let sync: any;

        mesh = _createMesh( pos, quat, width, height, depth, material );

        transform = _createTransform( pos, quat );
        motionState = new Ammo.btDefaultMotionState( transform );
        localInertia = new Ammo.btVector3(0, 0, 0);
        geometry.calculateLocalInertia( mass, localInertia );
        rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, geometry, localInertia );

        super( rbInfo );
        this.setFriction( friction );
        this.mesh = mesh;

        if (mass > 0) {
            this.setActivationState( RigidBody.DISABLE_DEACTIVATION );
        }
    }

    public sync(): void {
        let ms = this.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( RigidBody.TRANSFORM_AUX );
            let p = RigidBody.TRANSFORM_AUX.getOrigin();
            let q = RigidBody.TRANSFORM_AUX.getRotation();
            this.mesh.position.set( p.x(), p.y(), p.z() );
            this.mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
    }
}

function _createMesh( pos: THREE.Vector3, quat: THREE.Quaternion, width: number, height: number, depth: number,  material: THREE.MeshPhongMaterial ): THREE.Mesh {
    let shape: THREE.BoxGeometry = new THREE.BoxGeometry( width, height, depth);
    let mesh = new THREE.Mesh( shape, material );
    mesh.position.copy( pos );
    mesh.quaternion.copy( quat );

    return mesh;
}

function _createTransform( pos: THREE.Vector3, quat: THREE.Quaternion ): Ammo.btTransform {
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    return transform;
}