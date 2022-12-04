import { api, LightningElement } from 'lwc';

export default class Test extends LightningElement {
    @api recordId;

    connectedCallback(){
        console.log(this.recordId);
    }

    viewRequest(){

    }
}