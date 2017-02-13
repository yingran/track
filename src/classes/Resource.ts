/**
 * Resource
 */

export default class Resource {

    public static meshes: any = {};

    public static readonly meshResource: any = {
        windmill: [ "windmill.mtl", "windmill.obj" ],
        vehicleBody: [ "vehiclebody.mtl", "vehiclebody.obj" ]
    };

    counstructor() {
    }

    public static async load() {
        for ( let key in Resource.meshResource ) {
            Resource.meshes[ key ] = await new Promise( (resolve: any, reject: any ) => {
                Resource._loadMeshResource( `./resources/meshes/${Resource.meshResource[ key ][ 0 ]}`, `./resources/meshes/${Resource.meshResource[ key ][ 1 ]}` )
                    .then( ( mesh ) => {
                        resolve( mesh );
                    });
            });
        }
    }

    private static async _loadMeshResource( mtlURL: string, objURL: string ) {
        let mtlloader = new THREE.MTLLoader();
        let objloader = new THREE.OBJLoader();
        let material: any;
        let mesh: any;
        material = await new Promise( ( resolve: any, reject: any ) => {
            mtlloader.load( mtlURL, ( material: any ) => {
                resolve( material );
            } );
        });
        material.preload();
        objloader.setMaterials( material );
        mesh = await new Promise( ( resolve: any, reject: any ) => {
            objloader.load( objURL, ( mesh: any ) => {
                resolve( mesh );
            } );
        });
        return mesh;
    }
}