/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {GenericCRUDImplLocal} from "vfh-iam-mwf-base";
import {createId} from "vfh-iam-mwf-base/src/js/mwf/crud/mwfEntityManager";
import {LocalFileSystemReferenceHandler} from "../model/LocalFileSystemReferenceHandler";


export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root; // the root element of the view, where the view is attached. where this class instanziated
    // TODO-REPEATED: declare custom instance attributes for this controller
    items;
    dataSourceScope;

    // fsHandler = await LocalFileSystemReferenceHandler.getInstance();
    //


    constructor() {
        console.log("The constructor of ListviewViewController() was called");

        super();
        this.crudops = GenericCRUDImplLocal.newInstance("MediaItem");
        this.dataSourceScope = "localAndRemote"; // "local" or "remote" or "localAndRemote"



        // this.items = [
        //     new entities.MediaItem("lirem", "https://picsum.photos/100/100"),
        //     new entities.MediaItem("ipsum", "https://picsum.photos/200/100"),
        //     new entities.MediaItem("olor", "https://picsum.photos/100/200"),
        //     new entities.MediaItem("sed", "https://picsum.photos/150/300"),
        //     new entities.MediaItem("adipiscing", "https://picsum.photos/300/150"),
        // ];
    }

    /*
     *for any view: initialise the view
     *oncreate(): initialise the view. oncreate() wird aufgerufen, wenn ein Controller erstmal instanziiert wird, also wenn die View zum ersten Mal angezeigt wird.
     * oncreate() wird nur einmal aufgerufen, auch wenn die View mehrfach angezeigt wird.
     * oncreate() wird nicht aufgerufen, wenn die View nur wieder angezeigt wird, nachdem sie vorher schon einmal angezeigt wurde. In diesem Fall wird onresume() aufgerufen.
     * oncreate wird aufgerufen, wenn User den Ansicht noch nicht gesehen hat, also wenn die View zum ersten Mal angezeigt wird.
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        // alert("ListviewViewController.oncreate() has been called");
        console.log("ListviewViewController.oncreate() has been called");
        console.log("oncreate() root=", this.root);
        console.log("oncreate() items=", this.items);


        // Add action after the plus button with id "myapp-addNewItem" is clicked
        const addNewItemAction = this.root.querySelector("#myapp-addNewItem");
        addNewItemAction.onclick = () => {

            // TODO: add always the same item. Create a random generator for the title and src
            // newItem is an instance of MediaItem class in Entity manager (../model/MyEntities.js)
            //const newItem = new entities.MediaItem("", "https://picsum.photos/300/300");
            const newItem = new entities.MediaItem("", "", createId());


            // //alert("adding: " + newItem.addedDateString)
            // console.log("adding: ", newItem);
            // // this.crudops.create(newItem) gibt ein Promise Object zuruck
            // //this.crudops.create(newItem).then((createIteam) =>
            // //    this.addToListview(createIteam));
            //
            // newItem.create().then(() => this.addToListview(newItem));

            this.showDialog("myapp-mediaitem-dialog-new", {

                // verweise itemToBeEdited auf newItem.  make itemToBeEdited refer to newItem
                // itemToBeEdited : this name be already used in app.html. the name in the app html should be also same as the name here
                // newItem is an instance of MediaItem class in Entity manager (../model/MyEntities.js)/  newItem
                itemToBeEdited: newItem,
                actionBindings:{

                    // submitEditForm is the name which defined in app.html
                    // newItem.title is alway same to the input value you input in form in the input "title"
                    submitEditForm: async (evt) => {
                        console.log("evt", evt);

                        // In many UI frameworks or libraries (like MontiWUi, Meteor, or some custom frameworks), the evt parameter is not the raw browser event. Instead, it's a wrapped or custom event object provided by the framework.
                        //evt.original refers to the original native DOM event (like a regular MouseEvent or SubmitEvent from the browser).
                        //So evt.original.preventDefault() calls the native preventDefault() method to stop the form from doing its default behavior — like reloading the page or submitting via URL.
                        evt.original.preventDefault(); // prevent the default form submit action. mit diesen , das Submit-Button nicht die Seite neu laden und das Submit wird nicht ins url addresse hinzugefugen

                        this.hideDialog(true);



                        // newItem.src = await fsHandler.createLocalFileSystemReference(newItem.imgFile);
                        // console.log("ListviewViewController  myItem.src: ", newItem.src);
                        // delete newItem.imgFile;
                        //
                        // // TODO: addtoListview() do not contains the resolveLocalFileSystemReference() method, so the src is not an object url. The img src is still  a local file system reference, (e.g. opfs://myapp_data/myfile.jpg) und can not be displayed in the Listview properly
                        // newItem.create().then(() => this.addToListview(newItem));


                        // newItem.create().then(() => {
                        //     this.hideDialog();
                        //     //this.updateInListview(item._id, item);
                        //     newItem.create().then(() => this.addToListview(newItem));
                        // });


                    }
                }
            })

            //this.initialiseListItemsInListView(this.dataSourceScope)

            //this.addToListview(newItem);
        }


        // prepare the data source scope switch
        this.prepareDataSourceScopeSwitch();


        // add action to the refresh button in the footer
        //this.refreshListview()
        const refreshButton = this.root.querySelector("footer .mwf-img-refresh")
        refreshButton.onclick = () => {
            //console.log("ListviewViewController.oncreate(): refresh button clicked. this.dataSourceScope): ", this.dataSourceScope);
            this.initialiseListItemsInListView(this.dataSourceScope);
        }




        // read all items with typename "MediaItem" from the IndexedDB database
        this.root.querySelector("footer #datenScope").innerHTML = `Data Source: ${this.dataSourceScope}`
        this.initialiseListItemsInListView(this.dataSourceScope)
        // entities.MediaItem.readAll().then(
        //     async allitems => {
        //         //console.log("ListviewViewController.oncreate(): allitems=", allitems);
        //
        //         console.log("items: ", allitems); // this.items addDateString (item.added) is undefined, weil die Daten aus der Datenbank nicht typisiert sind. weil items nicht in der Klasse MediaItem sind
        //
        //         //convert local url in local file system reference into Object URL
        //         for(let i = 0; i < allitems.length; i++) {
        //             const currentMediaItem = allitems[i];
        //
        //             console.log("currentMediaItem: ", currentMediaItem);
        //
        //
        //             if (currentMediaItem.src) {
        //                 // if the src is a local file system reference, resolve it to an object url
        //                 // in plus button in ListviewViewController.js: newItem.src = :https://picsum.photos/300/300"
        //                 // in FRMDemoViewControl.js: myItem.src = await fsHandler.createLocalFileSystemReference(myItem.imgFile); it returns a url in local file system: fsPrefix + filename; e.g. opfs://myapp_data/myfile.jpg. filename = myItem.imgFile.name.replaceAll(" ","_");
        //                 currentMediaItem.src = await fsHandler.resolveLocalFileSystemReference(currentMediaItem.src);
        //             }
        //         }
        //
        //         this.initialiseListview(allitems);
        //     }
        // );

        //this.initialiseListview(this.items);

        // call the superclass once creation is done
        await super.oncreate();
    }



    /*
    * Resume the view after it has been resumed. onresume() Aufgerufen wenn ein Controller wieder angezeigt wird, nachdem er vorher schon einmal angezeigt wurde.
    * onresume() wird aufgerufen, wenn User den Ansicht schon gesehen hat,
    * onresume() wird aufgerufen, wenn Ansicht wechseln, aber nicht neu laden will, also wenn die View schon einmal angezeigt wurde.
     */
    async onresume() {

        console.log("ListviewViewController.onresume() has been called");

        // entities.MediaItem.readAll().then(items => this.initialiseListview(items));

        await super.onresume();
        //super.resume();

    }

    // onpause(): called when the view is paused, e.g. when the user navigates to another view or closes the app
    async onpause() {
        console.log("ListviewViewController.onpause() has been called");

        await super.onpause();

    }



    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly

        console.log("ListviewViewController onReturnFromNextView(): ", nextviewid, returnValue, returnStatus);
        //this.initialiseListItemsInListView(this.dataSourceScope);

    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    // bindListItemView(listviewid, itemview, itemobj) {
    //     TODO: implement how attributes of itemobj shall be displayed in itemview
    //     console.log("ListviewViewController.bindListItemView(): listviewid=", listviewid);
    //     console.log("ListviewViewController.bindListItemView():     itemview=", itemview);
    //     console.log("ListviewViewController.bindListItemView():     itemobj=", itemobj);
    //     itemview.root.querySelector("h2").textContent = itemobj.title;
    //     itemview.root.getElementsByTagName("img")[0].src = itemobj.src;
    //     itemview.root.querySelector("h3").textContent = itemobj.added;
    // }

    /*
     * for views with listviews: react to the selection of a listitem.
     * This method is called when a list item is selected, e.g. by clicking on it. It is used to display the details of the selected item in a read view.
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
     * by delete and edit actions Dialog is displayed
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


    prepareDataSourceScopeSwitch() {
        const switchElement = this.root.querySelector("footer .mwf-img-tiles")
        const datenScope =  this.root.querySelector("footer #datenScope")
        switchElement.onclick = () => {
            if (this.dataSourceScope == "localAndRemote") {
                this.dataSourceScope = "local";
            } else if (this.dataSourceScope == "local") {
                this.dataSourceScope = "remote";
            } else if (this.dataSourceScope == "remote") {
                this.dataSourceScope = "localAndRemote";
            } else {
                this.dataSourceScope = "localAndRemote"; // default case
            }

            datenScope.innerHTML = `Data Source: ${this.dataSourceScope}`;

            console.log("ListviewViewController.prepareDataSourceScopeSwitch(): dataSourceScope=", this.dataSourceScope);
            this.initialiseListItemsInListView(this.dataSourceScope);

        }
    }



    // read all items with typename "MediaItem" from the IndexedDB database
    async initialiseListItemsInListView(scope) {

        const fsHandler = await LocalFileSystemReferenceHandler.getInstance();


        entities.MediaItem.readAll().then(
            async allitems => {
                //console.log("ListviewViewController.oncreate(): allitems=", allitems);

                console.log("items: ", allitems); // this.items addDateString (item.added) is undefined, weil die Daten aus der Datenbank nicht typisiert sind. weil items nicht in der Klasse MediaItem sind

                let itemsInScope = [];

                //convert local url in local file system reference into Object URL
                for(let i = 0; i < allitems.length; i++) {
                    const currentMediaItem = allitems[i];
                    console.log("currentMediaItem: ", currentMediaItem);

                    if (currentMediaItem.src) {
                        // if the src is a local file system reference, resolve it to an object url
                        // in plus button in ListviewViewController.js: newItem.src = :https://picsum.photos/300/300"
                        // in FRMDemoViewControl.js: myItem.src = await fsHandler.createLocalFileSystemReference(myItem.imgFile); it returns a url in local file system: fsPrefix + filename; e.g. opfs://myapp_data/myfile.jpg. filename = myItem.imgFile.name.replaceAll(" ","_");
                        currentMediaItem.src = await fsHandler.resolveLocalFileSystemReference(currentMediaItem.src);
                    }

                    const isRemote = !!currentMediaItem.remote;
                    switch (scope) {
                        case "localAndRemote":
                            itemsInScope.push(currentMediaItem);
                            break;
                        case "remote":
                            if (isRemote) {
                                itemsInScope.push(currentMediaItem);
                            }
                            break;
                        case "local":
                            if (!isRemote) {
                                itemsInScope.push(currentMediaItem);
                            }
                            break;
                        default:
                            itemsInScope.push(currentMediaItem);
                    }
                }

                console.log("itemsInScope: ", itemsInScope);

                this.initialiseListview(itemsInScope);
            }
        );
    }


    /* specific methods for view functionality*/
    deleteItem(item) {
        this.showDialog("mediaItemDeleteDialog", {
            itemToBeEdited: item,
            actionBindings: {
                submitDeleteForm: ((event) => {
                    event.original.preventDefault();
                    this.hideDialog();
                }),
                deleteItem: ((event) => {
                    item.delete().then(() => {
                        this.removeFromListview(item._id);
                    });
                    this.hideDialog();
                })
            }
        })
    }
    // deleteItem(item) {
    //     console.log("deleteItem() item=", item);
    //     //alert("deleteItem() item=" + item.title + " "  + item._id);
    //
    //     //this.crudops.delete(item._id).then(() => {
    //     //    this.removeFromListview(item._id);
    //     //});
    //
    //     item.delete().then(() => {
    //         this.removeFromListview(item._id);
    //     });
    // }

    editItem(item) {
        console.log("editItem() item=", item);
        //alert("editItem() item=" + item.title + " "  + item._id);
        //item.title += (" " + item.title);
        //this.crudops.update(item._id, item).then(() => this.updateInListview(item._id, item));
        //item.update().then(() => this.updateInListview(item._id, item));


        this.itemToBeEdited = {title: item.title, src: item.src, remote: item.remote}; // {... item} this is used in the app html to bind the item to be edited to the dialog

        this.showDialog("myapp-mediaitem-dialog-new", {
            itemToBeEdited: item,
            actionBindings:{
                submitEditForm: (evt) => {
                    //console.log("evt", evt);
                    evt.original.preventDefault(); // prevent the default form submit action. mit diesen (prevent the default verhalten) , das Submit-Button nicht die Seite neu laden und das Summit weird nicht ins url addresse hinzugefugen
                    //alert("submitting: " + item.title);

                    this.hideDialog(true);

                    console.log("ListviewViewController.editItem(): item", item);

                    item.update().then(() => {
                        this.hideDialog();
                        //this.updateInListview(item._id, item);
                        item.update().then(() => this.updateInListview(item._id, item));
                    });

                    // item.update().then(() => this.updateInListview(item._id, item));
                },

                deleteEditedItem: (evt) => {
                    evt.original.preventDefault();
                    //alert("deleteEditedItem() item=" + item.title + " "  + item._id);

                    this.hideDialog()

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




    async hideDialog(fromSubmit) {

        console.log("ListviewViewController.hideDialog(): ", this.dialog);
        await super.hideDialog();

        if (!fromSubmit && this.itemToBeEdited) {
            console.log("ListviewViewController.hideDialog() has been called");  //here restore action setzen
        }
    }

}
