/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import ExifReader from "exifreader"; // import the exifreader library to read EXIF data from images

export let mapController ;
export let mapView;
// L : Leaflet library is impoerted in the app.html file
let allItemsWithCoordinate_global = []; // global array to store all ever used items with their respective coordinates


export default class MapsDemoViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    constructor() {
        super();
        console.log("MapsDemoViewController()");
    }

    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("MapsDemoViewController::oncreate()");

        // call the superclass once creation is done
        await super.oncreate();
    }


    async onresume() {

        await super.onresume();

        if(!mapController) {
            mapController = L.map("myapp-maproot");
            mapView = this.root.querySelector("#myapp-maproot");
            console.log("MapsDemoViewController::oncreate ", mapController);
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapController);
            mapController.setView([51.505, -0.09], 13);
        } else {
            if(!this.root.querySelector("#myapp-maproot")) {
                this.root.querySelector("#main").appendChild(mapView);
            }
        }
        await this.initialiseItemsInMapView();
    }

    // onpause(): called when the view is paused. This function can be called before switching to another view, or when the app is closed.
    async onpause() {
        //alert("MapsDemoViewController::onpause()");
        await super.onpause();
    }


    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        console.log("MapsDemoViewController, onReturnFromNextView(): ", nextviewid, returnValue, returnStatus);

        if (returnStatus === "itemDeleted") {
            await this.initialiseItemsInMapView()
        }
    }

    async initialiseItemsInMapView() {

        //clear old markers from mapController when initialiseItemsInMapView() is called on resume or after deletion. If this is not done, the markers are added again and again, even if the items are already deleted ,so that the map is cluttered with markers
        mapController.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polyline) {
                mapController.removeLayer(layer);
            }
        });

        // read all items from the database. check if they already have a latlng property, if not, generate random coordinates. if the item already exists in the global array allItemsWithCoordinate_global, use the existing item from there. save the items with coordinates in a array allItemsWithCoordinate
        const allitems = await entities.MediaItem.readAll();
        console.log("MapsDemoViewController initialiseItemsInMapView  allitems: ", allitems);

        let allItemsWithCoordinate = [];

        for (let i = 0; i < allitems.length; i++) {

            const currentMediaItem = allitems[i];
            console.log("MapsDemoViewController currentMediaItem: ", currentMediaItem);
            console.log("MapsDemoViewController currentMediaItem allItemsWithCoordinate_global: ", allItemsWithCoordinate_global);

            // Check if the currentMediaItem already has a latlng property. If not, generate random coordinates. if the item already exists in the global array allItemsWithCoordinate_global, use the existing item from there,
            if (this.checkIfItemExists(currentMediaItem._id, allItemsWithCoordinate_global)) {
                console.log("MapsDemoViewController currentMediaItem already exists in allItemsWithCoordinate_global: ", currentMediaItem._id);
                allItemsWithCoordinate.push(this.getItemById(currentMediaItem._id, allItemsWithCoordinate_global));
            }else {
                console.log("MapsDemoViewController currentMediaItem does not exist in allItemsWithCoordinate_global: ", currentMediaItem._id);
                let latlng = this.generateRandomCoordinates(currentMediaItem)
                currentMediaItem.latlng = latlng;

                // add the currentMediaItem to the allItemsWithCoordinate array, so that it can be used in the this iteration
                allItemsWithCoordinate.push(currentMediaItem);

                // add the currentMediaItem to the global array allItemsWithCoordinate_global, so that it can be used in the next iteration
                allItemsWithCoordinate_global.push(currentMediaItem);
            }


        }

        console.log("allItemsWithCoordinate: ", allItemsWithCoordinate);


        // Now we have a Map with coordinates as keys and arrays of items at those coordinates as values
        const coordinateMap = this.generateCoordinateMap(allItemsWithCoordinate);
        console.log("MapsDemoViewController coordinateMap: ", coordinateMap);

        // select one item from each coordinate group
        const { selectedItems, selectedCoordinats } = this.selectItemsFormCoordinatMap(coordinateMap);
        console.log("selectedItems: ", selectedItems);
        console.log("selectedCoordinats: ", selectedCoordinats);


        // add markers to the map for each selected item
        selectedItems.forEach(item => {
            console.log("MapsDemoViewController allItemsWithCoordinate item: ", item);

            const marker = L.marker([item.latlng.latitude, item.latlng.longitude])
            marker.addTo(mapController);

            const markerPopup = document.createElement("div");
            markerPopup.classList.add("myapp-marker-popup");
            //markerPopup.textContent = item.title;

            const popupTitle = document.createElement("div");
            markerPopup.appendChild(popupTitle);

            popupTitle.textContent = item.title;

            //const popupImg = document.createElement("img");
            //markerPopup.appendChild(popupImg);
            //popupImg.src = item.src;

            marker.bindPopup(markerPopup);

            markerPopup.onclick = () => {
                //alert("Marker clicked: " + item.title);
                console.log("MapsDemoViewController markerPopup clicked: item  ", item);
                const itemobj = item; // set the item to be used in the next view
                this.nextView("myapp-readview", {itemobj})
            }

        })

        // fit the map to the bounds of the selected coordinates
        mapController.fitBounds(selectedCoordinats);


    }
    

    // Check if the item with the given ID exists in the global items array
    // If the item is found, return true; otherwise, return false
    
    checkIfItemExists(itemId, itemsArray) {
        console.log("MapsDemoViewController checkIfItemExists: itemId: ", itemId, " itemsArray: ", itemsArray, "itemsArray.length: ", itemsArray.length);

        // if itemsArray is empty, return false
        if (!itemsArray || itemsArray.length === 0) {
            return false;
        } else {
            // Check if the item with the given ID exists in the itemsArray
            console.log("MapsDemoViewController checkIfItemExists: itemId: ", itemId, " itemsArray: ", itemsArray);

            // Use Array.prototype.some() to check if any item in the array has the same _id as itemId. if so, return true
            const result = itemsArray.some(item => {
                console.log("MapsDemoViewController checkIfItemExists: item._id: ", item._id, " itemId: ", itemId);
                return item._id == itemId;
            });
            console.log("MapsDemoViewController checkIfItemExists result: ", result);

            return result;
        }
    }

    // checkIfItemExists_alternative(itemId, itemsArray) {
    //     console.log("MapsDemoViewController checkIfItemExists: itemId: ", itemId, " itemsArray: ", itemsArray, "itemsArray.length: ", itemsArray.length);
    //
    //     // if itemsArray is empty, return false
    //     if (!itemsArray || itemsArray.length === 0) {
    //         return false;
    //     }
    //
    //     for (let i = 0; i < itemsArray.length; i++) {
    //         const item = itemsArray[i];
    //         console.log("MapsDemoViewController checkIfItemExists: item._id: ", item._id, " itemId: ", itemId);
    //
    //         if (item._id == itemId) {
    //             console.log("MapsDemoViewController checkIfItemExists result: true");
    //             return true;
    //         }
    //     }
    //
    //     console.log("MapsDemoViewController checkIfItemExists result: false");
    //     return false;
    // }

    // Find the item with the given ID in the global items array
    // If the item is not found, return undefined
    getItemById(itemId, itemsArray) {
        return itemsArray.find(item => item._id == itemId);
    }

    generateRandomCoordinates(item) {

        // read EXIF GPS daten from the image file of the item
        const imgMetadata =  ExifReader.load(item.imgFile, {expanded: true});
        console.log("MapsDemoViewController imgMetadata: " + imgMetadata);

        let latitude, longitude;

        if (imgMetadata.gps) {
            console.log("The image has GPS data.");
            latitude = imgMetadata.gps.latitude;
            longitude = imgMetadata.gps.longitude;
        } else {
            console.log("No GPS data found in EXIF of imgFile. Generating random coordinates.");
            //latitude =52.54471159402152;
            //longitude = 13.352894327349361;

            latitude = 52.45 + Math.random() * 0.10; // 52.45 ~ 52.55
            longitude = 13.35 + Math.random() * 0.10; // 13.35 ~ 13.45

        }
        
        const latlng = { latitude, longitude };
        console.log(`latitude: ${latlng.latitude}, longitude: ${latlng.longitude}`);
        
        return latlng;
    }

    generateCoordinateMap(itemArray) {
        let coordMap = new Map();

        itemArray.forEach(item => {
            const key = `${item.latlng.latitude.toFixed(6)}, ${item.latlng.longitude.toFixed(6)}`;
            if (!coordMap.has(key)) {
                coordMap.set(key, []);
            }
            coordMap.get(key).push(item);
        });

        return coordMap;
    }

    selectItemsFormCoordinatMap(coordMap) {
        let selectedItems = [];
        let selectedCoordinats = [];

        //Now we have a Map with coordinates as keys and arrays of items at those coordinates as values
        //We can randomly select one item from each coordinate group
        for (const [key, itemsAtCoord] of coordMap.entries()) {
            const randomIndex = Math.floor(Math.random() * itemsAtCoord.length);
            const selectedItem = itemsAtCoord[randomIndex];
            selectedItems.push(selectedItem);

            const [latStr, lngStr] = key.split(",");
            selectedCoordinats.push([parseFloat(latStr), parseFloat(lngStr)]);
        }

        return { selectedItems, selectedCoordinats };;
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
        console.log("MapsDemoViewController onListItemSelected: ", itemobj, listviewid);
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
        console.log("MapsDemoViewController onListItemMenuItemSelected: ", menuitemview, itemobj, listview);
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

}
