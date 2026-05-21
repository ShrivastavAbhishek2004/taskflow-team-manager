const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const { title, description, assignee, status, priority, dueDate, tags } = req.body;
    const task = await Task.create({
      title, description, assignee: assignee || null, status, priority,
      dueDate: dueDate || null, tags: tags || [],
      project: req.params.projectId,
      createdBy: req.user._id
    });
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, assignee, status, priority, dueDate, tags } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (tags !== undefined) task.tags = tags;

    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    // Projects user is a member of
    const projects = await Project.find({ 'members.user': userId });
    const projectIds = projects.map(p => p._id);

    const [
      myTasks,
      overdueTasks,
      completedThisWeek,
      totalTasks
    ] = await Promise.all([
      Task.find({ project: { $in: projectIds }, assignee: userId, status: { $ne: 'done' } })
        .populate('project', 'name')
        .populate('assignee', 'name email')
        .sort({ dueDate: 1 })
        .limit(10),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: now },
        status: { $ne: 'done' }
      }),
      Task.countDocuments({
        project: { $in: projectIds },
        status: 'done',
        updatedAt: { $gte: weekStart }
      }),
      Task.countDocuments({ project: { $in: projectIds } })
    ]);

    const dueTodayEnd = new Date(now);
    dueTodayEnd.setHours(23, 59, 59, 999);
    const dueTodayStart = new Date(now);
    dueTodayStart.setHours(0, 0, 0, 0);
    const dueToday = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $gte: dueTodayStart, $lte: dueTodayEnd },
      status: { $ne: 'done' }
    });

    res.json({
      stats: {
        totalProjects: projects.length,
        totalTasks,
        dueToday,
        overdueTasks,
        completedThisWeek
      },
      myTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjectTasks, createTask, getTask, updateTask, deleteTask, getDashboard };
