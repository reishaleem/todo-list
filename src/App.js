import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import TaskList from "./components/TaskList";
import { Container } from "react-bootstrap";

function App() {
    return (
        <Container
            style={{ height: "100vh" }}
            className="d-flex align-items-center"
        >
            <div className="d-inline mx-auto">
                <h1 className="text-center">Todo</h1>
                <TaskList />
            </div>
        </Container>
    );
}

export default App;
