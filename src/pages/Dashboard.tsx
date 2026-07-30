import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiInbox,
  FiTool,
  FiClock,
  FiCheckCircle,
  FiHome,
  FiBriefcase,
  FiLogOut,
  FiX,
  FiCamera,
  FiMapPin,
  FiPhone
} from 'react-icons/fi';
import './Dashboard.css';

type JobStatus = 'assigned' | 'inProgress' | 'awaiting' | 'completed';

export type ProgressUpdate = {
  id: string;
  date: string;
  description: string;
  photos: string[];
};

type Job = {
  id: string;
  title: string;
  date: string;
  status: JobStatus;
  user: {
    name: string;
    mobile: string;
  };
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  progressUpdates?: ProgressUpdate[];
};

const initialJobs: Job[] = [
  { 
    id: 'SR202607247190', 
    title: 'agricture', 
    date: '2026-07-24 | 2 PM - 4 PM', 
    status: 'assigned',
    user: { name: 'Sai Kumar', mobile: '+91 9876543210' },
    location: { address: 'Flat 101, ABC Apt, Hyderabad, Telangana - 500001', lat: 17.432054, lng: 78.374383 },
    progressUpdates: [
      {
        id: 'PRG_A1',
        date: '2026-07-23 11:30:00',
        description: 'Checked the soil quality and discussed the initial fertilizer plan with the owner.',
        photos: []
      }
    ]
  },
  { 
    id: 'SR202607247191', 
    title: 'network', 
    date: 'Started at: 2026-07-14 16:37:41', 
    status: 'inProgress',
    user: { name: 'Priya Sharma', mobile: '+91 9123456789' },
    location: { address: 'H.No 45, Gachibowli, Hyderabad, Telangana - 500032', lat: 17.4401, lng: 78.3489 },
    progressUpdates: [
      {
        id: 'PRG1',
        date: '2026-07-15 10:00:00',
        description: 'Installed the main router, testing signal strength across rooms.',
        photos: ['https://placehold.co/150x150/e2e8f0/64748b?text=Progress+1'] // Added mock photo
      }
    ]
  },
  { 
    id: 'SR202607247192', 
    title: 'network', 
    date: 'Started at: 2026-07-24 11:53:01', 
    status: 'inProgress',
    user: { name: 'Rahul Reddy', mobile: '+91 9988776655' },
    location: { address: 'Plot 12, Jubilee Hills, Hyderabad, Telangana - 500033', lat: 17.4326, lng: 78.4071 }
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<JobStatus>('assigned');
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  // Modals state
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [startWorkPhotos, setStartWorkPhotos] = useState<string[]>([]);
  const [startWorkDescription, setStartWorkDescription] = useState('');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [completeWorkPhotos, setCompleteWorkPhotos] = useState<string[]>([]);

  // Daily Progress state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressDescription, setProgressDescription] = useState('');
  const [progressPhotos, setProgressPhotos] = useState<string[]>([]);

  // Previous Progress state
  const [showPreviousProgressModal, setShowPreviousProgressModal] = useState(false);
  const [selectedProgressUpdates, setSelectedProgressUpdates] = useState<ProgressUpdate[]>([]);

  const handleStartWorkClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setStartWorkPhotos([]);
    setStartWorkDescription('');
    setShowStartModal(true);
  };

  const confirmStartWork = () => {
    if (selectedJobId && startWorkPhotos.length >= 1) {
      setJobs(jobs.map(job => {
        if (job.id === selectedJobId) {
          const now = new Date();
          return {
            ...job,
            status: 'inProgress',
            date: `Started at: ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
          };
        }
        return job;
      }));
      setShowStartModal(false);
      setSelectedJobId(null);
      setStartWorkPhotos([]);
      setStartWorkDescription('');
      setActiveTab('inProgress'); // Automatically switch to "Work In Progress"
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - startWorkPhotos.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);

      const newPhotos = filesToProcess.map(file => URL.createObjectURL(file));
      setStartWorkPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setStartWorkPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteWorkClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setWorkDescription('');
    setCompleteWorkPhotos([]);
    setShowCompleteModal(true);
  };

  const submitCompleteWork = () => {
    if (selectedJobId && completeWorkPhotos.length >= 1) {
      setJobs(jobs.map(job => {
        if (job.id === selectedJobId) {
          return { ...job, status: 'awaiting' };
        }
        return job;
      }));
      setShowCompleteModal(false);
      setSelectedJobId(null);
      setWorkDescription('');
      setCompleteWorkPhotos([]);
      setActiveTab('awaiting'); // Switch to awaiting approval
    }
  };

  const handleCompletePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - completeWorkPhotos.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);

      const newPhotos = filesToProcess.map(file => URL.createObjectURL(file));
      setCompleteWorkPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removeCompletePhoto = (index: number) => {
    setCompleteWorkPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProgressClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setProgressDescription('');
    setProgressPhotos([]);
    setShowProgressModal(true);
  };

  const submitProgressUpdate = () => {
    if (selectedJobId && progressDescription && progressPhotos.length >= 1) {
      setJobs(jobs.map(job => {
        if (job.id === selectedJobId) {
          const now = new Date();
          const newProgress: ProgressUpdate = {
            id: `PRG_${Date.now()}`,
            date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
            description: progressDescription,
            photos: progressPhotos
          };
          return {
            ...job,
            progressUpdates: [...(job.progressUpdates || []), newProgress]
          };
        }
        return job;
      }));
      setShowProgressModal(false);
      setSelectedJobId(null);
      setProgressDescription('');
      setProgressPhotos([]);
    }
  };

  const submitProgress = () => {
    alert(`Progress added for job ${selectedJobId}`);
    setShowProgressModal(false);
    setProgressDescription('');
    setProgressPhotos([]);
  };

  const handleViewPreviousProgress = (updates: ProgressUpdate[]) => {
    setSelectedProgressUpdates(updates);
    setShowPreviousProgressModal(true);
  };

  const handleProgressPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - progressPhotos.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);

      const newPhotos = filesToProcess.map(file => URL.createObjectURL(file));
      setProgressPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removeProgressPhoto = (index: number) => {
    setProgressPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const renderJobs = () => {
    const filteredJobs = jobs.filter(job => job.status === activeTab);

    if (filteredJobs.length === 0) {
      const messages = {
        assigned: 'No assigned jobs',
        inProgress: 'No jobs in progress',
        awaiting: 'No pending approvals',
        completed: 'No completed jobs'
      };
      return <div className="empty-state">{messages[activeTab]}</div>;
    }

    return filteredJobs.map((job) => (
      <div key={job.id} className="job-card">
        <div className="job-card-header">
          <h3 className="job-title">{job.title}</h3>
          {job.status === 'assigned' && <span className="job-id">{job.id}</span>}
        </div>
        <div className="job-details">
          <p className="job-date">{job.date}</p>
          
          <div className="job-customer-section">
            <div className="job-customer-item">
              <FiUser className="customer-icon" />
              <span>{job.user.name}</span>
            </div>
            <div className="job-customer-item">
              <FiPhone className="customer-icon" />
              <a href={`tel:${job.user.mobile}`} className="contact-link">{job.user.mobile}</a>
            </div>
          </div>

          <div className="job-location-section">
            <FiMapPin className="location-icon" />
            <div className="location-content">
              <p className="address-text">{job.location.address}</p>
              <a 
                href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="directions-link"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
        <div className="job-actions">
          {(job.status === 'assigned' || job.status === 'inProgress') && job.progressUpdates && job.progressUpdates.length > 0 && (
            <button 
              className="btn-action btn-previous-progress" 
              onClick={() => handleViewPreviousProgress(job.progressUpdates!)}
            >
              Previous Progress
            </button>
          )}
          {job.status === 'assigned' && (
            <button className="btn-action btn-start-work" onClick={() => handleStartWorkClick(job.id)}>Start Work</button>
          )}
          {job.status === 'inProgress' && (
            <>
              <button className="btn-action btn-add-progress" onClick={() => handleAddProgressClick(job.id)}>Add Daily Progress</button>
              <button className="btn-action btn-complete-work" onClick={() => handleCompleteWorkClick(job.id)}>Complete Work</button>
            </>
          )}
        </div>
      </div>
    ));
  };

  const getJobCount = (status: JobStatus) => jobs.filter(job => job.status === status).length;

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <h1>Technician Dashboard</h1>
        <button className="profile-btn">
          <FiUser size={24} />
        </button>
      </header>

      {/* Modals */}
      {showStartModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal">
            <div className="complete-modal-header">
              <h2>Start Work</h2>
              <button className="close-btn" onClick={() => setShowStartModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="complete-modal-body">
              <textarea
                className="work-description-input"
                placeholder="Initial observations (e.g. Arrived on site, checking connections...)"
                value={startWorkDescription}
                onChange={(e) => setStartWorkDescription(e.target.value)}
                rows={4}
              />

              <div className="photo-upload-section" style={{ marginTop: '20px' }}>
                <p className="upload-instruction" style={{ textAlign: 'center', marginBottom: '15px' }}>
                  Please upload 1-3 photos to start work.
                </p>

                <div className="photo-previews" style={{ justifyContent: 'center' }}>
                  {startWorkPhotos.map((photo, index) => (
                    <div key={index} className="photo-thumbnail">
                      <img src={photo} alt={`Upload preview ${index + 1}`} />
                      <button className="remove-photo-btn" onClick={() => removePhoto(index)}>
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  {startWorkPhotos.length < 3 && (
                    <label className="photo-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden-file-input"
                      />
                      <div className="upload-placeholder">
                        <FiCamera size={24} />
                        <span>Add Photo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowStartModal(false)}>Cancel</button>
              <button
                className="btn-modal btn-submit"
                onClick={confirmStartWork}
                disabled={startWorkPhotos.length === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Progress Modal */}
      {showProgressModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal">
            <div className="complete-modal-header">
              <h2>Add Daily Progress</h2>
              <button className="close-btn" onClick={() => setShowProgressModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="complete-modal-body">
              <div className="form-group">
                <label>Progress Description</label>
                <textarea 
                  placeholder="Describe what work was completed today..."
                  rows={4}
                  value={progressDescription}
                  onChange={(e) => setProgressDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Upload Progress Photos (Max 3)</label>
                <div className="photo-previews">
                  {progressPhotos.map((photo, index) => (
                    <div key={index} className="photo-thumbnail">
                      <img src={photo} alt={`Upload preview ${index + 1}`} />
                      <button className="remove-photo-btn" onClick={() => removeProgressPhoto(index)}>
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  {progressPhotos.length < 3 && (
                    <label className="photo-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleProgressPhotoUpload}
                        className="hidden-file-input"
                      />
                      <div className="upload-placeholder">
                        <FiCamera size={24} />
                        <span>Add Photo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowProgressModal(false)}>Cancel</button>
              <button 
                className="btn-modal btn-submit"
                onClick={submitProgressUpdate}
                disabled={!progressDescription || progressPhotos.length === 0}
              >
                Submit Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Work Modal */}
      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal">
            <div className="complete-modal-header">
              <h2>Complete Work</h2>
              <button className="close-btn" onClick={() => setShowCompleteModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="complete-modal-body">
              <textarea
                placeholder="Work description"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="work-description-input"
                rows={4}
              ></textarea>

              <div className="photo-upload-section">
                <p className="upload-instruction">Please upload 1-3 completion photos.</p>

                <div className="photo-previews">
                  {completeWorkPhotos.map((photo, index) => (
                    <div key={index} className="photo-thumbnail">
                      <img src={photo} alt={`Complete preview ${index + 1}`} />
                      <button className="remove-photo-btn" onClick={() => removeCompletePhoto(index)}>
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  {completeWorkPhotos.length < 3 && (
                    <label className="photo-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleCompletePhotoUpload}
                        className="hidden-file-input"
                      />
                      <div className="upload-placeholder">
                        <FiCamera size={24} />
                        <span>Add Photo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowCompleteModal(false)}>Cancel</button>
              <button
                className="btn-modal btn-submit"
                onClick={submitCompleteWork}
                disabled={completeWorkPhotos.length === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previous Progress Modal */}
      {showPreviousProgressModal && (
        <div className="modal-overlay" onClick={() => setShowPreviousProgressModal(false)}>
          <div className="modal-content complete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="complete-modal-header">
              <h2>Previous Progress</h2>
              <button className="close-btn" onClick={() => setShowPreviousProgressModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <div className="complete-modal-body previous-progress-body">
              {selectedProgressUpdates.length > 0 ? (
                <div className="progress-timeline">
                  {selectedProgressUpdates.map(update => (
                    <div key={update.id} className="progress-timeline-item">
                      <div className="progress-timeline-date">{update.date}</div>
                      <div className="progress-timeline-desc">{update.description}</div>
                      {update.photos && update.photos.length > 0 && (
                        <div className="progress-timeline-photos">
                          {update.photos.map((photo, index) => (
                            <img key={index} src={photo} alt={`Progress ${index + 1}`} className="progress-photo-thumb" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No previous progress found.</p>
              )}
            </div>
            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowPreviousProgressModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div
            className={`summary-card ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            <div className="icon-wrapper blue">
              <FiInbox size={20} />
            </div>
            <div className="summary-info">
              <h3>Assigned Jobs</h3>
              <p>{getJobCount('assigned')} pending</p>
            </div>
          </div>

          <div
            className={`summary-card ${activeTab === 'inProgress' ? 'active' : ''}`}
            onClick={() => setActiveTab('inProgress')}
          >
            <div className="icon-wrapper yellow">
              <FiTool size={20} />
            </div>
            <div className="summary-info">
              <h3>Work In Progress</h3>
              <p>{getJobCount('inProgress')} active</p>
            </div>
          </div>

          <div
            className={`summary-card ${activeTab === 'awaiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('awaiting')}
          >
            <div className="icon-wrapper cyan">
              <FiClock size={20} />
            </div>
            <div className="summary-info">
              <h3>Awaiting Approval</h3>
              <p>{getJobCount('awaiting')} waiting</p>
            </div>
          </div>

          <div
            className={`summary-card ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <div className="icon-wrapper green">
              <FiCheckCircle size={20} />
            </div>
            <div className="summary-info">
              <h3>Completed Jobs</h3>
              <p>{getJobCount('completed')} done</p>
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="job-list">
          {renderJobs()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          <FiHome size={24} />
          <span>Home</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'inProgress' ? 'active' : ''}`}
          onClick={() => setActiveTab('inProgress')}
        >
          <FiTool size={24} />
          <span>In Progress</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <FiBriefcase size={24} />
          <span>Jobs</span>
        </button>
        {/* <button
          className={`nav-item ${activeTab === 'inProgress' ? 'active' : ''}`}
          onClick={() => setActiveTab('inProgress')}
        >
          <FiTool size={24} />
          <span>In Progress</span>
        </button> */}
        <button className="nav-item" onClick={() => navigate('/')}>
          <FiLogOut size={24} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
