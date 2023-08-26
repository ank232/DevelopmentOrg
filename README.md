# Invoice Management Project Checklist

## Setup and Configuration

- [ ] Create Salesforce Custom Objects:
  - [X] Invoice
  - [X] Payment
  - [X] Line Item
  
- [ ] Create Lightning Web Components:
  - [x] Create LWC for Invoice Creation.
  - [x] Create LWC for Payment Recording.
  - [x] Create LWC for Line Item Creation.
  - [x] Create LWC for Refund Recording.
  - [ ] Utility Buttons on Invoice to Delete or void any invoice
  - [x] Overriding Invoice Record Page with LWC (Related Lists)

- [ ] Implement Apex Classes:
  - [X] Create Apex Controller for LWCs.
  - [X] Implement Apex methods for CRUD operations.

- [ ] Triggers:
  -[x] Trigger to prevent Deletion of any account that has draft Invoices.
  -[ ] Trigger to prevent deletion of any invoice which is pending or paid
  -[x] Trigger to restrict update on any invoice and on related LineItems when its paid
  -[ ] When a Payment is Recorded Update the Payment Date on the Invoice Object with the Current Date.
  
## User Interface

### Web Components

| Component name           | Usage                                                             | Component Location                        |
|--------------------------|-------------------------------------------------------------------|-------------------------------------------|
| CompanyInvoices          | to display the related invoices                                   | Account Record page                       |
| AccountRelatedRecords    | Search Utility to search  related contacts                        | Account Record page                       |
| createInvoiceFromAccount | create invoice record                                             | Account Record page                       |
| createInvoiceLineItem    | create invoiceLineItems                                           | Account Record page ,Invoice Record page  |
| invoiceByStatus          | display invoice-total in three categories                         | Account Record page                       |
| invoiceTotal             | display the related lineItems total(total-tax,grand-total ,total) | Invoice Record page                       |

- [ ] Configure Lightning Path:
  - [X] Set up Lightning Path for Invoice Status tracking.

- [ ] Customize Page Components:
  - [X] Add Lightning Components to display invoices, payments, and line items.
  - [X] Implement modal dialogs for payment recording and line item editing.

## Functionality

- [x] Invoice Management:
  - [X] Implement creation and editing of invoices.
  - [X] Track invoice status changes using Lightning Path.
  - [X] Display related line items and payments.

- [x] Line Item Management:
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
  - [X] Document the data model, component structure, and customization details.

## Additional Enhancements (Optional)

- [ ] Email Notifications:
  - [ ] Implement email notifications for invoice status changes or payment updates.

- [ ] Reporting and Analytics:
  - [ ] Create reports and dashboards to analyze invoice and payment data.

- [ ] Integration:
  - [ ] Integrate with other systems for data synchronization.

- [ ] Mobile Access:
  - [ ] Enhance the application for mobile access using Salesforce mobile app or custom mobile solution.
