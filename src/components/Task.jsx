import React, { useState } from "react";
import { ListGroup, ToggleButton, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";

export default ({ task, onSetComplete, onDelete, onSetPinned }) => {
    const [checked, setChecked] = useState(task.complete);
    const [showExtras, setShowExtras] = useState(false);

    // we can see about fading a task out, rather than abruptly going to Completed or Deleted
    // also need to deal with the settings (ie editing the task name and due date. Maybe we just do some sort of onDoubleClick?)
    // also need to add pagination

    const overdue =
        !task.complete && moment(task.dueDate).isBefore(moment(), "day");
    return (
        <ListGroup.Item
            className="border-0 d-flex align-items-center"
            onMouseEnter={() => setShowExtras(true)}
            onMouseLeave={() => setShowExtras(false)}
        >
            <ButtonGroup toggle>
                <ToggleButton
                    type="checkbox"
                    variant="outline-dark"
                    checked={checked}
                    value="1"
                    onChange={(e) => setChecked(e.currentTarget.checked)}
                    onClick={onSetComplete}
                    className="check-box"
                    style={{
                        width: "25px",
                        height: "25px",
                        lineHeight: "25px",
                        fontSize: "0.9rem",
                        textAlign: "center",
                        padding: "0",
                    }}
                ></ToggleButton>
            </ButtonGroup>

            <p
                className={`px-3 my-0 ${task.complete ? "complete " : ""}${
                    overdue ? "overdue " : ""
                }`}
            >
                {task.task + " "}
                <br />
                <small className="text-muted">
                    {task.dueDate
                        ? moment(task.dueDate).format("MMM Do")
                        : "No due date"}
                </small>
            </p>

            <div className="spacer"></div>

            {task.pinned ? (
                <>
                    <span className="clickable-icon mr-2" onClick={onSetPinned}>
                        <FontAwesomeIcon
                            icon="thumbtack"
                            size="lg"
                        ></FontAwesomeIcon>
                    </span>
                    {showExtras && (
                        <>
                            <span className="clickable-icon mr-2">
                                <FontAwesomeIcon
                                    icon="cog"
                                    size="lg"
                                    pull="right"
                                ></FontAwesomeIcon>
                            </span>
                            <span className="clickable-icon" onClick={onDelete}>
                                <FontAwesomeIcon
                                    icon="trash-alt"
                                    size="lg"
                                    pull="right"
                                ></FontAwesomeIcon>
                            </span>
                        </>
                    )}
                </>
            ) : (
                <>
                    {showExtras && (
                        <>
                            {task.complete ? (
                                <>
                                    <span className="clickable-icon mr-2">
                                        <FontAwesomeIcon
                                            icon="cog"
                                            size="lg"
                                            pull="right"
                                        ></FontAwesomeIcon>
                                    </span>
                                    <span
                                        className="clickable-icon"
                                        onClick={onDelete}
                                    >
                                        <FontAwesomeIcon
                                            icon="trash-alt"
                                            size="lg"
                                            pull="right"
                                        ></FontAwesomeIcon>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span
                                        className="clickable-icon mr-2"
                                        onClick={onSetPinned}
                                    >
                                        <FontAwesomeIcon
                                            icon="thumbtack"
                                            size="lg"
                                            pull="right"
                                        ></FontAwesomeIcon>
                                    </span>
                                    <span className="clickable-icon mr-2">
                                        <FontAwesomeIcon
                                            icon="cog"
                                            size="lg"
                                            pull="right"
                                        ></FontAwesomeIcon>
                                    </span>
                                    <span
                                        className="clickable-icon"
                                        onClick={onDelete}
                                    >
                                        <FontAwesomeIcon
                                            icon="trash-alt"
                                            size="lg"
                                            pull="right"
                                        ></FontAwesomeIcon>
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </ListGroup.Item>
    );
};
