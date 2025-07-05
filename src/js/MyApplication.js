/**
 * Updated by master on 21.02.24.
 */
import {mwf} from "vfh-iam-mwf-base";
import {EntityManager} from "vfh-iam-mwf-base";
import {GenericCRUDImplLocal} from "vfh-iam-mwf-base";
import {GenericCRUDImplRemote} from "vfh-iam-mwf-base";
import * as entities from "./model/MyEntities.js";

class MyApplication extends mwf.Application {

    constructor() {
        super();
    }

    async oncreate() {
        console.log("MyApplication.oncreate(): calling supertype oncreate");

        // first call the supertype method and pass a callback
        await super.oncreate();
        console.log("MyApplication.oncreate(): initialising local database");

        // initialise the local database
        // TODO-REPEATED: add new entity types to the array of object store names
        await GenericCRUDImplLocal.initialiseDB("mwftutdb", 1, ["MyEntity", "MediaItem"]);
        console.log("MyApplication.oncreate(): local database initialised");


        //// TODO-REPEATED: if entity manager is used, register entities and crud operations for the entity types
        //this.registerEntity("MyEntity", entities.MyEntity, true);
        //this.registerCRUD("MyEntity", this.CRUDOPS.LOCAL, GenericCRUDImplLocal.newInstance("MyEntity"));
        //this.registerCRUD("MyEntity", this.CRUDOPS.REMOTE, GenericCRUDImplRemote.newInstance("MyEntity"));

        // entities.MediaItem ist eine Entity Klasse, die von EntityManager.Entity erbt.
        // Register/Verknüpft the entity type "MediaItem" with the Entity Klasse entities.MediaItem . with that the entity type "MediaItem" is registered with the EntityManager.
        // Register/Verknüpft die entity type "MediaItem" mit dem Entity Klasse entities.MediaItem
        // true: mit ture wird der Datenschutz ausgeführt. Data type consistenz relalisieren. Klasse entities.MediaItem zu  entity type "MediaItem" in der Datenbank
        this.registerEntity("MediaItem", entities.MediaItem, true);


        // Register/Verknüpft the CRUD operations for the entity type "MediaItem". with that the CRUD operations for the entity type "MediaItem" are registered with the EntityManager.
        this.registerCRUD("MediaItem", this.CRUDOPS.LOCAL, GenericCRUDImplLocal.newInstance("MediaItem"));
        this.registerCRUD("MediaItem", this.CRUDOPS.REMOTE, GenericCRUDImplRemote.newInstance("MediaItem"));

        // TODO: do any further application specific initialisations here
        this.initialiseCRUD(this.CRUDOPS.LOCAL, EntityManager);

        // THIS MUST NOT BE FORGOTTEN: initialise the entity manager!
        EntityManager.initialise();
    };
}

const application = new MyApplication();
export {application as default}


