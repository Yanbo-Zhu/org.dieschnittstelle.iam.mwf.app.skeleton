/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {GenericDialogTemplateViewController} from "vfh-iam-mwf-base";

export default class EditDialogViewController extends GenericDialogTemplateViewController {

    constructor() {
        super();
    }

    async onresume() {
        await super.onresume();

        console.log("viewProxy: ", this.root.viewProxy);
        console.log("root: ", this.root);
        console.log("args: ", this.args);

        // this.this.viewProxy.bindAction("onTextInputCompleted", (evt) => {
        //     alert("on Text Input Completed: " + evt.original.target.value);
        //
        // });

        this.root.querySelector("input[type='text']").onblur = (evt) => {
            alert("on Text Input Completed");
            this.root.querySelector("h2").textContent = "Modified Title";
        }
    }




}
