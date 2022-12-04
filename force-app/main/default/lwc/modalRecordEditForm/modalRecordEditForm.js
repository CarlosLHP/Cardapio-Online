import { api, LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordCreateDefaults } from 'lightning/uiRecordApi';
import getRecordTypeId from '@salesforce/apex/ModalRecordEditFormController.getRecordTypeId';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class ModalRecordEditForm extends LightningElement {

  @api title;
  @api objectApiName;
  @api recordTypeName;
  @api isLoading = false;

  recordTypeId;
  layout;
  sections;

  @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
  propertyOrFunction;

  @wire(getRecordTypeId, { recordTypeName: '$recordTypeName' })
  wireRecordTypeId;

  @wire(getRecordCreateDefaults, { objectApiName: '$objectApiName', recordTypeId : '$wireRecordTypeId.data' })
  wiredData({ error, data }) {
    if (data) {
      this.recordTypeId = this.wireRecordTypeId.data;
      console.log(this.recordTypeId);
      this.sections = data.layout.sections;
      console.log('sections ', this.sections);
      this.isLoading = true;
    } else if (error) {
      console.error('Error:', error);
    }
  }

  handleClosedModal(event) {
    this.dispatchEvent(new CustomEvent('closedmodal', { 'detail': false } ));
  }

  handleSuccess(event){
      this.dispatchEvent(new ShowToastEvent({
          title: 'Sucess!',
          message: 'Record create',
          variant: 'success'
      }));
      this.handleClosedModal();
  }
}