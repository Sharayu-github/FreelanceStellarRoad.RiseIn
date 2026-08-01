import express from 'express';

const router = express.Router();

// Mock reputation data for demonstration
const mockReputations: { [key: string]: any } = {
  'GABC123DEFG456HIJKLMNOP789QRSTUVWXYZ123456789ABCDEFGHIJK': {
    totalProjects: 5,
    projectsAsClient: 3,
    projectsAsFreelancer: 2,
    successfulCompletions: 4,
    successRate: 80
  },
  'GDEF456GHI789JKLMNOPQR123STUVWXYZ456789ABCDEFGHIJK123LMN': {
    totalProjects: 12,
    projectsAsClient: 8,
    projectsAsFreelancer: 4,
    successfulCompletions: 11,
    successRate: 92
  }
};

// Get reputation score by address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const reputation = mockReputations[address] || {
      totalProjects: 0,
      projectsAsClient: 0,
      projectsAsFreelancer: 0,
      successfulCompletions: 0,
      successRate: 0
    };

    res.json(reputation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reputation' });
  }
});

// Get top freelancers
router.get('/top-freelancers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topFreelancers = Object.entries(mockReputations)
      .filter(([_, score]) => score.projectsAsFreelancer > 0)
      .sort(([_, a], [__, b]) => b.successRate - a.successRate)
      .slice(0, Number(limit))
      .map(([address, score]) => ({ address, score }));

    res.json(topFreelancers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top freelancers' });
  }
});

export default router;