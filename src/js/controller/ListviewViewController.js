/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {GenericCRUDImplLocal} from "vfh-iam-mwf-base";
import {createId} from "vfh-iam-mwf-base/src/js/mwf/crud/mwfEntityManager";


export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root; // the root element of the view, where the view is attached. where this class instanziated
    // TODO-REPEATED: declare custom instance attributes for this controller
    items;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        // alert("ListviewViewController.oncreate() has been called");
        console.log("ListviewViewController.oncreate() has been called");
        console.log("oncreate() root=", this.root);
        console.log("oncreate() items=", this.items);

        const addNewItemAction = this.root.querySelector("#myapp-addNewItem");

        addNewItemAction.onclick = () => {

            // TODO: add always the same item. Create a random generator for the title and src
            const newItem = new entities.MediaItem("", "https://picsum.photos/300/300");


            // //alert("adding: " + newItem.addedDateString)
            // console.log("adding: ", newItem);
            // // this.crudops.create(newItem) gibt ein Promise Object zuruck
            // //this.crudops.create(newItem).then((createIteam) =>
            // //    this.addToListview(createIteam));
            //
            // newItem.create().then(() => this.addToListview(newItem));

            this.showDialog("myapp-mediaitem-dialog", {

                // itemToBeEdited : this name be used  in app html. the name n the app html should be same as the name here
                itemToBeEdited: newItem,
                actionBindings:{

                    // submitEditForm is the name which defined in app html
                    // newItem.title is alway same to the input value you input in form in the input "title"
                    submitEditForm: (evt) => {
                        console.log("evt", evt);
                        evt.original.preventDefault(); // prevent the default form submit action. mit diesen , das Submit-Button nicht die Seite neu laden und das Summit weird nicht ins url addresse hinzugefugen
                        //alert("submitting: " + newItem.title);
                        this.hideDialog();

                        newItem.create().then(() => this.addToListview(newItem));

                    }
                }
            })

            //this.addToListview(newItem);
        }


        // read all items with typename "MediaItem" from the IndexedDB database
        entities.MediaItem.readAll().then(allitems => {
            //console.log("ListviewViewController.oncreate(): allitems=", allitems);

            console.log("items: ", allitems); // this.items addDateString (item.added) is undefined, weil die Daten aus der Datenbank nicht typisiert sind. weil items nicht in der Klasse MediaItem sind
            this.initialiseListview(allitems);
        });

        //this.initialiseListview(this.items);

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        this.crudops = GenericCRUDImplLocal.newInstance("MediaItem");

        console.log("The constructor of ListviewViewController() was called");

        // this.items = [
        //     new entities.MediaItem("lirem", "https://picsum.photos/100/100"),
        //     new entities.MediaItem("ipsum", "https://picsum.photos/200/100"),
        //     new entities.MediaItem("olor", "https://picsum.photos/100/200"),
        //     new entities.MediaItem("sed", "https://picsum.photos/150/300"),
        //     new entities.MediaItem("adipiscing", "https://picsum.photos/300/150"),
        // ];
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly

        console.log("onReturnFromNextView(): ", nextviewid, returnValue, returnStatus);

    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    // bindListItemView(listviewid, itemview, itemobj) {
    //     // TODO: implement how attributes of itemobj shall be displayed in itemview
    //     //console.log("ListviewViewController.bindListItemView(): listviewid=", listviewid);
    //     console.log("ListviewViewController.bindListItemView():     itemview=", itemview);
    //     console.log("ListviewViewController.bindListItemView():     itemobj=", itemobj);
    //
    //     itemview.root.querySelector("h2").textContent = itemobj.title;
    //     itemview.root.getElementsByTagName("img")[0].src = itemobj.src;
    //     itemview.root.querySelector("h3").textContent = itemobj.added;
    // }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled

        console.log("ListviewViewController.onListItemSelected() has been called");
        console.log("onListItemSelected() itemobj=", itemobj);
        //alert("onListItemSelected() itemobj selected=" + itemobj.title);

        this.nextView("myapp-readview", {itemobj});


    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * by delete and edit actions wird diese method aufgerufen.
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled

        console.log("ListviewViewController.onListItemMenuItemSelected() has been called, ", menuitemview, itemobj);

        // menuitemview ist closest li element. itemobj is the selected item
        super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
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

    /* specific methods for view functionality*/
    deleteItem(item) {
        console.log("deleteItem() item=", item);
        //alert("deleteItem() item=" + item.title + " "  + item._id);

        //this.crudops.delete(item._id).then(() => {
        //    this.removeFromListview(item._id);
        //});

        item.delete().then(() => {
            this.removeFromListview(item._id);
        });
    }

    editItem(item) {
        console.log("editItem() item=", item);
        //alert("editItem() item=" + item.title + " "  + item._id);
        //item.title += (" " + item.title);
        //this.crudops.update(item._id, item).then(() => this.updateInListview(item._id, item));
        //item.update().then(() => this.updateInListview(item._id, item));

        this.showDialog("myapp-mediaitem-dialog", {
            itemToBeEdited: item,
            actionBindings:{
                submitEditForm: (evt) => {
                    //console.log("evt", evt);
                    evt.original.preventDefault(); // prevent the default form submit action. mit diesen (prevent the default verhalten) , das Submit-Button nicht die Seite neu laden und das Summit weird nicht ins url addresse hinzugefugen
                    //alert("submitting: " + item.title);
                    //this.hideDialog();

                    item.update().then(() => {
                        this.hideDialog();
                        //this.updateInListview(item._id, item);
                        item.update().then(() => this.updateInListview(item._id, item));
                    });

                    //item.update().then(() => this.updateInListview(item._id, item));
                },
                deleteEditedItem: (evt) => {
                    evt.original.preventDefault();
                    //alert("deleteEditedItem() item=" + item.title + " "  + item._id);

                    //item.delete().then(() => this.removeFromListview(item._id));
                    item.delete().then(() => {
                        this.hideDialog();
                        //this.removeFromListview(item._id);
                        item.delete().then(() => {
                            this.removeFromListview(item._id);
                        });
                    });
                }
            }
        });
    }

    async onresume() {
        entities.MediaItem.readAll().then(items => this.initialiseListview(items));
        super.onresume();
        //super.resume();

    }

}
