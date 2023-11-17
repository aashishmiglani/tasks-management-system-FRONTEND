import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const TaskTable = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState({});
  const [editTaskDetails, setEditTaskDetails] = useState({
    id: '',
    title: '',
    description: '',
  });
  const [newTaskDetails, setNewTaskDetails] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    // Fetch tasks from the Django backend when the component mounts
    axios.get('http://127.0.0.1:8000/api/tasks/')
      .then((response) => setTasks(response.data))
      .catch((error) => console.error('Error fetching tasks:', error));
  }, []);

  const handleCheckboxChange = (taskId) => {
    const isSelected = selectedTasks.includes(taskId);

    if (isSelected) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const handleExport = () => {
    // Filter the tasks based on selectedTasks
    const selectedTasksData = tasks.filter(task => selectedTasks.includes(task.id));

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(selectedTasksData);

    // Create a workbook with the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SelectedTasks');

    // Save the file
    XLSX.writeFile(wb, 'selected_tasks.xlsx');
  };

  const handleDelete = (taskId) => {
    // Implement delete logic here
    axios.delete(`http://127.0.0.1:8000/api/tasks/${taskId}/`)
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== taskId));
        setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
      })
      .catch((error) => console.error('Error deleting task:', error));
  };

  const handleUpdate = (taskId) => {
    // Find the task details by ID
    const taskToUpdate = tasks.find((task) => task.id === taskId);

    // Set the edit task details and open the modal
    setEditTaskDetails({
      id: taskToUpdate.id,
      title: taskToUpdate.title,
      description: taskToUpdate.description,
    });
    setShowModal(true);
  };

  const handleEditInputChange = (e) => {
    // Update the edit task details state
    setEditTaskDetails({
      ...editTaskDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = () => {
    // Make a PUT request to update the task on the server
    axios.put(`http://127.0.0.1:8000/api/tasks/${editTaskDetails.id}/`, editTaskDetails)
      .then(() => {
        // Update the tasks state with the updated task
        setTasks(tasks.map((task) => (task.id === editTaskDetails.id ? editTaskDetails : task)));
        setShowModal(false);
      })
      .catch((error) => console.error('Error updating task:', error));
  };

  const handleShowDetails = (task) => {
    setSelectedTaskDetails(task);
    setShowModal(true);
  };

  const handleCreateSubmit = () => {
    // Make a POST request to create a new task
    axios.post('http://127.0.0.1:8000/api/tasks/', newTaskDetails)
      .then((response) => {
        // Add the new task to the tasks state
        setTasks([...tasks, response.data]);
        setShowModal(false);
        // Clear the new task details for the next creation
        setNewTaskDetails({ title: '', description: '' });
      })
      .catch((error) => console.error('Error creating task:', error));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Task List</h1>
      <button className="mb-4 p-2 bg-blue-500 text-white" onClick={handleExport}>
        Export Selected
      </button>
      <button className="mb-4 p-2 ml-3 bg-green-500 text-white" onClick={() => setShowModal(true)}>
        Create New Task
      </button>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-r">Select</th>
            <th className="py-2 px-4 border-b border-r">Title</th>
            <th className="py-2 px-4 border-b border-r">Description</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="py-2 px-4 border-b border-r">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => handleCheckboxChange(task.id)}
                />
              </td>
              <td className="py-2 px-4 border-b border-r">{task.title}</td>
              <td className="py-2 px-4 border-b border-r">{task.description}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="mr-2 p-2 bg-green-500 text-white"
                  onClick={() => handleUpdate(task.id)}
                >
                  Update
                </button>
                <button
                  className="mr-2 p-2 bg-blue-500 text-white"
                  onClick={() => handleShowDetails(task)}
                >
                  Details
                </button>
                <button
                  className="p-2 bg-red-500 text-white"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Task Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg font-bold mb-4">{editTaskDetails.id ? 'Update Task' : 'Create New Task'}</h2>
            <label className="block mb-2">
              Title:
              <input
                type="text"
                name="title"
                value={editTaskDetails.id ? editTaskDetails.title : newTaskDetails.title}
                onChange={editTaskDetails.id ? handleEditInputChange : (e) => setNewTaskDetails({ ...newTaskDetails, title: e.target.value })}
                className="border w-full p-2"
              />
            </label>
            <label className="block mb-4">
              Description:
              <textarea
                name="description"
                value={editTaskDetails.id ? editTaskDetails.description : newTaskDetails.description}
                onChange={editTaskDetails.id ? handleEditInputChange : (e) => setNewTaskDetails({ ...newTaskDetails, description: e.target.value })}
                className="border w-full p-2"
              />
            </label>
            <button
              className="mr-2 p-2 bg-green-500 text-white"
              onClick={editTaskDetails.id ? handleEditSubmit : handleCreateSubmit}
            >
              {editTaskDetails.id ? 'Save' : 'Create'}
            </button>
            <button
              className="p-2 bg-red-500 text-white"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTable;
