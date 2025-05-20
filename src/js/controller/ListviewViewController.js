/**
 * @author J�rn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    items;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        // alert("ListviewViewController.oncreate() has been called");
        console.log("ListviewViewController.oncreate() has been called: root=", this.root);
        console.log("oncreate() items=", this.items);

        this.initialiseListview(this.items);

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        console.log("The constructor of ListviewViewController() was called");

        this.items = [
            new entities.MediaItem("lirem", "https://picsum.photos/100/100"),
            new entities.MediaItem("ipsum", "https://picsum.photos/100/100"),
            new entities.MediaItem("olor", "https://picsum.photos/100/200"),
            new entities.MediaItem("sed", "https://picsum.photos/100/100"),
            new entities.MediaItem("do", "https://picsum.photos/200/200"),
        ];
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
        console.log("ListviewViewController.bindListItemView(): listviewid=", listviewid);
        console.log("ListviewViewController.bindListItemView():     itemview=", itemview);
        console.log("ListviewViewController.bindListItemView():     itemobj=", itemobj);

        itemview.root.querySelector("h2").textContent = itemobj.title;
        itemview.root.getElementsByTagName("img")[0].src = itemobj.src;
        itemview.root.querySelector("h3").textContent = itemobj.added;
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
