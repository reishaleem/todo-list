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

export default ({ task, onSetComplete, onDelete }) => {
    const { register, handleSubmit, errors } = useForm();

    const [checked, setChecked] = useState(task.complete);
    const [pinned, setPinned] = useState(task.pinned);
    const [showExtras, setShowExtras] = useState(false);
    // trying to figure out what to do about hover. Just got it working where when you hover over a value,
    //its extras will show up. Next we can add being pinned by clicking the pin, and the pin will then always show up.
    //Will need to configure back end too
    // then we can figure out about formatting the whole spacing, then lastly, we can see about fading a task out, rather than abruptly going to Completed or Deleted
    return (
        <ListGroup.Item
            className="border-0 d-flex"
            onMouseEnter={() => setShowExtras(true)}
            onMouseLeave={() => setShowExtras(false)}
        >
            <ButtonGroup toggle className="mb-2">
                <ToggleButton
                    type="checkbox"
                    variant="outline-dark"
                    checked={checked}
                    value="1"
                    onChange={(e) => setChecked(e.currentTarget.checked)}
                    onClick={onSetComplete}
                    className="check-box"
                    style={{
                        width: "35px",
                        height: "35px",
                        lineHeight: "35px",
                        fontSize: "0.9rem",
                        textAlign: "center",
                        padding: "0",
                    }}
                ></ToggleButton>
            </ButtonGroup>

            <p className={`px-2 ${task.complete ? "complete " : ""}`}>
                {task.task + " | " + task.dueDate}
            </p>

            {showExtras && (
                <>
                    <span className="clickable-icon mr-2">
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
                    <span className="clickable-icon" onClick={onDelete}>
                        <FontAwesomeIcon
                            icon="trash-alt"
                            size="lg"
                            pull="right"
                        ></FontAwesomeIcon>
                    </span>
                </>
            )}
        </ListGroup.Item>
    );
};
