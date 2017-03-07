import RigidBody from "./RigidBody";
import World from "./World";
import Ground from "./Ground";
import Wall from "./Wall";
import Tree from "./Tree";
import Box from "./Box";

/**
 * Map
 */
export default class Map {

    private width: number;
    private depth: number;
    private world: World;

    public startLine: THREE.Mesh;

    constructor( world: World, mapData: any ) {
        this.world = world;
        this.width = mapData[ "size" ][ 0 ];
        this.depth = mapData[ "size" ][ 2 ];
        new Ground( world, this.width, this.width );
        this._addInvisibleBarriers();
        this._addStartingLine( mapData[ "start" ][ "position" ], mapData[ "start" ][ "rotation" ] );
        this._addBodies( mapData["bodies"] );
    }

    /**
     * add the 4 invisible barriers
     */
    private _addInvisibleBarriers() {
        this._addInvisibleBarrier( new THREE.Vector3( 0, 0, -this.depth/2 ), new THREE.Quaternion( 0, 0, 0, 1), this.width );
        this._addInvisibleBarrier( new THREE.Vector3( 0, 0, this.depth/2 ), new THREE.Quaternion( 0, 0, 0, 1), this.width );
        this._addInvisibleBarrier( new THREE.Vector3( -this.width/2, 0, 0 ), ( new THREE.Quaternion( 0, 0, 0, 1) ).setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ),  Math.PI/2 ), this.depth );
        this._addInvisibleBarrier( new THREE.Vector3( this.width/2, 0, 0 ), ( new THREE.Quaternion( 0, 0, 0, 1) ).setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ),  Math.PI/2 ), this.depth );
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
     * add starting line
     */
    private _addStartingLine( position: Array<number>, rotation: number ): void {
        let pos: THREE.Vector3 = new THREE.Vector3( position[0], position[1], position[2] );
        let quat: THREE.Quaternion = new THREE.Quaternion( 0, 0, 0, 1 ).setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), rotation*Math.PI/180 );
        let shape: THREE.BoxGeometry = new THREE.BoxGeometry( 20, 0.01, 0.5 );
        let material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } )
        let mesh = new THREE.Mesh( shape, material );
        mesh.position.copy( pos );
        mesh.quaternion.copy( quat );
        this.world.scene.add( mesh );
        this.startLine = mesh;
    }

    /**
     * add bodies
     */
    private _addBodies( bodies: any ): void {
        for ( let key in bodies ) {
            switch ( key ) {
                case "wall":
                bodies[ key ].forEach( ( data: any ) => {
                    let pos = new THREE.Vector3( data["position"][0], data["position"][1], data["position"][2] );
                    let quat = new THREE.Quaternion( 0, 0, 0, 1 );
                    quat.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), data["rotation"]*Math.PI/180 );
                    new Wall( this.world, pos, quat, data["length"] );
                });
                break;
                case "tree":
                bodies[ key ].forEach( ( data: any ) => {
                    let pos = new THREE.Vector3( data["position"][0], data["position"][1], data["position"][2] );
                    let quat = new THREE.Quaternion( 0, 0, 0, 1 );
                    quat.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), data["rotation"]*Math.PI/180 );
                    new Tree( this.world, pos, quat );
                });
                break;
                case "box":
                bodies[ key ].forEach( ( data: any ) => {
                    let pos = new THREE.Vector3( data["position"][0], data["position"][1], data["position"][2] );
                    let quat = new THREE.Quaternion( 0, 0, 0, 1 );
                    quat.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), data["rotation"]*Math.PI/180 );
                    new Box( this.world, pos, quat, 1, 1, 1, 100, 1, new THREE.MeshPhongMaterial( 0x990099 ) );
                });
                break;
                default:
            }
        }
    }
    
    /**
     * check the barrier's position
     */
    private _showInvisbileBarrier ( 
        pos: THREE.Vector3, 
        quat: THREE.Quaternion,
        material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: 0x009900 } ) 
    ): void {
        let shape: THREE.BoxGeometry = new THREE.BoxGeometry( this.width, 2, 0.2 );
        let mesh = new THREE.Mesh( shape, material );
        mesh.position.copy( pos );
        mesh.quaternion.copy( quat );

        this.world.scene.add( mesh );
    }
}