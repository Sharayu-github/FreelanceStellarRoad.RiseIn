import express from 'express';
import Project from '../models/Project';

const router = express.Router();

// Get all projects with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, client, freelancer, limit = 10, offset = 0 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (freelancer) filter.freelancer = freelancer;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ id: Number(req.params.id) });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const { title, description, amount, deadline, skills, notes } = req.body;

    // Generate project ID (in real app, this would come from blockchain)
    const lastProject = await Project.findOne().sort({ id: -1 });
    const newId = lastProject ? lastProject.id + 1 : 1;

    // Generate meta hash (simplified)
    const metaHash = Buffer.from(JSON.stringify({ title, description })).toString('base64');

    const project = new Project({
      id: newId,
      title,
      description,
      amount,
      deadline: new Date(deadline),
      skills: skills || [],
      notes,
      metaHash,
      client: 'temp-client' // This would come from authentication
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

export default router;