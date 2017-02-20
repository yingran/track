import Box from "./Box";
import World from "./World";

/**
 * Wall
 */
export default class Wall extends Box {
    constructor( 
        world: World, 
        pos: THREE.Vector3, 
        quat: THREE.Quaternion, 
        length: number, 
        material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial( { color: 0x009900 } ) 
    ) {
        let mass = 0;
        let friction = 1;
        let height = 3;
        let depth = 0.2;
        super( world, pos, quat, length, height, depth, mass, friction, material );
    }
}