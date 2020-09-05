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
import Badge from "@material-ui/core/Badge";
import { useForm, Controller } from "react-hook-form";
import Task from "./Task";
import DatePicker from "./DatePicker";
import ReactDatePicker from "react-datepicker";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Pagination from "react-js-pagination";
import { fas } from "@fortawesome/free-solid-svg-icons";

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

    const [priorityTaskList, setPriorityTaskList] = useState([]);

    const [shortTermTaskList, setShortTermTaskList] = useState([]);
    const [longTermTaskList, setLongTermTaskList] = useState([]);
    const [completedTaskList, setCompletedTaskList] = useState([]);

    useEffect(() => {
        TaskService.getUniverseTaskList(4).then((response) => {
            setCategorizedLists(response.data);
            setTaskList(response.data);
            setTaskListLoading(false);
            setTaskListLoaded(true);
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
    // TODO
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
    // TODO
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

    function onSetTaskPinned(
        data,
        taskId,
        listTaskWasIn,
        listTaskWasInName,
        task
    ) {
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
                    <Form onSubmit={handleSubmit(onCreateNewTask)}>
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
                                    <Form.Text>
                                        This field is required
                                    </Form.Text>
                                )}
                            </Col>
                            <Col md={3}>
                                <Controller
                                    control={control}
                                    name="newTaskDueDate"
                                    render={({ onChange, onBlur, value }) => (
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
                            {taskListLoaded && taskList.tasks && (
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
                                                    onSetComplete={(data) =>
                                                        onSetTaskComplete(
                                                            data,
                                                            task.id,
                                                            priorityTaskList,
                                                            "priority"
                                                        )
                                                    }
                                                    onSetPinned={(data) =>
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

                                    <small className="text-muted">{`Showing ${
                                        priorityOffset + 1
                                    }-${priorityOffset + 5} of ${
                                        priorityTaskList.length
                                    }`}</small>
                                    <Pagination
                                        totalItemsCount={
                                            priorityTaskList.length
                                        }
                                        activePage={priorityActivePageNum}
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
                            {taskListLoaded && taskList.tasks && (
                                <>
                                    {shortTermTaskList
                                        .sort(compareTaskDates)
                                        .slice(shortOffset, shortOffset + 5)
                                        .map((task, i) => {
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
                                                    onSetPinned={(data) =>
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
                            {taskListLoaded && taskList.tasks && (
                                <>
                                    {longTermTaskList
                                        .sort(compareTaskDates)
                                        .slice(longOffset, longOffset + 5)
                                        .map((task, i) => {
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
                                                    onSetPinned={(data) =>
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
                                            handlePageChange(pageNumber, "long")
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
                            {taskListLoaded && taskList.tasks && (
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
                                                    onSetComplete={(data) =>
                                                        onSetTaskComplete(
                                                            data,
                                                            task.id,
                                                            completedTaskList,
                                                            "completed"
                                                        )
                                                    }
                                                    onSetPinned={(data) =>
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
                                        activePage={completedActivePageNum}
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
                </Card.Body>
            </Card>
        </Tab.Container>
    );
};
