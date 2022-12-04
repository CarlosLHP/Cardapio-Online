import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateRecordNavegate extends NavigationMixin(LightningElement) {
    @track selectedValue;
    @api recordId;
    recordTypeValue = '0125f000000Ky7PAAS';

    handleChange(event) {
            this.selectedValue = event.detail.value;
    };
    
    // Navigate to the Account home page
    createRecord() {
        const defaultValues = encodeDefaultFieldValues({
            AccountId: this.recordId
        });

        return this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            },
            state: {
                recordTypeId: this.recordTypeValue,
                defaultFieldValues: defaultValues
            }
        });
    }
}