import Box from "./Box";
import World from "./World";

let DEFAULT_COLOR = 0x990000;

/**
 * Vehicle
 */
export default class Vehicle extends Ammo.btRaycastVehicle {

    protected readonly world: World;
    protected readonly tuning: Ammo.btVehicleTuning;
    protected classisBody: Box;
    public actions: any;
    
    // Vehicle contants
    protected engineForce: number;
    protected vehicleSteering: number;
    protected breakingForce: number;
    protected wheelAxisPositionBack: number;
    protected wheelRadiusBack: number;
    protected wheelWidthBack: number;
    protected wheelHalfTrackBack: number;
    protected wheelAxisHeightBack: number;
    protected wheelAxisFrontPosition: number;
    protected wheelHalfTrackFront: number;
    protected wheelAxisHeightFront: number;
    protected wheelRadiusFront: number;
    protected wheelWidthFront: number;
    protected friction: number;
    protected suspensionStiffness: number;
    protected suspensionDamping: number;
    protected suspensionCompression: number;
    protected suspensionRestLength: number;
    protected rollInfluence: number;
    protected steeringIncrement: number;
    protected steeringClamp: number;
    protected maxEngineForce: number;
    protected maxBreakingForce: number;

    // Wheels
    protected FRONT_LEFT: number;
    protected FRONT_RIGHT: number;
    protected BACK_LEFT: number;
    protected BACK_RIGHT: number;
    protected wheelDirectionCS0: Ammo.btVector3;
    protected wheelAxleCS: Ammo.btVector3;
    protected wheelMeshes: Array< THREE.Mesh >;

    constructor( world: World, pos: THREE.Vector3, quat: THREE.Quaternion ) {
        let tuning = new Ammo.btVehicleTuning();
        let rayCaster = new Ammo.btDefaultVehicleRaycaster( world.physicsWorld );
        let classisBody = Vehicle._createClassisBody( world, pos, quat );

        super( tuning, classisBody, rayCaster );
        this.setCoordinateSystem( 0, 1, 2 );

        this.world = world;
        this.tuning = tuning;
        this.classisBody = classisBody;
        world.physicsWorld.addAction( this );

        this._initConstants();
        this._initWheels();

        this.actions = {
            acceleration: false,
            braking: false,
            left: false,
            right: false
        };

        world.syncList.push( this._sync.bind(this) );
    }

    private _initConstants(): void {
        this.engineForce = 0;
        this.vehicleSteering = 0;
        this.breakingForce = 0;
        this.wheelAxisPositionBack = -1;
        this.wheelRadiusBack = .4;
        this.wheelWidthBack = .3;
        this.wheelHalfTrackBack = 1;
        this.wheelAxisHeightBack = .3;
        this.wheelAxisFrontPosition = 1.7;
        this.wheelHalfTrackFront = 1;
        this.wheelAxisHeightFront = .3;
        this.wheelRadiusFront = .35;
        this.wheelWidthFront = .2;
        this.friction = 1000;
        this.suspensionStiffness = 20.0;
        this.suspensionDamping = 2.3;
        this.suspensionCompression = 4.4;
        this.suspensionRestLength = 0.6;
        this.rollInfluence = 0.2;
        this.steeringIncrement = .04;
        this.steeringClamp = .5;
        this.maxEngineForce = 8000;
        this.maxBreakingForce = 100;
    }

    private _initWheels(): void {
        this.FRONT_LEFT = 0;
        this.FRONT_RIGHT = 1;
        this.BACK_LEFT = 2;
        this.BACK_RIGHT = 3;
        this.wheelMeshes = [];
        this.wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
        this.wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
        this._addWheel( new Ammo.btVector3( this.wheelHalfTrackFront, this.wheelAxisHeightFront, this.wheelAxisFrontPosition), this.wheelRadiusFront, this.wheelWidthFront, true, this.FRONT_LEFT );
        this._addWheel( new Ammo.btVector3( -this.wheelHalfTrackFront, this.wheelAxisHeightFront, this.wheelAxisFrontPosition), this.wheelRadiusFront, this.wheelWidthFront, true, this.FRONT_RIGHT );
        this._addWheel( new Ammo.btVector3( -this.wheelHalfTrackBack, this.wheelAxisHeightBack, this.wheelAxisPositionBack), this.wheelRadiusBack, this.wheelWidthBack, false, this.BACK_LEFT );
        this._addWheel( new Ammo.btVector3( this.wheelHalfTrackBack, this.wheelAxisHeightBack, this.wheelAxisPositionBack), this.wheelRadiusBack, this.wheelWidthBack, false, this.BACK_RIGHT );
    }

    

