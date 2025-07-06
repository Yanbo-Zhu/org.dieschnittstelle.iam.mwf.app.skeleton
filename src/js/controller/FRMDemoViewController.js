/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {LocalFileSystemReferenceHandler} from "../model/LocalFileSystemReferenceHandler";
import ExifReader from "exifreader"; // import the exifreader library to read EXIF data from images

export default class FRMDemoViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        await super.oncreate();
    }

    async onresume() {

        await super.onresume();
        console.log("ExifReader: ", ExifReader);

        //const myItem = new entities.MediaItem("lirem", "https://picsum.photos/200/100");

        const myItem = new entities.MediaItem("lirem");
        //myItem.remote = true; // set a flag to indicate that this item is remote, so that it can be handled differently in the view

        const fsHandler = await LocalFileSystemReferenceHandler.getInstance();

        // TODO: do databinding, set listeners, initialise the view
        /*
         * bindElement(elementid, data, parent)
         * bind a view element to some data - elementid might either be an element or a template - this function will be used by subclasses, e.g. for instantiating forms

         * in {item: myItem, }, the item ist self-defined name. Example: if we set { XYZ: myItem}. Then, in app.html, it should use {{XYZ.title}} and {{XYZ.src}} in template  myapp-readview-template
         */
        this.viewProxy = this.bindElement("myapp-frm-demo-template", {item: myItem}, this.root).viewProxy;

        this.viewProxy.bindAction("submitForm",
            async (evt) => {

                // prevent the default form submit action. mit diesen (prevent the default verhalten) , das Submit-Button nicht die Seite neu laden und das Summit wird nicht ins url addresse hinzugefugen
                // prevent the default form submit action, so that the page does not reload
                evt.original.preventDefault();
                //const formData = this.viewProxy.getFormData();
                //console.log("formData: ", formData);
                alert("onsubmit! Remote: " + myItem.remote);

                if(myItem.remote) {
                    // if the item is remote, we can upload it to a server
                    const uploaddata = new FormData();
                    uploaddata.append("imgdata", myItem.imgFile); // append the file to the form data, so that it can be uploaded
                    uploaddata.append("anotherField", "some value"); // append another field to the form data, if needed

                    const request  = new XMLHttpRequest();
                    request.open("POST", "http://localhost:7077/api/upload", true); // true = async

                    // Fire the request. Send is a void method, it does not return value
                    // send is not a Promise, so we cannot use await here
                    // through send(), a asynchronous request is sent to the server, so that the page does not reload. It takes some time until the server responds.
                    // keine response, da response noch nicht zur Verfügung steht, da die Anfrage asynchron ist.  has to be waited.
                    const response = request.send(uploaddata);
                    console.log("response: ", response);

                    // through send(), a asynchronous request is sent to the server.  It takes some time until the server responds.
                    // However, we can use the onload event to handle the response. use callback method
                    // request.onload is a callback function that gets called automatically when an XMLHttpRequest completes successfully (i.e., the request was sent and a response was received from the server).
                    // request.onload() is called when the request is completed
                    request.onload = () => {
                        alert("loaded: " + request.responseText);
                        const responseData = JSON.parse(request.responseText);
                        console.log("responseData; ", responseData);

                        // removes the imgFile property from the myItem object after the image has been successfully uploaded to the remote server.
                        // imgFile is a File or Blob object — a binary file representation (e.g., from a file input element). These types: 1) Are large in memory. 2) Can't be stored easily in systems like IndexedDB, localStorage, or most JSON-based databases. 3) Are no longer needed once the file has been uploaded and stored remotely on the server or on local file system.
                        // After Upload: 1) The image file is saved on the server (e.g., http://localhost:7077/...). 2) Its remote path is now saved in myItem.src. 3) So the original file (imgFile) is no longer needed
                        // Removing it ensures that: 1) You don’t store unnecessary binary data locally. 2) The object is cleaner and lighter for saving in IndexedDB or any client-side DB. 3) You avoid issues with serializing non-JSON-safe values
                        delete myItem.imgFile;

                        // Update image source to remote file
                        myItem.src = "http://localhost:7077/" + responseData.data.imgdata;
                        console.log("myItem ", myItem);

                        // TODO: save item  in the in local DB or another system.
                        // create() method defined on an entity object, which is part of a custom entity management framework (likely for client-side persistence, maybe using IndexedDB or a custom JS-based ORM).
                        // This method creates an entity instance and persists it (e.g., to local storage or a backend) using em.create(...), while also handling inverse (bidirectional) relationships.
                        // 1) Checks for inverse relationships (via prepareInverseOperations()). 2) Calls the entity manager em.create() to persist the entity. 3) Handles any necessary inverse updates (handleInverseOperations()).  4) Supports both: Callback-style and Promise-style (i.e., await entity.create() is valid)
                        myItem.create().then(() => {
                            alert("created reomotely!");
                        });
                    }

                } else {
                    // if the item is not wanted to be saved remotely, store it in the local file system
                    if (myItem.imgFile) {

                        // create a local file system reference for the image file  (e.g. file path or blob: URL)
                        // fsHandler.createLocalFileSystemReference(...) .
                        // It's input is filedata(myItem.imgFile)
                        // it returns a url in local file system: fsPrefix + filename; e.g. opfs://myapp_data/myfile.jpg. filename = myItem.imgFile.name.replaceAll(" ","_");
                        myItem.src = await fsHandler.createLocalFileSystemReference(myItem.imgFile);
                        console.log("myItem.src: ", myItem.src);
                        delete myItem.imgFile; // remove the file from the item, so that it is not stored in the IndexDB database. Deletes the imgFile property to avoid saving the actual file into IndexedDB.
                    }

                    // TODO: ??
                    myItem.create().then(() => {
                        alert("created!");
                    });
                }
            }
        );

        this.viewProxy.bindAction("fileSelected",
            async (evt) => {

                if (evt.original.target.files[0]) {
                    console.log("fileSelected: ", evt.original.target, evt.original.target.files[0]);

                    const imgFile = evt.original.target.files[0];

                    // const fileReader = new FileReader();
                    // fileReader.readAsDataURL(evt.original.target.files[0]);
                    // fileReader.onload = (e) => {
                    //     //console.log("fileReader Loaded : ", fileReader.result);  // the file content as base64 encoded string (Base64 codiert Bild oder Datei)
                    //
                    //     //const img = this.root.querySelector("main form img");
                    //     //img.src = fileReader.result;
                    //
                    //     myItem.src = fileReader.result;
                    //     this.viewProxy.update({item: myItem});
                    //     myItem.create().then(() => {
                    //         alert("oncreated!");
                    //     });
                    // }


                    myItem.src = URL.createObjectURL(imgFile);

                    // update the view with the new item data. will update the img src in the view. With that, the image is displayed in the view
                    this.viewProxy.update({item: myItem});

                    // imgFile is the file that was selected in the file input field, imgFile is a File object, not a string, not a URL.
                    myItem.imgFile = imgFile;

                    // const localReference = await fsHandler.createLocalFileSystemReference(imgFile);
                    // console.log("localReference: ", localReference);
                    // const resolvedReference = await fsHandler.resolveLocalFileSystemReference(localReference)
                    // console.log("resolvedReference: ", resolvedReference);

                    // const imgMetadataPromise = ExifReader.load(imgFile);
                    // console.log("imgMetadataPromise:" + imgMetadataPromise);
                    // imgMetadataPromise.then(imgMetadata => {
                    //     console.log("imgMetadata: ", imgMetadata);
                    // });

                    // read the EXIF metadata from the image file
                    const imgMetadata = await ExifReader.load(imgFile);
                    console.log("imgMetadata:" + imgMetadata);
                }
            }
        );

        // call the superclass once creation is done
        //super.oncreate();
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
