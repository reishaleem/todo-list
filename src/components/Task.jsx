import React from "react";
import { useForm } from "react-hook-form";
import { Form, ListGroup, Button } from "react-bootstrap";

export default ({ taskName, onSetComplete }) => {
    const { register, handleSubmit, errors } = useForm();

    return (
        <ListGroup.Item className="border-0">
            <Form onSubmit={handleSubmit(onSetComplete)}>
                <Button type="submit" variant="primary">
                    C
                </Button>
                <Form.Control
                    name="taskName"
                    readOnly
                    defaultValue={taskName}
                    ref={register({
                        required: true,
                        maxLength: 50,
                    })}
                />
            </Form>
        </ListGroup.Item>
    );
};
