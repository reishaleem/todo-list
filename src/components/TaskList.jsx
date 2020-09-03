import React, { useState, useEffect } from "react";
import TaskService from "../service/tasklist.service";
import { Form, Container, Col, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import Task from "./Task";

export default () => {
    const { register, handleSubmit, errors } = useForm();

    const [newTaskName, setNewTaskName] = useState("");
    const [taskList, setTaskList] = useState({
        id: "1",
        tasks: [
            { id: "1", task: "get eggs" },
            { id: "2", task: "testing" },
        ],
    }); // using a default value for now, until we link up backend
    const [taskListLoading, setTaskListLoading] = useState(false);
    const [taskListLoaded, setTaskListLoaded] = useState(true);
    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState("");

    // useEffect(() => {
    //     TaskService.getUniverseTaskList(4).then((response) => {
    //         setTaskList(response.data);
    //         setTaskListLoading(false);
    //         setTaskListLoaded(true);
    //     });
    // }, []);

    function onChangeNewTaskName(e) {
        setNewTaskName(e.target.value);
    }

    // we would call the task service instead of this
    function onCreateNewTask(data) {
        setTaskListLoaded(false);
        let currentList = taskList;
        currentList.tasks.push({ id: "3", task: data.newTaskName });
        setTaskList(currentList);
        setTaskListLoaded(true);
    }

    return (
        <Container fluid>
            <Form onSubmit={handleSubmit(onCreateNewTask)}>
                <Form.Row>
                    <Col md={9}>
                        <Form.Control
                            type="text"
                            name="newTaskName"
                            placeholder="add new task"
                            value={newTaskName}
                            onChange={onChangeNewTaskName}
                            ref={register({
                                required: true,
                                maxLength: 50,
                            })}
                        />
                        {errors.newTaskName && (
                            <Form.Text>This field is required</Form.Text>
                        )}
                    </Col>
                    <Col md={3}>
                        <Button
                            variant="primary"
                            type="submit"
                            className="d-inline-block"
                        >
                            Create
                        </Button>
                    </Col>
                </Form.Row>
            </Form>
            {taskListLoaded &&
                taskList.tasks &&
                taskList.tasks.map((task, i) => {
                    return <Task taskName={task.task} key={i} />;
                })}
        </Container>
    );
};