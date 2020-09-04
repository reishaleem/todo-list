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

    // returns the filtered old list, without the task anymore
    // this is only for already existing tasks
    function reCategorizeSingleTask(task, listTaskWasIn, listTaskWasInName) {
        const newList = listTaskWasIn.filter((t) => t.id !== task.id);
        if (listTaskWasInName === "pinned") {
            setPinnedTaskList(newList);
        } else if (listTaskWasInName === "overdue") {
            setOverdueTaskList(newList);
        } else if (listTaskWasInName === "priority") {
            setPriorityTaskList(newList);
        } else if (listTaskWasInName === "short") {
            setShortTermTaskList(newList);
        } else if (listTaskWasInName === "long") {
            setLongTermTaskList(newList);
        } else {
            setCompletedTaskList(newList);
        }

        console.log(newList);
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
    }

    // for a single task that was just added
    function categorizeNewTask(task) {
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
    }

    // for when a task is deleted
    function deleteTaskFromList(taskId, listTaskWasIn, listTaskWasInName) {
        const newList = listTaskWasIn.filter((t) => t.id !== taskId);

        if (listTaskWasInName === "pinned") {
            setPinnedTaskList(newList);
        } else if (listTaskWasInName === "overdue") {
            setOverdueTaskList(newList);
        } else if (listTaskWasInName === "priority") {
            setPriorityTaskList(newList);
        } else if (listTaskWasInName === "short") {
            setShortTermTaskList(newList);
        } else if (listTaskWasInName === "long") {
            setLongTermTaskList(newList);
        } else {
            setCompletedTaskList(newList);
        }
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
                console.log(response);
                setTaskList(response.data.taskList);
                categorizeNewTask(response.data.updatedTask);

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
    function onSetTaskComplete(data, taskId, listTaskWasIn, listTaskWasInName) {
        setTaskListLoaded(false);

        TaskService.toggleTaskComplete(taskList.id, taskId).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setTaskList(response.data);
                //setCategorizedLists(response.data); // can't do this, or we just add a bunch of duplicates. Need to implement a method where it finds the list that the task WAS on, removes it, then adds it to its new list. It's similar to the one we have, but it takes just ONE task, not a whole list
                // should *maybe* add a check on this filter to ensure it only has length one, even though we know for sure it will be true?
                reCategorizeSingleTask(
                    response.data.tasks.filter((task) => task.id === taskId)[0],
                    listTaskWasIn,
                    listTaskWasInName
                );
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

    function onDeleteTask(taskId, listTaskWasIn, listTaskWasInName) {
        setTaskListLoaded(false);

        TaskService.deleteTask(taskList.id, taskId).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setTaskList(response.data);
                deleteTaskFromList(taskId, listTaskWasIn, listTaskWasInName);
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
                                        // WE NEED TO ADD THE PARAMETER FOR LIST THE TASK WAS ON FOR ON SET COMPLETE AND ON DELETE AND STUFF FOR EVERYTHING
                                        return (
                                            <Task
                                                task={task}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id,
                                                        pinnedTaskList,
                                                        "pinned"
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(
                                                        task.id,
                                                        pinnedTaskList,
                                                        "pinned"
                                                    )
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
                                                task={task}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id,
                                                        overDueTaskList,
                                                        "overdue"
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(
                                                        task.id,
                                                        overDueTaskList,
                                                        "overdue"
                                                    )
                                                }
                                                key={i}
                                                className="overdue"
                                            />
                                        );
                                    })}
                                {taskListLoaded &&
                                    taskList.tasks &&
                                    priorityTaskList.map((task, i) => {
                                        return (
                                            <Task
                                                task={task}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id,
                                                        priorityTaskList,
                                                        "priority"
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(
                                                        task.id,
                                                        priorityTaskList,
                                                        "priority"
                                                    )
                                                }
                                                key={i}
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
                                                task={task}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id,
                                                        shortTermTaskList,
                                                        "short"
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(
                                                        task.id,
                                                        shortTermTaskList,
                                                        "short"
                                                    )
                                                }
                                                key={i}
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
                                                task={task}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id,
                                                        longTermTaskList,
                                                        "long"
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(
                                                        task.id,
                                                        longTermTaskList,
                                                        "long"
                                                    )
                                                }
                                                key={i}
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
                                                task={task}
                                                onSetComplete={(data) =>
                                                    onSetTaskComplete(
                                                        data,
                                                        task.id,
                                                        completedTaskList,
                                                        "completed"
                                                    )
                                                }
                                                onDelete={() =>
                                                    onDeleteTask(
                                                        task.id,
                                                        completedTaskList,
                                                        "completed"
                                                    )
                                                }
                                                key={i}
                                                className="completed"
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
