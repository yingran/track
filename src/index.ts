import * as THREE from "three";
import * as Ammo from "ammo.js";

let starter: Starter;

class Starter {

    scene: any;
    camera: any;
    renderer: any;

    geometry: any;
    material: any;
    mesh: any;


    constructor () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerWidth, 1, 1000);
        this.camera.position.z = 1000;

        this.geometry = new THREE.BoxGeometry( 200, 200, 200 );
        this.material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.mesh );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        document.querySelector("#container").appendChild( this.renderer.domElement );

    }

    animate (): void {
        requestAnimationFrame( this.animate.bind(this) );

        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;

        this.renderer.render( this.scene, this.camera );
    }


}


starter = new Starter();
starter.animate();
