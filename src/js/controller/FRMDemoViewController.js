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
        this.viewProxy = this.bindElement("myapp-frm-demo-template", {item:myItem}, this.root).viewProxy;

        this.viewProxy.bindAction("submitForm", async (evt) => {
            evt.original.preventDefault(); // prevent the default form submit action, so that the page does not reload
            //const formData = this.viewProxy.getFormData();
            //console.log("formData: ", formData);
            alert("onsubmit! Remote: " + myItem.remote);

            if(myItem.remote) {
                // if the item is remote, we can upload it to a server
                const uploaddata = new FormData();
                uploaddata.append("imgdata", myItem.imgFile); // append the file to the form data, so that it can be uploaded
                uploaddata.append("anotherField", "some value"); // append another field to the form data, if needed

                const request  = new XMLHttpRequest();
                request.open("POST", "http://localhost:7077/api/upload"); //

                const response = request.send(uploaddata);
                console.log("response: ", response); // keine response, da reponse noch nicht zur Verfügung steht, da die Anfrage asynchron ist.  has to be waited. use callback method . send is keine Promise

                // request.onload() is called when the request is completed
                request.onload = () => {
                    alert("loaded: " + request.responseText);
                    const responseData = JSON.parse(request.responseText);
                    console.log("responseData; ", responseData);
                    delete myItem.imgFile; // remove the file from the item, so that it is not stored in the IndexDB database, because this imgFile is already stored in the local file system
                    myItem.src = "http://localhost:7077/" + responseData.data.imgdata;
                    console.log("myItem ", myItem);

                    myItem.create().then(() => {
                        alert("created reomotely!");

                    });
                }

            } else {
                // if the item is not remote, we can store it in the local file system
                if (myItem.imgFile) {
                    myItem.src = await fsHandler.createLocalFileSystemReference(myItem.imgFile);
                    console.log("myItem.src: ", myItem.src);
                    delete myItem.imgFile; // remove the file from the item, so that it is not stored in the IndexDB database, because this imgFile is already stored in the local file system

                }

                myItem.create().then(() => {
                    alert("created!");
                });
            }



        });

        this.viewProxy.bindAction("fileSelected", async (evt) => {

            if (evt.original.target.files[0]) {
                console.log("fileSelected: ", evt.original.tragrt, evt.original.target.files[0]);

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
                this.viewProxy.update({item: myItem});
                myItem.imgFile = imgFile; // store the file in the item, so that it can be used later

                // const localReference = await fsHandler.createLocalFileSystemReference(imgFile);
                // console.log("localReference: ", localReference);
                // const resolvedReference = await fsHandler.resolveLocalFileSystemReference(localReference)
                // console.log("resolvedReference: ", resolvedReference);

                // const imgMetadataPromise = ExifReader.load(imgFile);
                // console.log("imgMetadataPromise:" + imgMetadataPromise);
                // imgMetadataPromise.then(imgMetadata => {
                //     console.log("imgMetadata: ", imgMetadata);
                // });

                const imgMetadata = await ExifReader.load(imgFile);
                console.log("imgMetadata:" + imgMetadata);
            }
        });

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
