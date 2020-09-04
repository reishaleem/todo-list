import React, { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default ({ selected, onChange }) => {
    const [newTaskDueDate, setNewTaskDueDate] = useState(new Date());

    console.log(onChange);
    return (
        <ReactDatePicker
            className="form-control"
            selected={selected}
            onChange={onChange}
            isClearable
            placeholderText="Due date (optional)"
        />
    );
};
