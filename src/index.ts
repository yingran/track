import * as THREE from "three";
import * as Ammo from "ammo.js";

const DISABLE_DEACTIVATION: number = 4;
const TRANSFORM_AUX: Ammo.btTransform = new Ammo.btTransform();
const ZERO_QUATERNION: THREE.Quaternion = new THREE.Quaternion( 0, 0, 0, 1 );

let sceneStarter: SceneStarter;
let physicsStarter: PhysicsStarter;

let syncList: Array<any> = [];

let materialDynamic: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color:0xfca400 } );
let materialStatic: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color:0x999999 } );
let materialInteractive: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color:0x990000 } );

let actions: any = {};
let keysActions: any = {
    "KeyW": "acceleration",
    "KeyS": "braking",
    "KeyA": "left",
    "KeyD": "right"
};

class SceneStarter {

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: THREE.OrbitControls;

    clock: THREE.Clock;
    time: number;

    container: Element;

    constructor () {

        let ambientLight: THREE.AmbientLight = new THREE.AmbientLight( 0x404040 );
        let dirLight: THREE.DirectionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.position.set( 10, 10, 5 );

        this.clock = new THREE.Clock();
        this.time = 0;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerWidth, 0.2, 2000);
        this.camera.position.x = -4.84;
        this.camera.position.y = 4.39;
        this.camera.position.z = -35.11;

        this.camera.lookAt( new THREE.Vector3( 0.33, -0.40, 0.85 ) );
        this.controls = new THREE.OrbitControls( this.camera );

        this.renderer = new THREE.WebGLRenderer({antialias:true});
		this.renderer.setClearColor( 0xbfd1e5 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.scene.add( dirLight );
        this.scene.add( ambientLight );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.container = document.querySelector("#container");
        this.container.appendChild( this.renderer.domElement );

        window.addEventListener( "resize", this.handleWindowResize.bind(this) );

    }

    handleWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    


}

class PhysicsStarter {

    collisionConfiguration: Ammo.btDefaultCollisionConfiguration;
    dispatcher: Ammo.btCollisionDispatcher;
    broadphase: Ammo.btDbvtBroadphase;
    solver: Ammo.btSequentialImpulseConstraintSolver;
    physicsWorld: Ammo.btDiscreteDynamicsWorld;

    constructor() {
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher( this.collisionConfiguration );
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration );
        this.physicsWorld.setGravity( new Ammo.btVector3( 0, -9.82, 0 ) );
    }

    
};

function createBox( pos: THREE.Vector3, quat: THREE.Quaternion, w: number, l: number, h: number, mass: number = 0, friction: number = 1 ): void {
    let material: THREE.MeshPhongMaterial = mass > 0 ? materialDynamic : materialStatic;
    let shape: THREE.BoxGeometry = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
    let geometry:  Ammo.btBoxShape = new Ammo.btBoxShape( new Ammo.btVector3( w * 0.5, l * 0.5, h * 0.5 ) );
    let mesh: THREE.Mesh;
    let transform: Ammo.btTransform;
    let motionState: Ammo.btDefaultMotionState;
    let localInertia: Ammo.btVector3;
    let rbInfo: Ammo.btRigidBodyConstructionInfo;
    let body: Ammo.btRigidBody;
    let sync: any;

    /**
    if ( !mass ) {
        mass = 0;
    }

    if ( !friction ) {
        friction = 1;
    }
    **/

    mesh = new THREE.Mesh( shape, material );
    mesh.position.copy( pos );
    mesh.quaternion.copy( quat );

    sceneStarter.scene.add( mesh );

    transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    motionState = new Ammo.btDefaultMotionState( transform );

    localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia( mass, localInertia );

    rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, geometry, localInertia );
    body = new Ammo.btRigidBody( rbInfo );
    body.setFriction( friction );
    physicsStarter.physicsWorld.addRigidBody( body );


    if (mass > 0) {
        body.setActivationState( DISABLE_DEACTIVATION );

        sync = function() {
            let ms = body.getMotionState();
            if (ms) {
                ms.getWorldTransform( TRANSFORM_AUX );
                let p = TRANSFORM_AUX.getOrigin();
                let q = TRANSFORM_AUX.getRotation();
                mesh.position.set( p.x(), p.y(), p.z() );
                mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
            }
        }
        syncList.push(sync);
    }
}

