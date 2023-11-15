# BillZen: an invoice management application

## Setup and Configuration

- [ ] Create Salesforce Custom Objects:
  - [x] Invoices
  - [x] Payments
  - [x] Refunds
  - [x] Line Items

- [ ] Create Lightning Web Components:
  - [x] Create LWC for Invoice Creation.
  - [x] Create LWC for Payment Recording.
  - [x] Create LWC for Line Item Creation.
  - [x] Create LWC for Refund Recording.
  - [x] Utility Buttons on Invoice to Delete or void any invoice
  - [x] Overriding Invoice Record Page with LWC (Related Lists)
  - [X] Stripe payment modal  

- [x] Implement Apex Classes:
  - [x] Create Apex Controller for LWCs.
  - [x] Implement Apex methods for CRUD operations.

- [x] Triggers:
    -[x] Trigger to prevent Deletion of any account that has draft Invoices.
    -[x] Trigger to prevent deletion of any invoice which is pending or paid.
    -[x] Trigger to restrict update on any invoice and on related LineItems when its paid.
    -[x] When a Payment is Recorded Update the Payment Date on the Invoice Object with the Current Date.

## Trigger Framework

- Used a handler-dispatcher method for triggers to make it logic-less and to maintain code redability.
- The Dispatcher class contains a method dispatch() that contains System.TriggerOperation.
- This Dispatcher class is called inside the trigger passing the trigger operation type (after insert, before insert, etc).
- Based on trigger operationType the dispatcher is calling the respective handler class method.
- Using this framework, the trigger is separated from any logic and only contains the dispatch().

## User Interface

## Web Components

| Component name           | Usage                                                             | Component Location                       |
| ------------------------ | ----------------------------------------------------------------- | ---------------------------------------- |
| CompanyInvoices          | to display the related invoices                                   | Account Record page                      |
| AccountRelatedRecords    | Search Utility to search related contacts                         | Account Record page                      |
| createInvoiceFromAccount | create invoice record                                             | Account Record page                      |
| createInvoiceLineItem    | create invoiceLineItems                                           | Account Record page ,Invoice Record page |
| invoiceByStatus          | display invoice-total in three categories                         | Account Record page                      |
| invoiceTotal             | display the related lineItems total(total-tax,grand-total ,total) | Invoice Record page                      |
| paymentModal             | display the payment link and redirect it to stripe payment        | Invoice Record page                      |
| paymentrectable          | shows the related payment record on invoice record page           | Invoice Record page                      |
| invoiceButtons           | shows the invoice button group(includes:                          | Invoice Record page                      |
                           |   payment, refund, exchangerates, preview invoice buttons)        |                                          |

- [x] Customize Page Components:
  - [x] Add Lightning Components to display invoices, payments, and line items.
  - [x] Implement modal dialogs for payment recording and line item editing.

## Functionality

- [x] Invoice Management:

  - [x] Implement creation and editing of invoices.
  - [x] Track invoice status changes using Lightning Path.
  - [x] Display related line items and payments.

- [x] Line Item Management:
  - [x] Allow adding, editing, and deleting line items.
  - [x] Calculate line item totals and taxes dynamically.

- [x] Payment Recording:
  - [x] Create payment records associated with invoices.
  - [x] Calculate total payments and outstanding amounts.

## Testing

- Test Scenarios:

  - [x] Bulk Record Test
  - [x] Negative Test Cases Testing
  - [x] Create and edit invoices.
  - [x] Add, edit, and delete line items.
  - [x] Record payments and calculate outstanding amounts.
  - [x] Testing CRUD operation with different profiles.

## Deployment

 -[x] Using Github Actions defined in sfdx-ci.yml file, which contains commands to automate apex tests as part of Continuous Integration.

## Documentation

- [ ] Technical Documentation:
  - [x] Document the data model, component structure, and customization details.