    private static _createClassisBody( world: World, pos: THREE.Vector3, quat: THREE.Quaternion ): Box {
        let width: number = 1.8;
        let height: number = 0.6;
        let depth: number = 4;
        let mass: number = 800;
        let body = new Box( world, pos, quat, width, height, depth, mass, 1, new THREE.MeshPhongMaterial( { color: DEFAULT_COLOR } ) );

        return body;
    }

    private static _createWheelMesh( world: World, radius: number, width: number, material: THREE.Material ): THREE.Mesh {
        let t = new THREE.CylinderGeometry( radius, radius, width, 24, 1 );
        t.rotateZ( Math.PI / 2 );
        let mesh = new THREE.Mesh( t, material );
        mesh.add( new THREE.Mesh( new THREE.BoxGeometry( width * 1.5, radius * 1.75, radius*.25, 1, 1, 1), material ) );
        world.scene.add( mesh );
        return mesh;
    }

    private _addWheel( pos: Ammo.btVector3, radius: number, width: number, isFront: boolean, index: number ): Ammo.btWheelInfo {
        let wheelInfo = super.addWheel(
                pos,
                this.wheelDirectionCS0,
                this.wheelAxleCS,
                this.suspensionRestLength,
                radius,
                this.tuning,
                isFront);
        wheelInfo.m_suspensionStiffness = this.suspensionStiffness;
        wheelInfo.m_wheelsDampingRelaxation = this.suspensionDamping;
        wheelInfo.m_wheelsDampingCompression = this.suspensionCompression;
        wheelInfo.m_frictionSlip = this.friction;
        wheelInfo.m_rollInfluence = this.rollInfluence;
        this.wheelMeshes[index] = Vehicle._createWheelMesh( this.world, radius, width, new THREE.MeshPhongMaterial( { color: DEFAULT_COLOR } ) );
        return wheelInfo;
    }

    protected _sync( dt: any ): void {
        let speed = this.getCurrentSpeedKmHour();
        this.breakingForce = 0;
        this.engineForce = 0;
        if ( this.actions.acceleration ) {
            if (speed < -1) {
                this.breakingForce = this.maxBreakingForce;
            } else {
                this.engineForce = this.maxEngineForce;
            }
        }
        if ( this.actions.braking ) {
            if (speed > 1) {
                this.breakingForce = this.maxBreakingForce;
            } else {
                this.engineForce = -this.maxEngineForce / 2;
            }
        }
        if ( this.actions.left ) {
            if ( this.vehicleSteering < this.steeringClamp) {
                this.vehicleSteering += this.steeringIncrement;
            }
        }
        else {
            if ( this.actions.right ) {
                if ( this.vehicleSteering > -this.steeringClamp )
                    this.vehicleSteering -= this.steeringIncrement;
            }
            else {
                if ( this.vehicleSteering < -this.steeringIncrement ) {
                    this.vehicleSteering += this.steeringIncrement;
                } else {
                    if ( this.vehicleSteering > this.steeringIncrement ) {
                        this.vehicleSteering -= this.steeringIncrement;
                    } else {
                        this.vehicleSteering = 0;
                    }
                }
            }
        }
        this.applyEngineForce( this.engineForce, this.BACK_LEFT );
        this.applyEngineForce( this.engineForce, this.BACK_RIGHT );
        this.setBrake( this.breakingForce / 2,this. FRONT_LEFT );
        this.setBrake( this.breakingForce / 2, this.FRONT_RIGHT );
        this.setBrake( this.breakingForce, this.BACK_LEFT );
        this.setBrake( this.breakingForce, this.BACK_RIGHT );
        this.setSteeringValue( this.vehicleSteering, this.FRONT_LEFT );
        this.setSteeringValue( this.vehicleSteering, this.FRONT_RIGHT );
        let tm, p, q, i;
        let n = this.getNumWheels();
        for (i = 0; i < n; i++) {
            this.updateWheelTransform( i, true );
            tm = this.getWheelTransformWS( i );
            p = tm.getOrigin();
            q = tm.getRotation();
            this.wheelMeshes[i].position.set( p.x(), p.y(), p.z() );
            this.wheelMeshes[i].quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
        tm = this.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();
        this.classisBody.mesh.position.set(p.x(), p.y(), p.z());
        this.classisBody.mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }
}