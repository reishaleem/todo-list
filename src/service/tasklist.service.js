import axios from "axios";

const API_URL = "http://localhost:8080/tasks";

const getUniverseTaskList = async (id) => {
    return axios.get(API_URL + `/universes/${id}`);
};

const getWikiTaskList = async (id) => {
    return axios.get(API_URL + `/wikis/${id}`);
};

const addTask = (taskListId, task, dueDate, pinned) => {
    return axios.put(API_URL + `/${taskListId}/add`, {
        task,
        dueDate,
        pinned,
    });
};

const toggleTaskComplete = (taskListId, taskId) => {
    return axios.put(API_URL + `/${taskListId}/${taskId}/toggle_complete`);
};

export default {
    getUniverseTaskList,
    getWikiTaskList,
    addTask,
    toggleTaskComplete,
};
