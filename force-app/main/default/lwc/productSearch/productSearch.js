import { LightningElement, api } from 'lwc';
import productSearch from '@salesforce/apex/CustomerDetailsController.productSearch';
export default class ProductSearch extends LightningElement {
    /****************  Properties  ************/
    @api relatedProductName;
    searchProductName;
    searchResults;
    showProd; // bool
    /*Method to Search Product*/
    connectedCallback() {
        this.relatedProductName = '';
    }
    SearchQuery(prodName) {
            const searchTerm = prodName;
            productSearch({ ProductName: searchTerm })
                .then(result => {
                    if (result.length == 0) {
                        console.log('No product found');
                        this.searchResults = null;
                    } else {
                        console.log('Found----');
                        console.log(result);
                        this.searchResults = result;
                    }
                }).catch(error => {
                    console.log('!!!Error!!!');
                    console.log(error);
                })
            return this.searchResults;
        }
        /*
        Purpose: to handle user Input
        event -> Onchange()
         */
    handleProductSearch = (event) => {
            this.searchProductName = event.target.value;
            if (!this.searchProductName) {
                console.log('You searched Nothing.....');
                this.showProd = false;
                return;
            }
            const res = this.SearchQuery(this.searchProductName);
            if (!res) {
                this.showProd = false;
            }
            this.showProd = true;
        }
        /*
        Purpose: to get the selected productId
        event -> onClick()
        */
    ProductSelection = (event) => {
        console.log('You selected a product(Child Component');
        console.log(event.target.innerText);
        this.searchProductName = event.target.innerText;
        this.showProd = false;
        console.log(event.target.dataset.product);
        const productid = event.target.dataset.product;
        const sendproductname = new CustomEvent(
            'selectedproduct', {
                detail: {
                    productId: productid,
                    productName: this.searchProductName
                }
            });
        this.dispatchEvent(sendproductname);
    }
}