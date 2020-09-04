import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    ListGroup,
    Button,
    ToggleButton,
    ButtonGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";

export default ({ task, onSetComplete, onDelete, onSetPinned }) => {
    const { register, handleSubmit, errors } = useForm();

    const [checked, setChecked] = useState(task.complete);
    const [pinned, setPinned] = useState(task.pinned);
    const [showExtras, setShowExtras] = useState(false);

    // we can see about fading a task out, rather than abruptly going to Completed or Deleted
    // also need to deal with the settings (ie editing the task name and due date. Maybe we just do some sort of onDoubleClick?)
    // also need to add pagination
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

            <p className={`px-3 my-0 ${task.complete ? "complete " : ""}`}>
                {task.task + " "}
                <br />
                <small className="text-muted">
                    {moment(task.dueDate).format("MMM Do")}
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
