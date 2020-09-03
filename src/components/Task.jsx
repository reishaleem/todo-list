import React from "react";
import { useForm } from "react-hook-form";
import { Form, ListGroup, Button } from "react-bootstrap";

export default ({ taskName, onSetComplete, onDelete }) => {
    const { register, handleSubmit, errors } = useForm();

    return (
        <ListGroup.Item className="border-0">
            <Button type="submit" variant="primary" onClick={onSetComplete}>
                C
            </Button>
            <Button type="submit" variant="danger" onClick={onDelete}>
                D
            </Button>
            <p>{taskName}</p>
        </ListGroup.Item>
    );
};
