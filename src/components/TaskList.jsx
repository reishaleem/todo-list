import React, { useState, useEffect } from "react";
import TaskService from "../service/tasklist.service";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/tab";
import Badge from "@material-ui/core/Badge";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useForm, Controller } from "react-hook-form";
import Task from "./Task";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Pagination from "react-js-pagination";

export default () => {
    const { register, handleSubmit, control, errors } = useForm();

    const [newTaskName, setNewTaskName] = useState("");

    const [taskList, setTaskList] = useState({}); // using a default value for now, until we link up backend
    const [taskListLoading, setTaskListLoading] = useState(true);
    const [taskListLoaded, setTaskListLoaded] = useState(false);
    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState("");

    const [priorityTaskList, setPriorityTaskList] = useState([]);

    const [shortTermTaskList, setShortTermTaskList] = useState([]);
    const [longTermTaskList, setLongTermTaskList] = useState([]);
    const [completedTaskList, setCompletedTaskList] = useState([]);

    useEffect(() => {
        TaskService.getUniverseTaskList(4).then((response) => {
            setCategorizedLists(response.data);
            setTaskList(response.data);
            setTaskListLoaded(true);
            setTaskListLoading(false);
        });
    }, []);

    function setCategorizedLists(tasks) {
        tasks.tasks.forEach((task) => {
            if (task.complete) {
                setCompletedTaskList((oldList) => [...oldList, task]);
            } else if (
                task.pinned ||
                moment(task.dueDate).isBefore(moment().add(7, "days"), "day")
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

    // this is not consistent with equals. Just to note.
    function compareTaskDates(task1, task2) {
        const date1 = task1.dueDate;
        const date2 = task2.dueDate;

        let comparison = 0;
        if (moment(task1.dueDate).isBefore(moment(task2.dueDate), "day")) {
            comparison = -1;
        } else if (
            moment(task1.dueDate).isAfter(moment(task2.dueDate), "day")
        ) {
            comparison = 1;
        }

        return comparison;
    }

    function sortPriorityList(priorityList) {
        const pinnedList = priorityList.filter((task) => task.pinned);
        const nonPinnedList = priorityList.filter((task) => !task.pinned);
        nonPinnedList.sort(compareTaskDates);
        return pinnedList.concat(nonPinnedList);
    }

    // returns the filtered old list, without the task anymore
    // this is only for already existing tasks
    function reCategorizeSingleTask(task, listTaskWasIn, listTaskWasInName) {
        const newList = listTaskWasIn.filter((t) => t.id !== task.id);
        if (listTaskWasInName === "priority") {
            setPriorityTaskList(newList);
        } else if (listTaskWasInName === "short") {
            setShortTermTaskList(newList);
        } else if (listTaskWasInName === "long") {
            setLongTermTaskList(newList);
        } else {
            setCompletedTaskList(newList);
        }

        console.log(newList);
        if (task.complete) {
            setCompletedTaskList((oldList) => [...oldList, task]);
        } else if (
            task.pinned ||
            moment(task.dueDate).isBefore(moment().add(7, "days"), "day")
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
        if (task.complete) {
            setCompletedTaskList((oldList) => [...oldList, task]);
        } else if (
            task.pinned ||
            moment(task.dueDate).isBefore(moment().add(7, "days"), "day")
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

        if (listTaskWasInName === "priority") {
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
        setTaskListLoading(true);
        setTaskListLoaded(false);
        setNewTaskName("");

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

        setTaskListLoaded(true);
        setTaskListLoading(false);
    }

    // we would call the task service. We have the task list id, with taskList, then we send the id of the specific task here
    // the question here is whether this would be the delete or if it would be the set complete....ie if we want a 'completed'
    // section separate from the deleted
    function onSetTaskComplete(data, taskId, listTaskWasIn, listTaskWasInName) {
        setTaskListLoading(true);
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
                setTaskListLoading(false);
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

    function onSetTaskPinned(
        data,
        taskId,
        listTaskWasIn,
        listTaskWasInName,
        task
    ) {
        setTaskListLoading(true);
        setTaskListLoaded(false);

        TaskService.toggleTaskPinned(taskList.id, taskId).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setTaskList(response.data);
                //setCategorizedLists(response.data); // can't do this, or we just add a bunch of duplicates. Need to implement a method where it finds the list that the task WAS on, removes it, then adds it to its new list. It's similar to the one we have, but it takes just ONE task, not a whole list
                // should *maybe* add a check on this filter to ensure it only has length one, even though we know for sure it will be true?
                console.log(task);
                reCategorizeSingleTask(
                    response.data.tasks.filter((task) => task.id === taskId)[0],
                    listTaskWasIn,
                    listTaskWasInName
                );
                console.log(response);
                setTaskListLoaded(true);
                setTaskListLoading(false);
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
        setTaskListLoading(true);
        setTaskListLoaded(false);

        TaskService.deleteTask(taskList.id, taskId).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setTaskList(response.data);
                deleteTaskFromList(taskId, listTaskWasIn, listTaskWasInName);
                console.log(response);
                setTaskListLoaded(true);
                setTaskListLoading(false);
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

    const [priorityOffset, setPriorityOffset] = useState(0);
    const [priorityActivePageNum, setPriorityActivePageNum] = useState(1);

    const [shortOffset, setShortOffset] = useState(0);
    const [shortActivePageNum, setShortActivePageNum] = useState(1);

    const [longOffset, setLongOffset] = useState(0);
    const [longActivePageNum, setLongActivePageNum] = useState(1);

    const [completedOffset, setCompletedOffset] = useState(0);
    const [completedActivePageNum, setCompletedActivePageNum] = useState(1);

    function handlePageChange(pageNumber, offset) {
        setTaskListLoaded(false);
        const newOffset = (pageNumber - 1) * 5;
        if (offset == "priority") {
            setPriorityActivePageNum(pageNumber);
            setPriorityOffset(newOffset);
        } else if (offset == "short") {
            setShortActivePageNum(pageNumber);
            setShortOffset(newOffset);
        } else if (offset == "long") {
            setLongActivePageNum(pageNumber);
            setLongOffset(newOffset);
        } else {
            setCompletedActivePageNum(pageNumber);
            setCompletedOffset(newOffset);
        }

        setTaskListLoaded(true);
    }

    return (
        <Tab.Container
            id="todo-pills"
            defaultActiveKey="priority"
            className="align-middle"
        >
            <Card style={{ width: "30rem" }} className="align-middle mx-auto">
                <Card.Header>
                    <Nav variant="pills">
                        <Nav.Item className="py-1 px-2">
                            <Badge
                                badgeContent={priorityTaskList.length}
                                color="secondary"
                                max={9}
                            >
                                <Nav.Link
                                    eventKey="priority"
                                    style={{
                                        fontSize: ".8rem",
                                        border: "1px solid black",
                                        lineHeight: "1",
                                    }}
                                >
                                    Priority
                                </Nav.Link>
                            </Badge>
                        </Nav.Item>
                        <Nav.Item className="py-1 px-2">
                            <Badge
                                badgeContent={shortTermTaskList.length}
                                color="secondary"
                                max={9}
                            >
                                <Nav.Link
                                    eventKey="short"
                                    style={{
                                        fontSize: ".8rem",
                                        border: "1px solid black",
                                        lineHeight: "1",
                                    }}
                                >
                                    Short Term
                                </Nav.Link>
                            </Badge>
                        </Nav.Item>
                        <Nav.Item className="py-1 px-2">
                            <Badge
                                badgeContent={longTermTaskList.length}
                                max={9}
                                color="secondary"
                            >
                                <Nav.Link
                                    eventKey="long"
                                    style={{
                                        fontSize: ".8rem",
                                        border: "1px solid black",
                                        lineHeight: "1",
                                    }}
                                >
                                    Long Term
                                </Nav.Link>
                            </Badge>
                        </Nav.Item>
                        <Nav.Item className="py-1 px-2">
                            <Badge
                                badgeContent={completedTaskList.length}
                                color="secondary"
                                max={9}
                            >
                                <Nav.Link
                                    eventKey="completed"
                                    style={{
                                        fontSize: ".8rem",
                                        border: "1px solid black",
                                        lineHeight: "1",
                                    }}
                                >
                                    Completed
                                </Nav.Link>
                            </Badge>
                        </Nav.Item>
                    </Nav>
                </Card.Header>

                <Card.Body>
                    {taskListLoading && (
                        <div className="text-center">
                            <CircularProgress />
                        </div>
                    )}
                    {taskListLoaded && (
                        <>
                            <Form
                                onSubmit={handleSubmit(onCreateNewTask)}
                                className="py-1"
                            >
                                <Form.Row>
                                    <Col md={8}>
                                        <Form.Control
                                            type="text"
                                            name="newTaskName"
                                            placeholder="add new task"
                                            maxLength="50"
                                            value={newTaskName}
                                            onChange={onChangeNewTaskName}
                                            ref={register({
                                                required: true,
                                                maxLength: 50,
                                            })}
                                        />
                                        {errors.newTaskName && (
                                            <small>
                                                Must be unempty and less than 50
                                                characters
                                            </small>
                                        )}
                                    </Col>
                                    <Col md={3}>
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
                                                    dateFormat="MMM/dd"
                                                    className="form-control"
                                                    isClearable
                                                    placeholderText="due"
                                                />
                                            )}
                                        />
                                    </Col>
                                    <Col md={1}>
                                        <Button
                                            variant="outline-dark"
                                            type="submit"
                                            style={{
                                                padding: ".375rem .6rem",
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon="plus"
                                                size="sm"
                                            ></FontAwesomeIcon>
                                        </Button>
                                    </Col>
                                </Form.Row>
                            </Form>
                            <Tab.Content>
                                <Tab.Pane eventKey="priority">
                                    {taskList.tasks && (
                                        <>
                                            {sortPriorityList(priorityTaskList)
                                                .slice(
                                                    priorityOffset,
                                                    priorityOffset + 5
                                                )
                                                .map((task, i) => {
                                                    return (
                                                        <Task
                                                            task={task}
                                                            onSetComplete={(
                                                                data
                                                            ) =>
                                                                onSetTaskComplete(
                                                                    data,
                                                                    task.id,
                                                                    priorityTaskList,
                                                                    "priority"
                                                                )
                                                            }
                                                            onSetPinned={(
                                                                data
                                                            ) =>
                                                                onSetTaskPinned(
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

                                            <Pagination
                                                totalItemsCount={
                                                    priorityTaskList.length
                                                }
                                                activePage={
                                                    priorityActivePageNum
                                                }
                                                onChange={(pageNumber) =>
                                                    handlePageChange(
                                                        pageNumber,
                                                        "priority"
                                                    )
                                                }
                                                itemsCountPerPage={5}
                                                itemClass="page-item"
                                                linkClass="page-link"
                                                pageRangeDisplayed={1}
                                                hideFirstLastPages={true}
                                                innerClass="pagination justify-content-end"
                                            />
                                        </>
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey="short">
                                    {taskList.tasks && (
                                        <>
                                            {shortTermTaskList
                                                .sort(compareTaskDates)
                                                .slice(
                                                    shortOffset,
                                                    shortOffset + 5
                                                )
                                                .map((task, i) => {
                                                    return (
                                                        <Task
                                                            task={task}
                                                            onSetComplete={(
                                                                data
                                                            ) =>
                                                                onSetTaskComplete(
                                                                    data,
                                                                    task.id,
                                                                    shortTermTaskList,
                                                                    "short"
                                                                )
                                                            }
                                                            onSetPinned={(
                                                                data
                                                            ) =>
                                                                onSetTaskPinned(
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
                                            <Pagination
                                                totalItemsCount={
                                                    shortTermTaskList.length
                                                }
                                                activePage={shortActivePageNum}
                                                onChange={(pageNumber) =>
                                                    handlePageChange(
                                                        pageNumber,
                                                        "short"
                                                    )
                                                }
                                                itemsCountPerPage={5}
                                                itemClass="page-item"
                                                linkClass="page-link"
                                                pageRangeDisplayed={1}
                                                hideFirstLastPages={true}
                                                innerClass="pagination justify-content-end"
                                            />
                                        </>
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey="long">
                                    {taskList.tasks && (
                                        <>
                                            {longTermTaskList
                                                .sort(compareTaskDates)
                                                .slice(
                                                    longOffset,
                                                    longOffset + 5
                                                )
                                                .map((task, i) => {
                                                    return (
                                                        <Task
                                                            task={task}
                                                            onSetComplete={(
                                                                data
                                                            ) =>
                                                                onSetTaskComplete(
                                                                    data,
                                                                    task.id,
                                                                    longTermTaskList,
                                                                    "long"
                                                                )
                                                            }
                                                            onSetPinned={(
                                                                data
                                                            ) =>
                                                                onSetTaskPinned(
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
                                            <Pagination
                                                totalItemsCount={
                                                    longTermTaskList.length
                                                }
                                                activePage={longActivePageNum}
                                                onChange={(pageNumber) =>
                                                    handlePageChange(
                                                        pageNumber,
                                                        "long"
                                                    )
                                                }
                                                itemsCountPerPage={5}
                                                itemClass="page-item"
                                                linkClass="page-link"
                                                pageRangeDisplayed={1}
                                                hideFirstLastPages={true}
                                                innerClass="pagination justify-content-end"
                                            />
                                        </>
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey="completed">
                                    {taskList.tasks && (
                                        <>
                                            {completedTaskList
                                                .sort(compareTaskDates)
                                                .slice(
                                                    completedOffset,
                                                    completedOffset + 5
                                                )
                                                .map((task, i) => {
                                                    return (
                                                        <Task
                                                            task={task}
                                                            onSetComplete={(
                                                                data
                                                            ) =>
                                                                onSetTaskComplete(
                                                                    data,
                                                                    task.id,
                                                                    completedTaskList,
                                                                    "completed"
                                                                )
                                                            }
                                                            onSetPinned={(
                                                                data
                                                            ) =>
                                                                onSetTaskPinned(
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
                                            <Pagination
                                                totalItemsCount={
                                                    completedTaskList.length
                                                }
                                                activePage={
                                                    completedActivePageNum
                                                }
                                                onChange={(pageNumber) =>
                                                    handlePageChange(
                                                        pageNumber,
                                                        "completed"
                                                    )
                                                }
                                                itemsCountPerPage={5}
                                                itemClass="page-item"
                                                linkClass="page-link"
                                                pageRangeDisplayed={1}
                                                hideFirstLastPages={true}
                                                innerClass="pagination justify-content-end"
                                            />
                                        </>
                                    )}
                                </Tab.Pane>
                            </Tab.Content>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Tab.Container>
    );
};
