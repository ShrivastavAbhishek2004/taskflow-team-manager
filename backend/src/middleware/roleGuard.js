const Project = require('../models/Project');

const requireMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(
      m => m.user._id.toString() === req.user._id.toString()
    );
    if (!member) return res.status(403).json({ message: 'Access denied: not a project member' });

    req.project = project;
    req.memberRole = member.role;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(
      m => m.user._id.toString() === req.user._id.toString()
    );
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: admin only' });
    }

    req.project = project;
    req.memberRole = 'admin';
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { requireMember, requireAdmin };
