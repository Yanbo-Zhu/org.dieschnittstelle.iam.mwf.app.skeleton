/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

import {mapController} from "./MapsDemoViewController";

export default class ReadviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("root=", this.root);
        console.log("args=", this.args);
        console.log("mapController=", mapController);

        const myItem = this.args.itemobj //new entities.MediaItem("my new item", "https://picsum.photos/200/100");  // this.args.itemobj;



        // item ist self-defined name , it can be { XYZ: myItem}. theb app.html it should be {{XYZ.title}} and {{XYZ.src}} in temnpaltye  myapp-readview-template
        const templateProxy = this.bindElement("myapp-readview-template", {item: myItem, }, this.root).viewProxy;
        console.log("returnValueFromBindElement: ", templateProxy);


        // his.bindElement("myapp-readview-template", {item: myItem, }, this.root) replace the code below
        // how to use show myItem into the view
        // const h1 = this.root.querySelector("h1");
        // h1.textContent = myItem.title + " " + myItem._id ;
        // const img = this.root.getElementsByTagName("img")[0];
        // img.src = myItem.src;

        // bind the item to the view

        // deleteItem is named originally in the app.html as "deleteItem"
        templateProxy.bindAction( "deleteItem", () => {
            myItem.delete().then(() => {
                this.previousView({item: myItem}, "itemDeleted");
            });

            // const anotherItem = new entities.MediaItem("another item", "https://picsum.photos/200/100");
            // templateProxy.update({item:anotherItem});
        });

        //     const deleteAction = this.root.querySelector(" header button:last-child");
        // deleteAction.onclick = () => {
        //     //alert("delete action");
        //     myItem.delete().then(() => {
        //         this.previousView({item: myItem}, "itemDeleted");
        //     });
        // }

        // this.root.querySelector("footer button").onclick = () => {
        //     this.previousView()
        // }


        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        console.log("ReadviewViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly

        console.log("onReturnFromNextView(): ", nextviewid, returnValue, returnStatus);

        //
        if (returnStatus === "itemDeleted" && returnValue) {
            this.removeFromListview(returnValue.item._id);
        }
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
