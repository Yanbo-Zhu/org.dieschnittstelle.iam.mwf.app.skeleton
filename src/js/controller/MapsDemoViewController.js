/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";


let mapController ;
let mapView;

export default class MapsDemoViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view. Aufgerufen wenn ein Controller erstmal instanziert wird, also wenn die View zum ersten Mal angezeigt wird. oncreate() wird nur einmal aufgerufen, auch wenn die View mehrfach angezeigt wird.
     * oncreate() wird nicht aufgerufen, wenn die View nur wieder angezeigt wird, nachdem sie vorher schon einmal angezeigt wurde. In diesem Fall wird onresume() aufgerufen.
     * oncreate wird aufgerufen, wenn User den Ansicht noch nicht gesehen hat, also wenn die View zum ersten Mal angezeigt wird.
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("MapsDemoViewController::oncreate()");

        // call the superclass once creation is done
        super.oncreate();
    }

    /*
        * for any view: resume the view after it has been resumed. Aufgerufen wenn ein Controller wieder angezeigt wird, nachdem er vorher schon einmal angezeigt wurde.
        * onresume wird aufgerufen, wenn User den Ansicht schon gesehen hat,
        * onresume wird aufgetrufen, wenn Ansciht wechseln, aber nicht neu laden will, also wenn die View schon einmal angezeigt wurde.
     */
    async onresume() {
        await super.onresume();

        alert("MapsDemoViewController::onresume()");

        if(!mapController) {
            mapController = L.map("myapp-maproot");
            mapView = this.root.querySelector("#myapp-maproot");
            console.log("MapsDemoViewController::oncreate ", mapController);
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapController);
            mapController.setView([51.505, -0.09], 13);
        } else {
            //
            if(!this.root.querySelector("#myapp-maproot")) {
                this.root.querySelector("#main").appendChild(mapView);
            }
        }


        const items  = [
            new entities.MediaItem("lirem", "https://picsum.photos/100/200"),
            new entities.MediaItem("dopsum", "https://picsum.photos/200/200"),
            new entities.MediaItem("olor", "https://picsum.photos/100/100"),
            new entities.MediaItem("olor", "https://picsum.photos/400/150"),
        ];

        const coords = [
            [52.54471159402152, 13.352894327349361],
            [52.47505945770001, 13.400528223646104],
            [52.496690749059994, 13.43745962549674],
            [52.542887520531295, 13.402641267828974]
        ];

        for (let i = 0; i < coords.length; i++) {

            items[i].latlng = {
                lat: coords[i][0],
                lng: coords[i][1]
            };
        }

        items.forEach(item => {
            const marker = L.marker([item.latlng.lat, item.latlng.lng])
            marker.addTo(mapController);

            const markerPopup = document.createElement("div");
            markerPopup.classList.add("myapp-marker-popup");
            //markerPopup.textContent = item.title;

            const popupTitle = document.createElement("div");
            markerPopup.appendChild(popupTitle);

            const popupImg = document.createElement("img");
            markerPopup.appendChild(popupImg);

            popupTitle.textContent = item.title;
            popupImg.src = item.src;

            marker.bindPopup(markerPopup);


            markerPopup.onclick = () => {
                alert("Marker clicked: " + item.title);
                this.nextView("myapp-demo-view")
            }

            //marker.remove();
        });

        mapController.fitBounds(coords);


    }

    async onpause() {
        alert("MapsDemoViewController::onpause()");
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
