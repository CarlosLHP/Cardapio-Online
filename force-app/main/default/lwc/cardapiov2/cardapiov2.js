import { LightningElement, api, wire, track } from 'lwc';
import getSectionsAndProducts from '@salesforce/apex/cardapioController.getSectionsAndProducts';
import getProducts from '@salesforce/apex/cardapioController.getProducts';
import callWaiterOrder from '@salesforce/apex/cardapioController.callWaiterOrder';
import getImagesProducts from '@salesforce/apex/cardapioController.getImagesProducts';
import getImagesSections from '@salesforce/apex/cardapioController.getImagesSections';
import createRequest from '@salesforce/apex/cardapioController.createRequest';
import getRequests from '@salesforce/apex/cardapioController.getRequests';
import closedRequests from '@salesforce/apex/cardapioController.closedRequests';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
  { label: 'Nome', fieldName: 'Name', type: 'text', initialWidth: 500, cellAttributes: {
    class: { fieldName : "amountColor" }
  }
  },
  { label: 'Preço', fieldName: 'Price__c', type: 'currency', cellAttributes: {
    class: { fieldName : "amountColor" }
  } 
  },
  { type: 'button-icon', typeAttributes:
    { iconName: 'utility:delete', name: 'delete', iconClass: 'slds-icon-text-error' }
  }
];

const REQUEST_COLUMNS = [
  { label: 'Nome', fieldName: 'Name', type: 'text', cellAttributes: {
    class: { fieldName : "amountColor" }
    }
  },
  { label: 'Status', fieldName: 'Status__c', type: 'text', cellAttributes: {
    class: { fieldName : "amountColor" }
  }
  },
  { label: 'Preço', fieldName: 'Value__c', type: 'currency', cellAttributes: {
    class: { fieldName : "amountColor" }
  } 
  }
];

export default class Cardapiov2 extends LightningElement {
    @api recordId;
    @api isLoading = false;
    @track cart = [];
    @track totalPrice;
    @track totalPriceRequests;
    
    isloadingModal = false;
    isloadingProducts = false;
    sectionsIds = [];
    listSections = [];
    listProducts = [];
    listRequests = [];
    showInit = true;
    categorySelected;
    showModal = false;
    isloading = true;
    indexProducts = 0;
    addRow = true;
    indexRow = 0;
    showRequests = false;

    columns = COLUMNS;
    requestColumns = REQUEST_COLUMNS;

    connectedCallback(){
      console.log('recordId => ', this.recordId);
      console.log(this.carrinho);
    }

    @wire(getSectionsAndProducts)
    wiredData({ error, data }) {
      if (data){
        data.forEach(data => this.listSections.push({...data}))
        let categoryString = JSON.stringify(this.listSections);
        getImagesSections({ categoryJson : categoryString })
        .then((images) => {
          console.log('images: ',images);
          this.listSections.forEach(category => category.style__c = images[category.Id]);
        })
        .catch()
        .finally(() => {
          this.isLoading = true;
          console.log(this.listSections);
        });
      } else if (error) {
      }
    }

    handleSection(event){
      this.isloadingProducts = true;
      this.categorySelected = this.listSections.filter(section => section.Id == event.target.dataset.id )[0];
      console.log(this.categorySelected);
      this.listProducts = this.listProducts.filter(() => {});
      getProducts({ sectionId : this.categorySelected.Id })
      .then((result) => {
        result.forEach( product => this.listProducts.push({...product, "amountColor": "slds-text-color_weak"}));
        let stringProduct = JSON.stringify(this.listProducts);
        getImagesProducts({ productsJson: stringProduct })
        .then((images) => {
          console.log(images);
          this.listProducts.forEach( product => product.style = images[product.Id] );
        })
        .catch()
        .finally(() => {
          this.isloadingProducts = false;
          this.showInit = false;
          console.log(this.listProducts);
        });
      })
      .catch();
    }

    closeModal() {
      this.showModal = false;
    }

    handleInit(){
      this.showInit = true;
    }

    addItem(event){
      if(this.addRow == true){
        this.addRow = false;
        let product = this.listProducts.filter(product => product.Id == event.target.dataset.id )[0];
        product.index = this.indexRow;
        this.cart.push(product);
        this.indexRow = this.indexRow + 1;
        console.log(this.indexRow);
        console.log(product);
        setTimeout(() => {
          this.addRow = true;
        }, 3000);
      }
    }
    
    openModal(){
      this.totalPrice = this.cart.reduce((acumulator, product) => { return acumulator + product.Price__c } , 0);
      this.showModal = true;
    }

    callWaiter(){
      callWaiterOrder({ recordId : this.recordId })
      .then((result) => { 
        this.dispatchEvent(new ShowToastEvent({
            title: 'title',
            message: 'message',
            variant: 'success'
        }));
      })
      .catch();
    }

    handleRowAction(event) {
      let productIndex = event.detail.row.index;
      console.log(productIndex);
      this.cart = this.cart.filter(product => product.index != productIndex);
      this.totalPrice = this.cart.reduce((acumulator, product) => { return acumulator + product.Price__c } , 0);
      console.log(this.totalPrice);
    }

    get disableConfirmRequest(){
      return this.cart.length == 0;
    }

    HandlecreateRequest(event){
      this.cart.forEach(product => delete product.amountColor);
      this.cart.forEach(product => delete product.index);
      let cartJson = JSON.stringify(this.cart);
      console.log(cartJson);
      createRequest({ mesaId : this.recordId, productsJson: cartJson})
      .then( () => {
        console.log('Pedido criado');
      })
      .catch()
      .finally(() => { 
        this.closeModal();
        this.cart = [];
      });
    }

    get getCartLenght(){
      return this.cart.length;
    }

    handleGetRequests(){
      this.listRequests = [];
      getRequests({ recordId : this.recordId})
      .then( (result) => {
        result.forEach( product => this.listRequests.push({...product, "amountColor": "slds-text-color_weak"}));
        this.totalPriceRequests = this.listRequests.reduce((acumulator, request) => { return acumulator + request.Value__c } , 0);
        console.log(result);
      })
      .catch()
      .finally(() => {
        this.showRequests = true;
      });
    }

    get emptyRequests(){
      return this.listRequests.length == 0;
    }

    closedRequest(){
      this.showRequests = false;
    }

    handleClosedRequets(){
      this.listRequests.forEach(request => delete request.amountColor);
      this.listRequests.forEach(request => delete request.index);
      let requestsJSON = JSON.stringify(this.listRequests);
      closedRequests({ requestsJSON : requestsJSON, recordId : this.recordId })
      .then()
      .catch((error) => {
        console.log(error);
      }).finally(() => {
        this.showRequests = false;
      });
    }

}