function createWheelMesh( radius: number, width: number ): THREE.Mesh {
    let t = new THREE.CylinderGeometry( radius, radius, width, 24, 1 );
    t.rotateZ( Math.PI / 2 );
    let mesh = new THREE.Mesh( t, materialInteractive );
    mesh.add( new THREE.Mesh( new THREE.BoxGeometry( width * 1.5, radius * 1.75, radius*.25, 1, 1, 1), materialInteractive ) );
    sceneStarter.scene.add( mesh );
    return mesh;
}

function createChassisMesh( w: number, l: number, h: number ): THREE.Mesh {
    let shape = new THREE.BoxGeometry( w, l, h, 1, 1, 1 );
    let mesh = new THREE.Mesh( shape, materialInteractive );
    sceneStarter.scene.add(mesh);
    return mesh;
}

function createVehicle( pos: Ammo.btVector3, quat: Ammo.btQuaternion ) {

    // Vehicle contants
    let chassisWidth: number = 1.8;
    let chassisHeight: number = .6;
    let chassisLength: number = 4;
    let massVehicle: number = 800;
    let wheelAxisPositionBack: number = -1;
    let wheelRadiusBack: number = .4;
    let wheelWidthBack: number = .3;
    let wheelHalfTrackBack: number = 1;
    let wheelAxisHeightBack: number = .3;
    let wheelAxisFrontPosition: number = 1.7;
    let wheelHalfTrackFront: number = 1;
    let wheelAxisHeightFront: number = .3;
    let wheelRadiusFront: number = .35;
    let wheelWidthFront: number = .2;
    let friction: number = 1000;
    let suspensionStiffness: number = 20.0;
    let suspensionDamping: number = 2.3;
    let suspensionCompression: number = 4.4;
    let suspensionRestLength: number = 0.6;
    let rollInfluence: number = 0.2;
    let steeringIncrement: number = .04;
    let steeringClamp: number = .5;
    let maxEngineForce: number = 2000;
    let maxBreakingForce: number = 100;

    // Chassis
    let geometry = new Ammo.btBoxShape( new Ammo.btVector3( chassisWidth * .5, chassisHeight * .5, chassisLength * .5 ) );
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );
    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    geometry.calculateLocalInertia( massVehicle, localInertia );
    let body = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( massVehicle, motionState, geometry, localInertia ) );
    body.setActivationState( DISABLE_DEACTIVATION );
    physicsStarter.physicsWorld.addRigidBody( body );
    let chassisMesh = createChassisMesh( chassisWidth, chassisHeight, chassisLength );

    // Raycast Vehicle
    let engineForce: number = 0;
    let vehicleSteering: number = 0;
    let breakingForce: number = 0;
    let tuning = new Ammo.btVehicleTuning();
    let rayCaster = new Ammo.btDefaultVehicleRaycaster( physicsStarter.physicsWorld );
    let vehicle = new Ammo.btRaycastVehicle( tuning, body, rayCaster );
    vehicle.setCoordinateSystem( 0, 1, 2 );
    physicsStarter.physicsWorld.addAction( vehicle );

    // Wheels
    let FRONT_LEFT: number = 0;
    let FRONT_RIGHT: number = 1;
    let BACK_LEFT: number = 2;
    let BACK_RIGHT: number = 3;
    let wheelMeshes: Array<any> = [];
    let wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    let wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
    function addWheel( isFront: any, pos: Ammo.btVector3, radius: number, width: number, index: number ) {
        let wheelInfo = vehicle.addWheel(
                pos,
                wheelDirectionCS0,
                wheelAxleCS,
                suspensionRestLength,
                radius,
                tuning,
                isFront);
        wheelInfo.set_m_suspensionStiffness( suspensionStiffness );
        wheelInfo.set_m_wheelsDampingRelaxation( suspensionDamping );
        wheelInfo.set_m_wheelsDampingCompression( suspensionCompression );
        wheelInfo.set_m_frictionSlip( friction );
        wheelInfo.set_m_rollInfluence( rollInfluence );
        wheelMeshes[index] = createWheelMesh( radius, width );
    }
    addWheel( true, new Ammo.btVector3( wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT );
    addWheel( true, new Ammo.btVector3( -wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT );
    addWheel( false, new Ammo.btVector3( -wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT );
    addWheel( false, new Ammo.btVector3( wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT );

    // Sync keybord actions and physics and graphics
    function sync( dt: any ) {
        let speed = vehicle.getCurrentSpeedKmHour();
        breakingForce = 0;
        engineForce = 0;
        if ( actions.acceleration ) {
            if (speed < -1)
                breakingForce = maxBreakingForce;
            else engineForce = maxEngineForce;
        }
        if ( actions.braking ) {
            if (speed > 1)
                breakingForce = maxBreakingForce;
            else engineForce = -maxEngineForce / 2;
        }
        if ( actions.left ) {
            if (vehicleSteering < steeringClamp)
                vehicleSteering += steeringIncrement;
        }
        else {
            if ( actions.right ) {
                if ( vehicleSteering > -steeringClamp )
                    vehicleSteering -= steeringIncrement;
            }
            else {
                if ( vehicleSteering < -steeringIncrement )
                    vehicleSteering += steeringIncrement;
                else {
                    if ( vehicleSteering > steeringIncrement )
                        vehicleSteering -= steeringIncrement;
                    else {
                        vehicleSteering = 0;
                    }
                }
            }
        }
        vehicle.applyEngineForce( engineForce, BACK_LEFT );
        vehicle.applyEngineForce( engineForce, BACK_RIGHT );
        vehicle.setBrake( breakingForce / 2, FRONT_LEFT );
        vehicle.setBrake( breakingForce / 2, FRONT_RIGHT );
        vehicle.setBrake( breakingForce, BACK_LEFT );
        vehicle.setBrake( breakingForce, BACK_RIGHT );
        vehicle.setSteeringValue( vehicleSteering, FRONT_LEFT );
        vehicle.setSteeringValue( vehicleSteering, FRONT_RIGHT );
        let tm, p, q, i;
        let n = vehicle.getNumWheels();
        for (i = 0; i < n; i++) {
            vehicle.updateWheelTransform( i, true );
            tm = vehicle.getWheelTransformWS( i );
            p = tm.getOrigin();
            q = tm.getRotation();
            wheelMeshes[i].position.set( p.x(), p.y(), p.z() );
            wheelMeshes[i].quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
        tm = vehicle.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();
        chassisMesh.position.set(p.x(), p.y(), p.z());
        chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }
    syncList.push(sync);
}

function createObjects(): void {
    createBox( new THREE.Vector3( 0, -0.5, 0 ), ZERO_QUATERNION, 75, 1, 75, 0, 2 );
    let quaternion = new THREE.Quaternion( 0, 0, 0, 1 );
    quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 18 );
    createBox( new THREE.Vector3( 0, -1.5, 0 ), quaternion, 8, 4, 10, 0 );
    let size = .75;
    let nw = 8;
    let nh = 6;
    for ( let j = 0; j < nw; j++ ) {
        for ( let i = 0; i < nh; i++ ) {
            createBox( new THREE.Vector3( size * j - ( size * (nw - 1) ) / 2, size * i, 10 ), ZERO_QUATERNION, size, size, size, 10 );
        }
    }            
    createVehicle( new THREE.Vector3( 0, 4, -20 ), ZERO_QUATERNION );
}


function animate(): void {
    requestAnimationFrame( animate );
    let dt = sceneStarter.clock.getDelta();
    for ( let i = 0; i < syncList.length; i++ ) {
        syncList[i]( dt );
    }
        
    physicsStarter.physicsWorld.stepSimulation( dt, 10 );
    sceneStarter.controls.update();
    //sceneStarter.controls.update( dt );
    sceneStarter.renderer.render( sceneStarter.scene, sceneStarter.camera );
    sceneStarter.time += dt;
}

function keyup( e: KeyboardEvent ) {
    if ( keysActions[e.code] ) {
        actions[keysActions[e.code]] = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}

function keydown( e: KeyboardEvent ) {
    if ( keysActions[e.code] ) {
        actions[keysActions[e.code]] = true;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}

let a = new Ammo.btDefaultCollisionConfiguration();

sceneStarter = new SceneStarter();
physicsStarter = new PhysicsStarter();
createObjects();

window.addEventListener( "keydown", keydown);
window.addEventListener( "keyup", keyup);

animate();
