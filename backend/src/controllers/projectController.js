const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 });

    const projectsWithCounts = await Promise.all(projects.map(async (p) => {
      const [taskCount, completedCount] = await Promise.all([
        Task.countDocuments({ project: p._id }),
        Task.countDocuments({ project: p._id, status: 'done' })
      ]);
      return { ...p.toObject(), taskCount, completedCount };
    }));

    res.json({ projects: projectsWithCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });
    await project.populate('owner', 'name email');
    await project.populate('members.user', 'name email');
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const [taskCount, completedCount] = await Promise.all([
      Task.countDocuments({ project: req.project._id }),
      Task.countDocuments({ project: req.project._id, status: 'done' })
    ]);
    res.json({ project: { ...req.project.toObject(), taskCount, completedCount }, memberRole: req.memberRole });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status },
      { new: true, runValidators: true }
    ).populate('owner', 'name email').populate('members.user', 'name email');
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found with that email' });

    const project = req.project;
    const alreadyMember = project.members.find(
      m => m.user._id.toString() === user._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: user._id, role });
    await project.save();
    await project.populate('members.user', 'name email');
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = req.project;
    if (project.owner._id.toString() === userId)
      return res.status(400).json({ message: 'Cannot remove the project owner' });

    project.members = project.members.filter(
      m => m.user._id.toString() !== userId
    );
    await project.save();
    res.json({ message: 'Member removed', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['admin', 'member'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const project = req.project;
    const member = project.members.find(
      m => m.user._id.toString() === userId
    );
    if (!member) return res.status(404).json({ message: 'Member not found' });
    member.role = role;
    await project.save();
    await project.populate('members.user', 'name email');
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects, createProject, getProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole
};
