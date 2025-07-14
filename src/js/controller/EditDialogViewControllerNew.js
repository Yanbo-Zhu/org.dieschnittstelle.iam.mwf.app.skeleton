/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {GenericDialogTemplateViewController} from "vfh-iam-mwf-base";
import {LocalFileSystemReferenceHandler} from "../model/LocalFileSystemReferenceHandler";
import ExifReader from "exifreader"; // import the exifreader library to read EXIF data from images

export default class EditDialogViewControllerNew extends GenericDialogTemplateViewController {
    // instance attributes set by mwf after instantiation
    args;
    root;

    constructor() {
        super();
        console.log("Edit DialogViewControllerNew");
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        await super.oncreate();

        console.log("EditDialogViewController.oncreate(): ");
        console.log("viewProxy: ", this.root.viewProxy);
        console.log("root: ", this.root);
        console.log("args: ", this.args);

        // TODO: do databinding, set listeners, initialise the view
    }

    async onpause() {
        await super.onpause();
    }


    async onresume() {
        await super.onresume();
        console.log("EditDialogViewController.onresume(): ");
        console.log("viewProxy: ", this.root.viewProxy);
        console.log("root: ", this.root);
        console.log("args: ", this.args);

        const myItem = this.args?.itemToBeEdited || new entities.MediaItem("", "");
        console.log("ditDialogViewController.onresume(): myItem: ", myItem);


        const fsHandler = await LocalFileSystemReferenceHandler.getInstance();

        // TODO: do databinding, set listeners, initialise the view
        /*
         * bindElement(elementid, data, parent)
         * bind a view element to some data - elementid might either be an element or a template - this function will be used by subclasses, e.g. for instantiating forms

         * in {item: myItem, }, the item ist self-defined name. Example: if we set { XYZ: myItem}. Then, in app.html, it should use {{XYZ.title}} and {{XYZ.src}} in template  myapp-readview-template
         */
        this.viewProxy = this.bindElement("myapp-mediaitem-dialog-new", {itemToBeEdited: myItem}, this.root).viewProxy;


        // der Zugriff auf event.orginal ist nur möglich, wenn es sich bei dem Event um ein Event handelt, das über Ractive Action Binding in den Templates gehandhabt wird.
        this.viewProxy.bindAction("submitEditForm",
            async (evt) => {

                //const formData = this.viewProxy.getFormData();
                //console.log("formData: ", formData);

                // prevent the default form submit action, so that the page does not reload. mit diesen (prevent the default verhalten) , das Submit-Button nicht die Seite neu laden und das Summit wird nicht ins url addresse hinzugefugen
                evt.original.preventDefault();
                console.log("onsubmit! Remote upload checkbox: " + myItem.remote);

                // // check if the form is valid, e.g. if the title is not empty and a file is selected
                // const form = evt.original.target;
                // const titleInput = form.querySelector('input[name="title"]');
                // const fileInput = form.querySelector('#myapp-frm-editdialog-form-fileinput');
                // const titleError = form.querySelector('#title-error');
                // const fileError = form.querySelector('#file-error');
                //
                // let valid = true;
                //
                // // check if the title input is empty
                // if (!titleInput.value.trim()) {
                //     titleError.style.display = "block";
                //     valid = false;
                // } else {
                //     titleError.style.display = "none";
                // }
                //
                // // // Check if a file is selected
                // // if (!fileInput.files || fileInput.files.length === 0) {
                // //     fileError.style.display = "block";
                // //     valid = false;
                // // } else {
                // //     fileError.style.display = "none";
                // // }
                //
                // if (!valid) {
                //     return; // don't proceed if the form is not valid, do not submit the form
                // }


                // if the item is remote, we can upload it to a server
                if (myItem.remote) {
                    // if the item is remote, we can upload it to a server
                    const uploaddata = new FormData();
                    uploaddata.append("imgdata", myItem.imgFile); // append the file to the form data, so that it can be uploaded
                    uploaddata.append("anotherField", "some value"); // append another field to the form data, if needed

                    const request = new XMLHttpRequest();
                    request.open("POST", "http://localhost:7077/api/upload", true); // true = async

                    /*
                    * Fire the request. Send is a void method, it does not return value
                    * send is not a Promise, so we cannot use await here
                    * through send(), a asynchronous request is sent to the server, so that the page does not reload. It takes some time until the server responds.
                    * keine response, da response noch nicht zur Verfügung steht, da die Anfrage asynchron ist.  has to be waited.
                    */
                    request.send(uploaddata);


                    /*
                    * through send(), a asynchronous request is sent to the server.  It takes some time until the server responds.
                    * However, we can use the onload event to handle the response. use callback method
                    * request.onload is a callback function that gets called automatically when an XMLHttpRequest completes successfully (i.e., the request was sent and a response was received from the server).
                    * request.onload() is called when the request is completed
                    */
                    request.onload = () => {
                        //alert("loaded: " + request.responseText);
                        const responseData = JSON.parse(request.responseText); // parse the response text as JSON, so that we can access the data in it
                        console.log("responseData; ", responseData);

                        /*
                        * removes the imgFile property from the myItem object after the image has been successfully uploaded to the remote server.
                        * imgFile is a File or Blob object — a binary file representation (e.g., from a file input element). These types: 1) Are large in memory. 2) Can't be stored easily in systems like IndexedDB, localStorage, or most JSON-based databases. 3) Are no longer needed once the file has been uploaded and stored remotely on the server or on local file system.
                        * After Upload: 1) The image file is saved on the server (e.g., http://localhost:7077/...). 2) Its remote path is now saved in myItem.src. 3) So the original file (imgFile) is no longer needed
                        * Removing it ensures that: 1) You don’t store unnecessary binary data locally. 2) The object is cleaner and lighter for saving in IndexedDB or any client-side DB. 3) You avoid issues with serializing non-JSON-safe values
                        * please comment the following line, otherwise  the coordinates of this image will not be resolved in map view
                        */
                        //delete myItem.imgFile;

                        // Update image source to remote file
                        myItem.src = "http://localhost:7077/" + responseData.data.imgdata;
                        myItem.img_storage_location = "remoteServer"; // set the storage location of the image to remote, so that it can be handled differently in the view
                        myItem.contentType = responseData.data.contentType;


                        // The following code do not work, because the content type is not set in the response header of the server. The server does not send the content type in the response header.
                        // const xhreqType = new XMLHttpRequest();
                        // const urlOfUploadedData = myItem.src
                        // xhreqType.open("HEAD", urlOfUploadedData);
                        // xhreqType.send();
                        // xhreqType.onload = () => {
                        //     const contentType = xhreqType.getResponseHeader("Content-Type");   // no any return here
                        //     console.log("submitEditForm contentType: ", contentType);
                        //     myItem.contentType = contentType;
                        // }

                        this.updateOrCreateItem(myItem); // update or create the item in the remote server
                    }

                } else {
                    // if the item is not wanted to be saved remotely, store it in the local file system
                    if (myItem.imgFile) {

                        /*
                        * create a local file system reference for the image file  (e.g. file path or blob: URL)
                        * fsHandler.createLocalFileSystemReference(...) .
                        * It's input is filedata(myItem.imgFile)
                        * it returns a url in local file system: fsPrefix + filename; e.g. opfs://myapp_data/myfile.jpg. filename = myItem.imgFile.name.replaceAll(" ","_");
                        */
                        console.log("EditviewViewController myItem.imgFile: ", myItem.imgFile);
                        myItem.src = await fsHandler.createLocalFileSystemReference(myItem.imgFile);

                        // remove the file from the item, so that it is not stored in the IndexDB database. Deletes the imgFile property to avoid saving the actual file into IndexedDB.
                        // please comment the following line, otherwise  the coordinates of this image will not be resolved in mapp view
                        //delete myItem.imgFile;

                        myItem.img_storage_location = "localFileSystem"; // set the storage location of the image to local, so that it can be handled differently in the view

                        console.log("EditviewViewController myItem: ", myItem);
                    }

                    this.updateOrCreateItem(myItem); // update or create the item in the local file system
                }
            }
        );

        this.viewProxy.bindAction("fileSelected",
            async (evt) => {

                if (evt.original.target.files[0]) {
                    console.log("fileSelected: ", evt.original.target, evt.original.target.files[0]);
                    const imgFile = evt.original.target.files[0];
                    console.log("EditviewViewController imgFile: ", imgFile);


                    // create  createLocalFileSystemReference of the image file, so that it can be stored in the local file system
                    // const localReference = await fsHandler.createLocalFileSystemReference(imgFile);
                    // console.log("localReference: ", localReference);
                    // const resolvedReference = await fsHandler.resolveLocalFileSystemReference(localReference)
                    // console.log("resolvedReference: ", resolvedReference);

                    // use FileReader to read the file as a data URL, so that it can be displayed in the view
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


                    // set the src of the item to the file ObjectURL. The object url is like, e.g.  blob:http://localhost:8080/36ec8eb4-eaab-402b-ab9b-c54e10c78c04
                    myItem.src = URL.createObjectURL(imgFile);
                    console.log("EditviewViewController myItem.src: ", myItem.src);

                    if (!myItem.title || myItem.title === "") {
                        myItem.title = imgFile.name.replace(/\.[^/.]+$/, ''); // set the title of the item to the name of the file. Without the file extension
                    }

                    // update the view with the new item data. will update the img src in the view. With that, the image is displayed in the view
                    this.viewProxy.update({itemToBeEdited: myItem});

                    // imgFile is the file that was selected in the file input field, imgFile is a File object, not a string, not a URL.
                    myItem.imgFile = imgFile;
                    console.log("EditviewViewController myItem.imgFile: ", myItem.imgFile);


                    // read the EXIF metadata from the image file. imgMetadata is an object containing the EXIF metadata of the image file, e.g. GPS coordinates, camera settings, etc.
                    const imgMetadataPromise = ExifReader.load(imgFile);
                    console.log("imgMetadataPromise:" + imgMetadataPromise);
                    imgMetadataPromise.then(imgMetadata => {
                        console.log("imgMetadata: ", imgMetadata);
                    });

                }
            }
        );
    }

    updateOrCreateItem(item) {
        if (item.created) {
            console.log("EditviewViewController updateOrCreateItem item: ", item);
            item.update().then(() => {
            });
            //item.update;  # use update(), the img can not be displayed normally again.
        }

        // this.addToListview(newItem) is not needed here, because the this.addToListview(newItem)  is already used in the listview
        // else {
        //     item.create().then(() => {
        //         alert("created and save in a remote server!");
        //     });
        // }
    }

}
