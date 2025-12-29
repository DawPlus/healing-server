import React from 'react';
import './Print.css'; // Make sure to import your css file

const PrintButton = () => (
    <button onClick={() => window.print()}>Print</button>
);

const PrintSection = ({children}) => (
    <div className="print-section">
        {children}
    </div>
);

export { PrintButton, PrintSection };