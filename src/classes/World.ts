import RigidBody from "./RigidBody";

/**
 * World
 */
export default class World {

    public static ZERO_QUATERNION: THREE.Quaternion = new THREE.Quaternion( 0, 0, 0, 1 );
    public static DEFAULT_COLOR: number = 0x999999;

    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public controls: THREE.OrbitControls;

    public clock: THREE.Clock;
    public time: number;
    public domElement: Element;

    public physicsWorld: Ammo.btDiscreteDynamicsWorld;
    public syncList: Array<any>;

    /**
     * @param width the width of screen
     * @param height the height of screen
     */
    constructor( width: number, height: number) {
        this.scene = _createScene();
        this.camera = _createCamera( width, height );
        this.renderer = _createRenderer( width, height );
        this.physicsWorld = _createPhysicsWorld();
        this.clock = new THREE.Clock();
        this.time = 0;
        this.domElement = this.renderer.domElement;
        this.controls = new THREE.OrbitControls( this.camera );
        this.controls.enableZoom = false;
        this.controls.enableRotate = false;
        this.syncList = [];
    }

    /**
     * @param width the width of screen
     * @param height the height of screen
     */
    public resize( width: number, height: number ): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( width, height );
    }
}


/**
 * initialize scene.
 */
function _createScene(): THREE.Scene {
    let ambientLight: THREE.AmbientLight = new THREE.AmbientLight( 0x404040 );
    let dirLight: THREE.DirectionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    let scene = new THREE.Scene();
    dirLight.position.set( 10, 10, 5 );
    scene.add( dirLight );
    scene.add( ambientLight );
    return scene;
}

/**
 * initialize camera.
 */
function _createCamera( width: number, height: number ): THREE.PerspectiveCamera {
    let camera = new THREE.PerspectiveCamera( 60, width / height, 0.2, 2000);
    camera.position.x = 0;
    camera.position.y = 25;
    camera.position.z = -25;
    return camera;
}

/**
 * initialize renderer
 */
function _createRenderer( width: number, height: number ): THREE.WebGLRenderer {    
    let renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    renderer.setSize( width, height );
    return renderer;
}

/**
 * initialize physics world;
 */
function _createPhysicsWorld(): Ammo.btDiscreteDynamicsWorld {
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    let dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    let broadphase = new Ammo.btDbvtBroadphase();
    let solver = new Ammo.btSequentialImpulseConstraintSolver();
    let physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
    physicsWorld.setGravity( new Ammo.btVector3( 0, -9.82, 0 ) );
    return physicsWorld;

}