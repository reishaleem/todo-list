import React from "react";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import TaskList from "./components/TaskList";
import { Card, Container } from "react-bootstrap";
import useScript from "./hooks/useScript";

function App() {
    return (
        <Container>
            <TaskList />
        </Container>
    );
}

export default App;
