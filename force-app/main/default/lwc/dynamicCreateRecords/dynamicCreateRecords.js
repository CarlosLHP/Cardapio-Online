import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DynamicCreateRecords extends NavigationMixin(LightningElement) {

    @track isLoadingModal = false;
    objectApiName = 'Account';
    recordTypeName = 'AccountDefault';
    title = 'create account';
    

    handleClick(event){
        this.isLoadingModal = true;
    }

    closedModal(event){
        this.isLoadingModal = event.detail;
    }
}