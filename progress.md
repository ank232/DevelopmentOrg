  Data Flow: 
 Component loads -> get all related contacts(Child Component)
     |
     V
      -> user input a searchterm ->
      |
      v
       -> if-found->show results (child Component) -> dispatch custom event to parent component -> event contains the contactId
       |
       V 
        -> User Filled the form (Parent Component) -> Checks userInput -> if all okay -> Create the record(Invoice__c)
        |
        V
        If the invoice is saved Successfully ?:Yes: No -> handle the case (Show notification!)
                                               |
                                               V                                         
                                                -> Also need to create the invoice lineItem!=>
                                                                                              |
                                                                                              |
                           <------------------------------------------------------------------
                          |
                          |
                          |
                          V  
         >>>> Invoice Line Item LWc <<<< (Child Component)
                           |
                           |
                           V
-> Let User to create multiple line-items at a time
-> user can add a line item or delete any line item
-> after saving the line items -=> that will create the line items 
-> the line-item should be in a table format
  |
  V -> one Line item, user can search for product (custom search utility to search for product Name ) (Child Component)
      |
      V -> one line item, there's also a picklist for tax type

/*********************************************************************************************************************************************/
Need to create a LWC that will show all invoices(number) by status for a company
|
 -> to update the rollup field 
   |
    -> use triggers(considering all cases)

*************/\**/\****/\***/\*****/\*****/\****/\**/\***********

Apex Triggers: 
-> Prevent Deletion of Invoice if it's in Draft Mode (Invoice Object)
-> Need to show open, overdue and paid invoices(amount[Rollup Field])
-> max 5 invoices can be created at a time
-> develop batch apex to delete last 1 year invoices
-> User cannot add line items if an invoice is already paid
-> User cannot edit any invoice if the invoice status is Pending

Parent LWC ==> createInvoiceFromAccount (GrandParent)
              |          |
              |          V ===> Child Component =-> accountRelatedRecords
              |
              V
Parent LWC ==> CreateInvoiceLineItem (child)
       |               
       L-->-===> Child Component =-> ProductSearch

Also ,

    (Parent) createInvoiceFromAccount --====> CreateInvoiceLineItem (child)

    ----------------------------->>>> New Update <<<<---------------------------------
    
    1. Create Invoice From Account LWC :
        |
        V-------------> 
                      |-> Need to remove these Fields: -> Status | Paid Date |  CompanyName
                      |->  Need to add these Fields: -> From Address        

CreateInvoiceLineItem LWC: -> Can be created from two places
                            1. Account Record Page (child Component)
                            2. Invoice Detail Page (Parent Component) 
Account Record Page Data Flow form CreateInvoiceLineItem LWC ===> First we should check if the invoice is created or not -> field validation(lineItem LWC)-> Db insert
Invoice Detail Page Data flow from CreateInvoiceLineItem LWC --=> We should only check for the field validation->field validation(lineItem LWC)-> dbInsert
                                                               ^
                                                               |
Also ---====-> Change the behaviour of component accordingly--- 
                           |
                           L-> On Invoice Record Page it will be shown as a related list 
                           Functionalities-> 1. user can add line items and can also view the existing line items.
                                             2. saveLine Item should be hidden initially and also along with the table of line-item recs 
                                                           |
That table should show the related line            <=------V 
items and as well can we can also delete them    

Functionality -> 1. Showing the related Invoice Line Items -> all fields are showing except Prouduct Name 
Product Search LWC -> Sending the product name and Id (selected product)
When lineItem is used on recordPage -> ... productsearch should display the product name from related records(Wire Method)
    |
    L-> Instead of Using a child component, should use lightning record edit form !

                                 >>>>>>>>>>>> New Update <<<<<<<<<<
CreateLineItems LWC-> It will  be a table with lightning input field (more flexibility!)
SaveLineItem Button Functionality is working fine but there's a catch => user cannot edit any 
                                                                         existing line item without 
                                                                         adding a line item ?
 
                                       >>>>>>> New Update <<<<<<<<
Need to override the invoice detail page!
One way: Using a lightning record page
Other way: Using a VF page 
                                             Invoice Record page Button functionalities
                                                  |                           |
                                                  |                           |
                                                  V                           V
                                         Record Payment Button           Refund Button
                                                 ||                           ||
                                                 VV                           VV
                                               If the invoice               When atleast one payment                                                
                                               is paid and has lineItems    exist 
How to get Invoice Status ??
Path is also updating the status,that updated status value should also be reflected on Button visibility!
Solution:======> in payload of LMS should add the invoice status and also add the refresh apex wire method to get refresh status (Not working!!)
Problem with the above solution::
-=> Invoice status handling!!, how to make sure that the data is synchronised?
-=> If someone updates the invoice by any means and didn't update the page and try to click on payment method? 
Another Solution ===> Platform Event? 
How to get two properties in Sync??
Prop1: lineItemsData (Coming from Related Records or user input data)
Prop2: InvoiceStatus (Coming from Wire Method)

                >>> Update<<
CreateInvoiceLineItem fires LMS containg the lineItems -=> Messsage Distribution
                                                                     |-> invoice buttons 
                                                                     |-> invoice total 
Invoice total LWC -> when user add a lineitem but which is to be inserted in DB!
                                                                      |->                                                          

Record Payment Button Behaviour-> 1. WHEN there are lineitems present
                                  2. When user perform some modifications in lineitems and didnt save those and then clicks on payment button 

Payment will be made only against lineItems that are already present or user created them! 
                                 >>>>Update <<<<<<
Need to change the insertLineItems Controller 


Certainly! Below is a simple markdown checklist for your invoice management project. You can customize and expand this checklist based on your project's specific requirements and tasks.

# Invoice Management Project Checklist

## Setup and Configuration

- [ ] Create Salesforce Custom Objects:
  - [X] Invoice
  - [X] Payment
  - [X] Line Item

- [ ] Define Custom Fields on Objects:
  - [ ] Invoice: Status, Total Amount, Due Date, Customer, etc.
  - [ ] Payment: Amount, Date, Invoice Reference, etc.
  - [ ] Line Item: Product, Quantity, Unit Price, Tax, etc.

- [ ] Set Up Record Relationships:
  - [ ] Create Lookup or Master-Detail relationships between objects.
  
- [ ] Create Lightning Web Components:
  - [ ] Create LWC for Invoice Creation and Editing.
  - [ ] Create LWC for Payment Recording.
  - [ ] Create LWC for Line Item Management.

- [ ] Implement Apex Classes:
  - [X] Create Apex Controller for LWCs.
  - [X]  Implement Apex methods for CRUD operations.
  
## User Interface

- [ ] Design Lightning App Pages:
  - [ ] Create App Pages for Invoice List and Detail View.
  - [ ] Create App Page for Payment Recording.
  - [ ] Customize page layouts for each object.

- [ ] Configure Lightning Path:
  - [X] Set up Lightning Path for Invoice Status tracking.

- [ ] Customize Page Components:
  - [X] Add Lightning Components to display invoices, payments, and line items.
  - [X] Implement modal dialogs for payment recording and line item editing.

## Functionality

- [ ] Invoice Management:
  - [X] Implement creation and editing of invoices.
  - [X] Track invoice status changes using Lightning Path.
  - [X] Display related line items and payments.

- [ ] Line Item Management:
  - [X] Allow adding, editing, and deleting line items.
  - [X] Calculate line item totals and taxes dynamically.
  
- [ ] Payment Recording:
  - [ ] Create payment records associated with invoices.
  - [ ] Calculate total payments and outstanding amounts.

## Testing

- Test Scenarios:
  - [X] Bulk Record Test
  - [ ] Negative Test Cases Testing
  - [X] Create and edit invoices.
  - [X] Add, edit, and delete line items.
  - [ ] Record payments and calculate outstanding amounts.

- [ ] Test Lightning Components:
  - [ ] Verify component behavior, data retrieval, and rendering.

- [ ] Test Apex Methods:
  - [ ] Ensure CRUD operations work correctly.

## Deployment

- [ ] Deploy to Development Environment:
  - [ ] Test the application in a development environment.

- [ ] Deploy to Production Environment:
  - [ ] Migrate the application to the production environment.

- [ ] User Training:
  - [ ] Provide training to end users on using the invoice management system.

## Documentation

- [ ] User Guide:
  - [ ] Prepare a user guide explaining how to use the application.

- [ ] Technical Documentation:
  - [ ] Document the data model, component structure, and customization details.

## Additional Enhancements (Optional)

- [ ] Email Notifications:
  - [ ] Implement email notifications for invoice status changes or payment updates.

- [ ] Reporting and Analytics:
  - [ ] Create reports and dashboards to analyze invoice and payment data.

- [ ] Integration:
  - [ ] Integrate with other systems for data synchronization.

- [ ] Mobile Access:
  - [ ] Enhance the application for mobile access using Salesforce mobile app or custom mobile solution.

## Conclusion

This checklist provides a starting point for managing your invoice management project. Customize and expand it as needed to fit your project's scope and requirements. Remember to continuously test, iterate, and involve stakeholders throughout the development process.