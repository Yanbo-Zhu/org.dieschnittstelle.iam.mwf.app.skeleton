/**
 * this imports the application classes that will be dynamically loaded
 * by the framework at runtime and "exports" them to the framework
 * setting the mwf.app.components object
 */
import {mwf} from "vfh-iam-mwf-base";
import {GenericDialogTemplateViewController} from "vfh-iam-mwf-base";

/* application libraries: the main application class */
import MyApplication from "./MyApplication.js";
/* application libraries: model */
import * as entities from "./model/MyEntities.js";
/* application libraries: view controllers */
// TODO-REPEATED: import any further view controllers here
import ListviewViewController from "./controller/ListviewViewController.js";
import MyInitialViewController from "./controller/MyInitialViewController.js";
import ReadviewViewController from "./controller/ReadviewViewController.js";
import FRMDemoViewController from "./controller/FRMDemoViewController.js";
import EditDialogViewController from "./controller/EditDialogViewController.js";
import MapsDemoViewController from "./controller/MapsDemoViewController.js";
import {SidemenuViewController} from "vfh-iam-mwf-base/src/js/mwf/mwf";

// we export the framework modules required by the application and the application modules required by the framework
mwf.app.components = {
    /* we need to provide the generic view controller as part of the classes that will be dynamically instantiated by the framework */
    GenericDialogTemplateViewController,

    /* application modules */
    MyApplication,

    // TODO-REPEATED: export any further view controllers here
    // MyInitialViewController. //  this is replace by the next line
    ListviewViewController,
    ReadviewViewController,
    FRMDemoViewController,
    EditDialogViewController,
    MapsDemoViewController,
    SidemenuViewController
}

// then start the application
window.onload = () => {
    mwf.onloadApplication();
}


