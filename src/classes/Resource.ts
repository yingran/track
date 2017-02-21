/**
 * Resource
 */

export default class Resource {

    public static meshes: any = {};
    public static maps: any = {};

    public static readonly meshResource: any = {
        tree: [ "tree.mtl", "tree.obj" ],
        vehicleBody: [ "vehiclebody.mtl", "vehiclebody.obj" ]
    };

    public static readonly mapResource: Array<string> = [
        "test"
    ]

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

        for ( let i = 0, len = Resource.mapResource.length; i < len; i++ ) {
            Resource.maps[ Resource.mapResource[ i ] ] = await new Promise( (resolve: any, reject: any ) => {
                Resource._loadMapResource( `./resources/maps/${Resource.mapResource[ i ]}.json` )
                    .then( ( data ) => {
                        resolve( data );
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

    private static async _loadMapResource( url: string ) {
        let loader = new THREE.FileLoader();
        let mapData: any;
        loader.setResponseType( "json" );
        mapData = await new Promise( ( resolve: any, reject: any ) => {
            loader.load( url, ( data: any ) => {
                resolve( data );
            });
        });
        return mapData;
    }
}