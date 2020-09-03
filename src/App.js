import React from "react";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import TaskList from "./components/TaskList";
import { Card, Container } from "react-bootstrap";

function App() {
    return (
        <Container>
            <Card>
                <Card.Header>TODO</Card.Header>
                <Card.Body>
                    <TaskList />
                </Card.Body>
            </Card>
        </Container>
    );
}

export default App;
