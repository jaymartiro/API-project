const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (in production, use a database)
let tasks = [
  {
    id: '1',
    title: 'Complete Project Proposal',
    description: 'Write and submit the project proposal document',
    status: 'completed',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    id: '2',
    title: 'Review Code Changes',
    description: 'Review pull requests and provide feedback',
    status: 'in-progress',
    createdAt: new Date('2024-01-18').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString()
  },
  {
    id: '3',
    title: 'Plan Team Meeting',
    description: 'Schedule and prepare agenda for weekly team meeting',
    status: 'pending',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  }
];

// Helper function to find task by ID
const findTaskById = (id) => tasks.find(task => task.id === id);

// Helper function to validate task data
const validateTask = (taskData) => {
  const { title, description, status } = taskData;
  const validStatuses = ['pending', 'in-progress', 'completed'];
  
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Description is required' };
  }
  
  if (status && !validStatuses.includes(status)) {
    return { valid: false, error: 'Status must be one of: pending, in-progress, completed' };
  }
  
  return { valid: true };
};

// Routes

// GET /api/tasks - Get all tasks with optional filtering and search
app.get('/api/tasks', (req, res) => {
  try {
    let filteredTasks = [...tasks];
    
    // Filter by status
    if (req.query.status) {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      if (validStatuses.includes(req.query.status)) {
        filteredTasks = filteredTasks.filter(task => task.status === req.query.status);
      }
    }
    
    // Search by keyword (title or description)
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by creation date (newest first)
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: filteredTasks,
      total: filteredTasks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/tasks/:id - Get a specific task
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = findTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
  try {
    const validation = validateTask(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    const newTask = {
      id: uuidv4(),
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    
    res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/tasks/:id - Update a task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const task = findTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const validation = validateTask(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    // Update task fields
    task.title = req.body.title.trim();
    task.description = req.body.description.trim();
    if (req.body.status) {
      task.status = req.body.status;
    }
    task.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/tasks/:id/status - Update only the status of a task
app.patch('/api/tasks/:id/status', (req, res) => {
  try {
    const task = findTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'completed'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be one of: pending, in-progress, completed'
      });
    }
    
    task.status = status;
    task.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: task,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const taskIndex = tasks.findIndex(task => task.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedTask,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/status - Get available statuses
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: ['pending', 'in-progress', 'completed']
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Task Manager API server running on port ${PORT}`);
  console.log(`📖 API Documentation:`);
  console.log(`   GET    /api/tasks - Get all tasks (with filtering & search)`);
  console.log(`   GET    /api/tasks/:id - Get specific task`);
  console.log(`   POST   /api/tasks - Create new task`);
  console.log(`   PUT    /api/tasks/:id - Update task`);
  console.log(`   PATCH  /api/tasks/:id/status - Update task status`);
  console.log(`   DELETE /api/tasks/:id - Delete task`);
  console.log(`   GET    /api/status - Get available statuses`);
  console.log(`   GET    /api/health - Health check`);
});
