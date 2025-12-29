# Form Components Structure

This document explains the structure of the form components and how they handle participant data.

## Component Hierarchy

```
ServiceInsertForm (parent)
├── CustomFormContainer (wrapper)
│   └── FormRefAdapter(FormDataAdapter(Form)) (enhanced component)
├── HealingFormContainer (wrapper for healing)
│   └── CustomFormContainer 
│       └── FormRefAdapter(FormDataAdapter(Healing)) (enhanced component)
```

## How Participant Data Flows

1. User enters participant data and clicks "일괄적용" (Apply to All) button
2. `applyToAllForms` function in ServiceInsertForm:
   - Creates participant data arrays for each form type
   - Updates formData state with participant info
   - Dispatches custom events to form components
3. Each form component receives the data through:
   - CustomFormContainer event listeners
   - FormRefAdapter exposes a `setRows` method 
   - FormDataAdapter ensures data consistency

## Key Components

### FormRefAdapter
- Adds ref forwarding and imperative methods to form components
- Ensures all forms can handle external row updates
- Provides a unified API for updating rows

### FormDataAdapter
- Processes participant data for consistency
- Handles different field naming conventions across forms
- Ensures all form-specific fields are preserved

### InsertFormAdapter
- Adds ref handling to InsertForm components
- Makes sure InsertForm components can handle row updates
- Bridges different data update approaches

### CustomFormContainer
- Listens for custom events
- Manages data application attempts
- Handles event-based communication from the parent

## Implementation Details

- Each form component now uses the ForwardRef pattern
- The `setAllData` function in each form component handles 'all' type updates
- Custom events allow cross-component communication
- New forms can easily be added by wrapping with our adapters

## How to Add New Forms

1. Create your form component
2. Wrap with FormDataAdapter and FormRefAdapter
3. Make sure the InsertForm component uses forwardRef
4. Implement `setAllData` to handle the 'all' type

## Debugging

When debugging participant data issues:
1. Check browser console for "[FormAdapter]" logs
2. Verify custom events are being dispatched
3. Ensure form components implement the correct interfaces 