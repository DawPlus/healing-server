# Page5 - Reservation Management System

## Overview
This folder contains the reservation management system components. The system allows users to manage reservations, view a reservation calendar, handle inspection documents, generate reports, and maintain schedules.

## Folder Structure
- `index.js` - Main container component that integrates all sub-components
- `components/` - Contains modular components for different functionalities:
  - `ReservationCalendar.js` - Calendar view for visualizing reservations by date
  - `InspectionDoc.js` - Component for managing inspection documents
  - `OrderReport.js` - Component for generating and viewing reports
  - `ScheduleView.js` - Component for managing schedules
  - `ReservationForm.js` - Form for creating and editing reservations
  - `index.js` - Barrel file for exporting all components

## Features
- View reservations in a calendar format
- Create, edit and delete reservations
- Generate and view reports
- Manage inspection documents
- View and update schedules
- Search and filter functionality
- Month and year selection for calendar view
- Tabbed interface for easy navigation between functionalities

## State Management
The system uses Redux for state management. The relevant files are:
- `store/reducers/new5Reducer.js` - Contains actions and reducers
- `store/reducers/new5Saga.js` - Contains async operations using redux-saga

## API Endpoints
The system interacts with the following API endpoints:
- `/new5/getReservations` - Get all reservations
- `/new5/getReservation/:id` - Get a single reservation by ID
- `/new5/createReservation` - Create a new reservation
- `/new5/updateReservation/:id` - Update an existing reservation
- `/new5/deleteReservation/:id` - Delete a reservation
- `/new5/getCalendarView` - Get calendar view data
- `/new5/getStatistics` - Get reservation statistics
- `/new5/getSchedules` - Get schedule data
- `/new5/searchSchedules` - Search schedules with parameters
- `/new5/getDocumentList` - Get document list by type

## Usage
The main container component (Page5) is imported in the routing configuration (`MainRoutes.js`) and displayed when the path `/new/5` is accessed.

## Example
```jsx
// Usage in MainRoutes.js
const New5Page = Loadable(lazy(() => import('views/new/Page5')));

// Route definition
{ path: 'new/5', element: <New5Page /> }
```

## Future Improvements
- Add drag-and-drop functionality for calendar events
- Implement PDF export for reports
- Add notification system for approaching reservations
- Improve mobile responsiveness
- Add data visualization for reservation statistics 