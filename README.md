# Invoice Management Project Checklist

## Setup and Configuration

- [ ] Create Salesforce Custom Objects:
  - [x] Invoice
  - [x] Payment
  - [x] Line Item
- [ ] Create Lightning Web Components:

  - [x] Create LWC for Invoice Creation.
  - [x] Create LWC for Payment Recording.
  - [x] Create LWC for Line Item Creation.
  - [x] Create LWC for Refund Recording.
  - [ ] Utility Buttons on Invoice to Delete or void any invoice
  - [x] Overriding Invoice Record Page with LWC (Related Lists)

- [x] Implement Apex Classes:
  - [x] Create Apex Controller for LWCs.
  - [x] Implement Apex methods for CRUD operations.

- [x] Triggers: 
    -[x] Trigger to prevent Deletion of any account that has draft Invoices.
    -[x] Trigger to prevent deletion of any invoice which is pending or paid. 
    -[x] Trigger to restrict update on any invoice and on related LineItems when its paid.
    -[x] When a Payment is Recorded Update the Payment Date on the Invoice Object with the Current Date.

## User Interface

### Web Components

| Component name           | Usage                                                             | Component Location                       |
| ------------------------ | ----------------------------------------------------------------- | ---------------------------------------- |
| CompanyInvoices          | to display the related invoices                                   | Account Record page                      |
| AccountRelatedRecords    | Search Utility to search related contacts                         | Account Record page                      |
| createInvoiceFromAccount | create invoice record                                             | Account Record page                      |
| createInvoiceLineItem    | create invoiceLineItems                                           | Account Record page ,Invoice Record page |
| invoiceByStatus          | display invoice-total in three categories                         | Account Record page                      |
| invoiceTota              | display the related lineItems total(total-tax,grand-total ,total) | Invoice Record page                      |
| paymentModal             | display the payment link and redirect it to stripe payment        | Invoice Record page                      |

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
  - [x] Document the data model, component structure, and customization details.
