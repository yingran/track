import World from "./World";

/**
 * RigidBody
 */
export default class RigidBody extends Ammo.btRigidBody {

    public static readonly DEFAULT_COLOR = 0x999999;
    public static readonly DISABLE_DEACTIVATION: number = 4;
    public static readonly TRANSFORM_AUX: Ammo.btTransform = new Ammo.btTransform();

    public mesh: THREE.Mesh;
    protected world: World;

    constructor( 
        world: World, 
        mesh: any,
        geometry: any,
        pos: THREE.Vector3, 
        quat: THREE.Quaternion, 
        mass: number = 0, 
        friction: number = 1
    ) {
        let transform: Ammo.btTransform;
        let motionState: Ammo.btDefaultMotionState;
        let localInertia: Ammo.btVector3;
        let rbInfo: Ammo.btRigidBodyConstructionInfo;
        let sync: any;

        transform = RigidBody._createTransform( pos, quat );
        motionState = new Ammo.btDefaultMotionState( transform );
        localInertia = new Ammo.btVector3(0, 0, 0);
        geometry.calculateLocalInertia( mass, localInertia );
        rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, geometry, localInertia );

        super( rbInfo );
        this.setFriction( friction );
        this.mesh = mesh;
        this.world = world;

        if (mass > 0) {
            this.setActivationState( RigidBody.DISABLE_DEACTIVATION );
            world.syncList.push( this._sync.bind(this) );
        }

        this.world.physicsWorld.addRigidBody( this );
        this.world.scene.add( this.mesh );
    }

    protected _sync(): void {
        let ms = this.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( RigidBody.TRANSFORM_AUX );
            let p = RigidBody.TRANSFORM_AUX.getOrigin();
            let q = RigidBody.TRANSFORM_AUX.getRotation();
            if ( this.mesh ) {
                this.mesh.position.set( p.x(), p.y(), p.z() );
                this.mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
            }
        }
    }

    private static _createTransform( pos: THREE.Vector3, quat: THREE.Quaternion ): Ammo.btTransform {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        return transform;
    }
    
}