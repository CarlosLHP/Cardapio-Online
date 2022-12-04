import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateRecords extends NavigationMixin(LightningElement){
    @track selectedValue;
    recordTypeValue;

    handleChange(event) {
            this.selectedValue = event.detail.value;
    };
    
    // Navigate to the Account home page
}