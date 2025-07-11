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

export default class MapsDemoViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("MapsDemoViewController::oncreate()");

        // call the superclass once creation is done
        super.oncreate();
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

        const allitems = await entities.MediaItem.readAll();

        let allItemsWithCoordinate = [];
        let allCoordinates = [];

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


        for (let i = 0; i < allitems.length; i++) {
            const currentMediaItem = allitems[i];
            console.log("currentMediaItem: ", currentMediaItem);

            const imgMetadata = await ExifReader.load(currentMediaItem);
            console.log("imgMetadata: " + imgMetadata);

            if (!currentMediaItem.latlng) {
                const lat = 52.45 + Math.random() * 0.10; // 52.45 ~ 52.55
                const lng = 13.35 + Math.random() * 0.10; // 13.35 ~ 13.45

                currentMediaItem.latlng = { lat, lng };
            }

            const currentCoord = [currentMediaItem.latlng.lat, currentMediaItem.latlng.lng];

            // Check if the coordinate already exists in allCoordinates
            const alreadyExists = allCoordinates.some(coord =>
                Math.abs(coord[0] - currentCoord[0]) < 1e-6 &&
                Math.abs(coord[1] - currentCoord[1]) < 1e-6
            );

            if (!alreadyExists) {
                allItemsWithCoordinate.push(currentMediaItem);
                allCoordinates.push(currentCoord);
            }
        }

        console.log("allItemsWithCoordinate: ", allItemsWithCoordinate);
        console.log("allCoordinates: ", allCoordinates);


        allItemsWithCoordinate.forEach(item => {
            console.log("MapsDemoViewController allItemsWithCoordinate item: ", item);

            const marker = L.marker([item.latlng.lat, item.latlng.lng])
            marker.addTo(mapController);

            const markerPopup = document.createElement("div");
            markerPopup.classList.add("myapp-marker-popup");
            //markerPopup.textContent = item.title;

            const popupTitle = document.createElement("div");
            markerPopup.appendChild(popupTitle);

            popupTitle.textContent = item.title + " " + item._id;

            //const popupImg = document.createElement("img");
            //markerPopup.appendChild(popupImg);
            //popupImg.src = item.src;

            marker.bindPopup(markerPopup);

            markerPopup.onclick = () => {
                //alert("Marker clicked: " + item.title);
                console.log("MapsDemoViewController markerPopup clicked: item  ", item);
                this.nextView("myapp-readview", item)
            }

        })

        mapController.fitBounds(allCoordinates);



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

    // onpause(): called when the view is paused, e.g. when the user navigates to another view or closes the app
    async onpause() {
        //alert("MapsDemoViewController::onpause()");
    }

    constructor() {
        super();
        console.log("MapsDemoViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        console.log("MapsDemoViewController, onReturnFromNextView(): ", nextviewid, returnValue, returnStatus);

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
