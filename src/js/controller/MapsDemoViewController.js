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
//let allItemsWithCoordinate_global = [];


export default class MapsDemoViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    allItemsWithCoordinate_global;

    constructor() {
        super();
        console.log("MapsDemoViewController()");
        this.allItemsWithCoordinate_global = []; // global array to store all items with coordinates
    }

    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("MapsDemoViewController::oncreate()");

        // call the superclass once creation is done
        await super.oncreate();
    }


    async onresume() {

        await super.onresume();

        //alert("MapsDemoViewController::onresume()");

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
        this.initialiseItemsInMapView_new();
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
            this.initialiseItemsInMapView_new()
        }
    }

    async initialiseItemsInMapView_new() {

        const allitems = await entities.MediaItem.readAll();

        let allItemsWithCoordinate = [];

        for (let i = 0; i < allitems.length; i++) {

            const currentMediaItem = allitems[i];
            //console.log("MapsDemoViewController currentMediaItem.imgFile: ", currentMediaItem.imgFile);
            console.log("MapsDemoViewController currentMediaItem: ", currentMediaItem);
            console.log("MapsDemoViewController currentMediaItem allItemsWithCoordinate_global: ", this.allItemsWithCoordinate_global);
            //console.log("MapsDemoViewController currentMediaItem checkIfItemExists: ", this.checkIfItemExists(currentMediaItem._id, this.allItemsWithCoordinate_global));

            if (this.checkIfItemExists(currentMediaItem._id, this.allItemsWithCoordinate_global)) {
                console.log("MapsDemoViewController currentMediaItem already exists in allItemsWithCoordinate_global: ", currentMediaItem._id);
                allItemsWithCoordinate.push(this.getItemById(currentMediaItem._id, this.allItemsWithCoordinate_global));
            }else {
                console.log("MapsDemoViewController currentMediaItem does not exist in allItemsWithCoordinate_global: ", currentMediaItem._id);
                let latlng = this.generateRandomCoordinates(currentMediaItem)
                currentMediaItem.latlng = latlng;
                allItemsWithCoordinate.push(currentMediaItem);
                this.allItemsWithCoordinate_global.push(currentMediaItem);
            }

            // const key = `${currentMediaItem.latlng.latitude.toFixed(6)},${currentMediaItem.latlng.longitude.toFixed(6)}`;
            // if (!coordMap.has(key)) {
            //     coordMap.set(key, []);
            // }
            // coordMap.get(key).push(currentMediaItem);

            // Check if the coordinate already exists in allCoordinates. always display the first item in the items group which has approximate coordinate
            // const currentCoord = [currentMediaItem.latlng.latitude, currentMediaItem.latlng.longitude];
            // const alreadyExists = allCoordinates.some(coord =>
            //     Math.abs(coord[0] - currentCoord[0]) < 1e-6 &&
            //     Math.abs(coord[1] - currentCoord[1]) < 1e-6
            // );
            //
            // if (!alreadyExists) {
            //     allItemsWithCoordinate.push(currentMediaItem);
            //     allCoordinates.push(currentCoord);
            // }
        }

        console.log("allItemsWithCoordinate: ", allItemsWithCoordinate);



        const coordinateMap = this.generateCoordinateMap(allItemsWithCoordinate);

        console.log("MapsDemoViewController coordinateMap: ", coordinateMap);

        const { selectedItems, selectedCoordinats } = this.selectItemsFormCoordinatMap(coordinateMap);

        console.log("selectedItems: ", selectedItems);
        console.log("selectedCoordinats: ", selectedCoordinats);

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

        mapController.fitBounds(selectedCoordinats);


    }


    // Check if the item with the given ID exists in the global items array
    // If the item is found, return true; otherwise, return false
    checkIfItemExists(itemId, itemsArray) {
        // if itemsArray is empty, return false
        if (!itemsArray || itemsArray.length === 0) {
            return false;
        } else {
            // Check if the item with the given ID exists in the itemsArray
            console.log("MapsDemoViewController checkIfItemExists: itemId: ", itemId, " itemsArray: ", itemsArray);

            const result = itemsArray.some(item => {
                console.log("MapsDemoViewController checkIfItemExists: item._id: ", item._id, " itemId: ", itemId);
                return item._id == itemId;

            });
            console.log("MapsDemoViewController checkIfItemExists result: ", result);

            return result;
        }
    }

    // Find the item with the given ID in the global items array
    // If the item is not found, return undefined
    getItemById(itemId, itemsArray) {
        return itemsArray.find(item => item._id == itemId);
    }

    generateRandomCoordinates(item) {

        // read EXIF GPS daten from the image file of the item
        const imgMetadata = ExifReader.load(item.imgFile, {expanded: true});
        console.log("MapsDemoViewController imgMetadata: " + imgMetadata);

        let latitude, longitude;

        if (imgMetadata.gps) {
            console.log("The image has GPS data.");
            latitude = imgMetadata.gps.latitude;
            longitude = imgMetadata.gps.longitude;
            console.log("GPS Latitude:", latitude);
            console.log("GPS Longitude:", longitude);
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
            const key = `${item.latlng.latitude.toFixed(6)},${item.latlng.longitude.toFixed(6)}`;
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

    async initialiseItemsInMapView() {

        const allitems = await entities.MediaItem.readAll();

        let allItemsWithCoordinate = [];
        let allCoordinates = [];
        //const coordMap = new Map();

        for (let i = 0; i < allitems.length; i++) {

            const currentMediaItem = allitems[i];
            console.log("MapsDemoViewController currentMediaItem: ", currentMediaItem);
            console.log("MapsDemoViewController currentMediaItem.imgFile: ", currentMediaItem.imgFile);

            // Check if the currentMediaItem has a latlng property
            const imgMetadata = await ExifReader.load(currentMediaItem.imgFile, {expanded: true});
            console.log("MapsDemoViewController imgMetadata: " + imgMetadata);

            if (imgMetadata.gps) {
                const {latitude, longitude} = imgMetadata.gps;
                console.log("GPS Latitude:", latitude);
                console.log("GPS Longitude:", longitude);
                currentMediaItem.latlng = { latitude, longitude };
            } else {
                console.log("No GPS data found in EXIF of imgFile.");
                const latitude =52.54471159402152;
                const longitude = 13.352894327349361;

                //const Latitude = 52.45 + Math.random() * 0.10; // 52.45 ~ 52.55
                //const Longitude = 13.35 + Math.random() * 0.10; // 13.35 ~ 13.45

                currentMediaItem.latlng = { latitude, longitude };
            }

            console.log("MapsDemoViewController currentMediaItem.latlng: ", currentMediaItem.latlng);

            // const key = `${currentMediaItem.latlng.latitude.toFixed(6)},${currentMediaItem.latlng.longitude.toFixed(6)}`;
            // if (!coordMap.has(key)) {
            //     coordMap.set(key, []);
            // }
            // coordMap.get(key).push(currentMediaItem);

            // Check if the coordinate already exists in allCoordinates. always display the first item in the items group which has approximate coordinate
            const currentCoord = [currentMediaItem.latlng.latitude, currentMediaItem.latlng.longitude];
            const alreadyExists = allCoordinates.some(coord =>
                Math.abs(coord[0] - currentCoord[0]) < 1e-6 &&
                Math.abs(coord[1] - currentCoord[1]) < 1e-6
            );

            if (!alreadyExists) {
                allItemsWithCoordinate.push(currentMediaItem);
                allCoordinates.push(currentCoord);
            }


        }


        // Now we have a Map with coordinates as keys and arrays of items at those coordinates as values
        // We can randomly select one item from each coordinate group
        // for (const [key, itemsAtCoord] of coordMap.entries()) {
        //     const randomIndex = Math.floor(Math.random() * itemsAtCoord.length);
        //     const selectedItem = itemsAtCoord[randomIndex];
        //     allItemsWithCoordinate.push(selectedItem);
        //
        //     const [latStr, lngStr] = key.split(",");
        //     allCoordinates.push([parseFloat(latStr), parseFloat(lngStr)]);
        // }


        console.log("allItemsWithCoordinate: ", allItemsWithCoordinate);
        console.log("allCoordinates: ", allCoordinates);

        allItemsWithCoordinate.forEach(item => {
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

        mapController.fitBounds(allCoordinates);


        // entities.MediaItem.readAll().then(
        //       allitems => {
        //         //console.log("ListviewViewController.oncreate(): allitems=", allitems);
        //
        //         console.log("MapsDemoViewController items: ", allitems); // this.items addDateString (item.added) is undefined, weil die Daten aus der Datenbank nicht typisiert sind. weil items nicht in der Klasse MediaItem sind
        //
        //         for(let i = 0; i < allitems.length; i++) {
        //             const currentMediaItem = allitems[i];
        //             console.log("currentMediaItem: ", currentMediaItem);
        //
        //             const coords = !!currentMediaItem.latlng;
        //             if (!coords) {
        //
        //                 const lat = 52 + Math.random() * 0.1;  // 52.000 - 52.100
        //                 const lng = 13 + Math.random() * 0.1;  // 13.000 - 13.100
        //
        //                 const coordination_random = [lat, lng]; // default coords
        //
        //                 currentMediaItem.latlng = {
        //                     lat: coordination_random[0],
        //                     lng: coordination_random[1]
        //                 };
        //
        //                 allItemsWithCoordinate.push(currentMediaItem);
        //             }
        //
        //             allCoordinates.push([currentMediaItem.latlng.lat, currentMediaItem.latlng.lng]);
        //
        //         }
        //
        //
        //
        //     }
        // );



        // const items  = [
        //     new entities.MediaItem("lirem", "https://picsum.photos/100/200"),
        //     new entities.MediaItem("dopsum", "https://picsum.photos/200/200"),
        //     new entities.MediaItem("olor", "https://picsum.photos/100/100"),
        //     new entities.MediaItem("olor", "https://picsum.photos/400/150"),
        // ];
        //
        // const coords = [
        //     [52.54471159402152, 13.352894327349361],
        //     [52.47505945770001, 13.400528223646104],
        //     [52.496690749059994, 13.43745962549674],
        //     [52.542887520531295, 13.402641267828974]
        // ];
        //
        // for (let i = 0; i < coords.length; i++) {
        //
        //     items[i].latlng = {
        //         lat: coords[i][0],
        //         lng: coords[i][1]
        //     };
        // }
        //
        // items.forEach(item => {
        //
        //     console.log("MapsDemoViewController item: ", item);
        //
        //     const marker = L.marker([item.latlng.lat, item.latlng.lng])
        //     marker.addTo(mapController);
        //
        //     const markerPopup = document.createElement("div");
        //     markerPopup.classList.add("myapp-marker-popup");
        //     //markerPopup.textContent = item.title;
        //
        //     const popupTitle = document.createElement("div");
        //     markerPopup.appendChild(popupTitle);
        //
        //     const popupImg = document.createElement("img");
        //     markerPopup.appendChild(popupImg);
        //
        //     popupTitle.textContent = item.title;
        //     popupImg.src = item.src;
        //
        //     marker.bindPopup(markerPopup);
        //
        //     markerPopup.onclick = () => {
        //         alert("Marker clicked: " + item.title);
        //         this.nextView("myapp-demo-view")
        //     }
        //
        //     //marker.remove();
        // });
        //
        // console.log("MapsDemoViewController coords: ", coords);
        // mapController.fitBounds(coords);

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
