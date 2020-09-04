import React, { useState, useEffect } from "react";
import TaskService from "../service/tasklist.service";
import {
    Form,
    Container,
    Col,
    Button,
    Card,
    Accordion,
    Nav,
    Tab,
    Tabs,
    Row,
} from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import Task from "./Task";
import DatePicker from "./DatePicker";
import ReactDatePicker from "react-datepicker";
import moment from "moment";

export default () => {
    const { register, handleSubmit, control, errors } = useForm();

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

    const [pinnedTaskList, setPinnedTaskList] = useState([]);
    const [overDueTaskList, setOverdueTaskList] = useState([]);
    const [priorityTaskList, setPriorityTaskList] = useState([]);
    const [shortTermTaskList, setShortTermTaskList] = useState([]);
    const [longTermTaskList, setLongTermTaskList] = useState([]);
    const [completedTaskList, setCompletedTaskList] = useState([]);

    useEffect(() => {
        TaskService.getUniverseTaskList(4).then((response) => {
            setTaskList(response.data);
            setCategorizedLists(response.data);
            setTaskListLoading(false);
            setTaskListLoaded(true);
        });
    }, []);

    function setCategorizedLists(tasks) {
        tasks.tasks.forEach((task) => {
            if (task.pinned) {
                setPinnedTaskList((oldList) => [...oldList, task]);
            } else if (task.complete) {
                setCompletedTaskList((oldList) => [...oldList, task]);
            } else if (moment(task.dueDate).isBefore(moment(), "day")) {
                setOverdueTaskList((oldList) => [...oldList, task]);
            } else if (
                moment(task.dueDate).isBetween(
                    moment(),
                    moment().add(7, "days"),
                    "day",
                    "[]"
                )
            ) {
                setPriorityTaskList((oldList) => [...oldList, task]);
            } else if (
                moment(task.dueDate).isBetween(
                    moment().add(7, "days"),
                    moment().add(1, "month"),
                    "day",
                    "(]"
                )
            ) {
                setShortTermTaskList((oldList) => [...oldList, task]);
            } else {
                setLongTermTaskList((oldList) => [...oldList, task]);
            }
        });
    }

    function onChangeNewTaskName(e) {
        setNewTaskName(e.target.value);
    }

    // we would call the task service instead of this
    function onCreateNewTask(data) {
        setTaskListLoaded(false);
        console.log(data);

        TaskService.addTask(
            taskList.id,
            data.newTaskName,
            data.newTaskDueDate,
            false
        ).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setTaskList(response.data);
                console.log(response);
                setTaskListLoaded(true);
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setMessage(resMessage);
                setSuccessful(false);
            }
        );
    }

    // we would call the task service. We have the task list id, with taskList, then we send the id of the specific task here
    // the question here is whether this would be the delete or if it would be the set complete....ie if we want a 'completed'
    // section separate from the deleted
    function onSetTaskComplete(data, taskId) {
        setTaskListLoaded(false);

        TaskService.toggleTaskComplete(taskList.id, taskId).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setTaskList(response.data);
                //setCategorizedLists(response.data); // can't do this, or we just add a bunch of duplicates. Need to implement a method where it finds the list that the task WAS on, removes it, then adds it to its new list. It's similar to the one we have, but it takes just ONE task, not a whole list
                console.log(response);
                setTaskListLoaded(true);
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setMessage(resMessage);
                setSuccessful(false);
            }
        );
    }

    function onDeleteTask(taskId) {
        setTaskListLoaded(false);

        TaskService.deleteTask(taskList.id, taskId).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setTaskList(response.data);
                console.log(response);
                setTaskListLoaded(true);
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setMessage(resMessage);
                setSuccessful(false);
            }
        );
    }

    //console.log(newTaskDueDate);

    // try to show pinned, overdue, and priorty on first page
    // then short term button
    // then long term button
    // then complete button
    // can we add these buttons in the top right so that we can shift between the lists somehow?
    return (
        <Container fluid>
            <Tab.Container id="todo-pills" defaultActiveKey="priority">
                <Card>
                    <Card.Header>
                        <Nav variant="pills">
                            <Nav.Item>
                                <Nav.Link eventKey="priority">
                                    Priority
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="short">Short Term</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="long">Long Term</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="completed">
                                    Completed
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>

                    <Card.Body>
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
                                        <Form.Text>
                                            This field is required
                                        </Form.Text>
                                    )}
                                </Col>
                                <Col md={2}>
                                    <Controller
                                        control={control}
                                        name="newTaskDueDate"
                                        render={({
                                            onChange,
                                            onBlur,
                                            value,
                                        }) => (
                                            <ReactDatePicker
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                selected={value}
                                                className="form-control"
                                                isClearable
                                                placeholderText="Due date (optional)"
                                            />
                                        )}
                                    />
                                </Col>
                                <Col md={1}>
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
                        <Tab.Content>
                            <Tab.Pane eventKey="priority">
                                {taskListLoaded &&
                                    taskList.tasks &&
                                    pinnedTaskList.map((task, i) => {
                                        return (
                                            <Task
                                                taskName={task.task}
                                                taskDueDate={task.dueDate}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(task.id)
                                                }
                                                key={i}
                                                className="pinned"
                                            />
                                        );
                                    })}
                                {taskListLoaded &&
                                    taskList.tasks &&
                                    overDueTaskList.map((task, i) => {
                                        return (
                                            <Task
                                                taskName={task.task}
                                                taskDueDate={task.dueDate}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(task.id)
                                                }
                                                key={i}
                                                className="pinned"
                                            />
                                        );
                                    })}
                                {taskListLoaded &&
                                    taskList.tasks &&
                                    priorityTaskList.map((task, i) => {
                                        return (
                                            <Task
                                                taskName={task.task}
                                                taskDueDate={task.dueDate}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(task.id)
                                                }
                                                key={i}
                                                className="pinned"
                                            />
                                        );
                                    })}
                            </Tab.Pane>
                            <Tab.Pane eventKey="short">
                                {taskListLoaded &&
                                    taskList.tasks &&
                                    shortTermTaskList.map((task, i) => {
                                        return (
                                            <Task
                                                taskName={task.task}
                                                taskDueDate={task.dueDate}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(task.id)
                                                }
                                                key={i}
                                                className="pinned"
                                            />
                                        );
                                    })}
                            </Tab.Pane>
                            <Tab.Pane eventKey="long">
                                {taskListLoaded &&
                                    taskList.tasks &&
                                    longTermTaskList.map((task, i) => {
                                        return (
                                            <Task
                                                taskName={task.task}
                                                taskDueDate={task.dueDate}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(task.id)
                                                }
                                                key={i}
                                                className="pinned"
                                            />
                                        );
                                    })}
                            </Tab.Pane>
                            <Tab.Pane eventKey="completed">
                                {taskListLoaded &&
                                    taskList.tasks &&
                                    completedTaskList.map((task, i) => {
                                        return (
                                            <Task
                                                taskName={task.task}
                                                taskDueDate={task.dueDate}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(task.id)
                                                }
                                                key={i}
                                                className="pinned"
                                            />
                                        );
                                    })}
                            </Tab.Pane>
                        </Tab.Content>
                    </Card.Body>
                </Card>
            </Tab.Container>
        </Container>
    );
};
