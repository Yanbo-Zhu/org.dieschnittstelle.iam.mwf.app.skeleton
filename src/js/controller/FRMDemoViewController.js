/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

export default class FRMDemoViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        const myItem = new entities.MediaItem("lirem", "https://picsum.photos/200/100");


        // TODO: do databinding, set listeners, initialise the view
        this.viewProxy = this.bindElement("myapp-frm-demo-template", {}, this.root).viewProxy;

        this.viewProxy.bindAction("submitForm", (evt) => {
            evt.original.preventDefault(); // prevent the default form submit action, so that the page does not reload
            //const formData = this.viewProxy.getFormData();
            //console.log("formData: ", formData);
            alert("onsubmit!");
        });

        this.viewProxy.bindAction("fileSelected", (evt) => {

            if(evt.original.target.files[0]) {
                console.log("fileSelected: ", evt.original.tragrt, evt.original.target.files[0]);
                const fileReader = new FileReader();
                fileReader.readAsDataURL(evt.original.target.files[0]);
                fileReader.onload = (e) => {
                    //console.log("fileReader Loaded : ", fileReader.result);  // the file content as base64 encoded string (Base64 codiert Bild oder Datei)

                    //const img = this.root.querySelector("main form img");
                    //img.src = fileReader.result;

                    myItem.src = fileReader.result;
                    this.viewProxy.update({item: myItem});
                    myItem.create().then(() => {
                        alert("oncreated!");
                    });
                }
            }
        });

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        console.log("FRMDemoViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

}
