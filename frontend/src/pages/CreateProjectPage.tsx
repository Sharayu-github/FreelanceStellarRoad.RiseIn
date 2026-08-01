import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { stellarService } from '../services/stellarService';
import { apiService } from '../services/apiService';
import { Calendar, DollarSign, FileText, AlertCircle, Loader2 } from 'lucide-react';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: '',
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.amount || !formData.deadline) {
        throw new Error('Please fill in all required fields');
      }

      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const deadline = new Date(formData.deadline);
      if (deadline <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      // First create metadata in backend
      const projectMetadata = await apiService.createProject(formData);
      
      // Convert deadline to ledger number (simplified - in real app, calculate based on Stellar ledger time)
      const currentTime = Math.floor(Date.now() / 1000);
      const deadlineTime = Math.floor(deadline.getTime() / 1000);
      const ledgerDeadline = Math.floor((deadlineTime - currentTime) / 5) + 1000000; // Approximate ledger calculation

      // Create project on blockchain
      const result = await stellarService.createProject(
        formData.title,
        projectMetadata.metaHash,
        formData.amount,
        'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAUJKENB2CO', // Native XLM token
        ledgerDeadline
      );

      console.log('Project created on blockchain:', result);

      // Navigate to project list or dashboard
      navigate('/dashboard', {
        state: { message: 'Project created successfully!' }
      });

    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wallet Connection Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please connect your Freighter wallet to create a project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Project
        </h1>
        <p className="text-gray-600">
          Post your project with secure escrow and find talented freelancers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Project Details
          </h2>

          {/* Title */}
          <div className="mb-6">
            <label className="label">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="e.g., Build a React Dashboard"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="label">
              Project Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="input w-full resize-none"
              placeholder="Provide detailed description of your project requirements, deliverables, and any specific instructions..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific about your requirements to attract the right freelancers
            </p>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <label className="label">
              Required Skills
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="input flex-1"
                placeholder="e.g., React, TypeScript, Design"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center bg-stellar-100 text-stellar-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-stellar-600 hover:text-stellar-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Budget & Timeline
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label className="label">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Budget Amount (XLM) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This amount will be locked in escrow until project completion
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="label">
                <Calendar className="h-4 w-4 inline mr-1" />
                Project Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="input w-full"
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Funds can be refunded after this date if no work is submitted
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Project...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Create Project & Lock Funds</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          How Project Creation Works
        </h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Your funds will be locked in a secure smart contract escrow</li>
          <li>• Freelancers can browse and accept your project</li>
          <li>• Funds are only released when you approve the completed work</li>
          <li>• You can request a refund after the deadline if no work is submitted</li>
          <li>• Both parties' reputation will be updated upon successful completion</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateProjectPage;