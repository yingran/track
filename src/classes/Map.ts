import RigidBody from "./RigidBody";
import World from "./World";
import Ground from "./Ground";
import Wall from "./Wall";
import Box from "./Box";

/**
 * Map
 */
export default class Map {

    private WIDTH: number = 200;
    private DEPTH: number = 200;
    private world: World;

    constructor( world: World ) {
        this.world = world;
        new Ground( world, this.WIDTH, this.WIDTH );
        this._addInvisibleBarriers();
    }

    /**
     * add the 4 invisible barriers
     */
    private _addInvisibleBarriers() {
        this._addInvisibleBarrier( new THREE.Vector3( 0, 0, -this.DEPTH/2 ), new THREE.Quaternion( 0, 0, 0, 1), this.WIDTH );
        this._addInvisibleBarrier( new THREE.Vector3( 0, 0, this.DEPTH/2 ), new THREE.Quaternion( 0, 0, 0, 1), this.WIDTH );
        this._addInvisibleBarrier( new THREE.Vector3( -this.WIDTH/2, 0, 0 ), ( new THREE.Quaternion( 0, 0, 0, 1) ).setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ),  Math.PI/2 ), this.DEPTH );
        this._addInvisibleBarrier( new THREE.Vector3( this.WIDTH/2, 0, 0 ), ( new THREE.Quaternion( 0, 0, 0, 1) ).setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ),  Math.PI/2 ), this.DEPTH );
    }

    /**
     * add inivisible barrier
     * @param pos the position of the barrier
     * @param quat the rotation of the barrier
     */
    private _addInvisibleBarrier( pos: THREE.Vector3, quat: THREE.Quaternion, length: number ): void {
        const HEIGHT: number = 100;
        let transform = new Ammo.btTransform();
        let motionState: Ammo.btDefaultMotionState;
        let localInertia: Ammo.btVector3;
        let rbInfo: Ammo.btRigidBodyConstructionInfo;
        let geometry: Ammo.btBoxShape = new Ammo.btBoxShape( new Ammo.btVector3( length, HEIGHT, 0.2 ) );
        let rigidBody: Ammo.btRigidBody;

        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        motionState = new Ammo.btDefaultMotionState( transform );
        localInertia = new Ammo.btVector3(0, 0, 0);
        geometry.calculateLocalInertia( 0, localInertia );
        rbInfo = new Ammo.btRigidBodyConstructionInfo( 0, motionState, geometry, localInertia );
        rigidBody = new Ammo.btRigidBody( rbInfo );

        this.world.physicsWorld.addRigidBody( rigidBody );

        //this._showInvisbileBarrier( pos, quat );
    }    
    
    /**
     * check the barrier's position
     */
    private _showInvisbileBarrier( 
        pos: THREE.Vector3, 
        quat: THREE.Quaternion,
        material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: 0x009900 } ) 
    ): void {
        let shape: THREE.BoxGeometry = new THREE.BoxGeometry( this.WIDTH, 2, 0.2 );
        let mesh = new THREE.Mesh( shape, material );
        mesh.position.copy( pos );
        mesh.quaternion.copy( quat );

        this.world.scene.add( mesh );
    }
}