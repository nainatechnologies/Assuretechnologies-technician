import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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

export type ExtraItem = {
  id: string;
  description: string;
  qty: number;
  status: string;
};

type Job = {
  id: string;
  displayId: string;
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
  extraItems?: ExtraItem[];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<JobStatus>('assigned');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [startWorkPhotos, setStartWorkPhotos] = useState<string[]>([]);
  const [startWorkFiles, setStartWorkFiles] = useState<File[]>([]);
  const [startWorkDescription, setStartWorkDescription] = useState('');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [completeWorkPhotos, setCompleteWorkPhotos] = useState<string[]>([]);
  const [completeWorkFiles, setCompleteWorkFiles] = useState<File[]>([]);

  // Daily Progress state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressDescription, setProgressDescription] = useState('');
  const [progressPhotos, setProgressPhotos] = useState<string[]>([]);

  // Previous Progress state
  const [showPreviousProgressModal, setShowPreviousProgressModal] = useState(false);
  const [selectedProgressUpdates, setSelectedProgressUpdates] = useState<ProgressUpdate[]>([]);
  
  const [showExtraItemsModal, setShowExtraItemsModal] = useState(false);
  const [extraItemDesc, setExtraItemDesc] = useState('');
  const [extraItemQty, setExtraItemQty] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [togglingDuty, setTogglingDuty] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/technician/service-bookings');
      if (response.data && response.data.success) {
        if (response.data.is_online !== undefined) {
          setIsOnline(Boolean(response.data.is_online));
        }
        const rawJobs = response.data.data || [];
        const mappedJobs: Job[] = rawJobs.map((raw: any) => {
          let mappedStatus: JobStatus = 'assigned';
          if (raw.status === 'IN_PROGRESS') mappedStatus = 'inProgress';
          else if (raw.status === 'AWAITING_APPROVAL') mappedStatus = 'awaiting';
          else if (raw.status === 'COMPLETED') mappedStatus = 'completed';

          let formattedAddress = 'Address not provided';
          if (raw.address) {
            try {
              const parsed = typeof raw.address === 'string' ? JSON.parse(raw.address) : raw.address;
              const parts = [parsed.line1, parsed.line2, parsed.city, parsed.state, parsed.country].filter(Boolean);
              if (parts.length > 0) {
                formattedAddress = parts.join(', ');
              } else {
                formattedAddress = typeof raw.address === 'string' ? raw.address : JSON.stringify(raw.address);
              }
            } catch (e) {
              formattedAddress = raw.address;
            }
          }

          return {
            id: raw.id,
            displayId: raw.display_id || raw.id,
            title: raw.Service?.name || 'Service Booking',
            date: raw.scheduled_date ? new Date(raw.scheduled_date).toLocaleString() : 'N/A',
            status: mappedStatus,
            user: {
              name: raw.Order?.customer_name || 'Customer',
              mobile: raw.Order?.customer_contact || 'N/A'
            },
            location: {
              address: formattedAddress,
              lat: Number(raw.lat) || 0,
              lng: Number(raw.lng) || 0
            },
            progressUpdates: (raw.progress_updates || raw.JobProgresses || []).map((p: any) => ({
              id: p.id,
              date: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A',
              description: p.description,
              photos: p.photos || []
            })),
            extraItems: (raw.extra_items || raw.extraItems || raw.ExtraItemsRequests || []).map((e: any) => ({
              id: String(e.id),
              description: e.description,
              qty: Number(e.qty) || 1,
              status: e.status || 'PENDING'
            }))
          };
        });
        setJobs(mappedJobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleDuty = async () => {
    try {
      setTogglingDuty(true);
      const nextStatus = !isOnline;
      const res = await api.patch('/duty-status', { is_online: nextStatus });
      if (res.data && res.data.success) {
        setIsOnline(Boolean(res.data.data.is_online));
      }
    } catch (e) {
      console.error('Duty toggle error:', e);
    } finally {
      setTogglingDuty(false);
    }
  };

  const handleStartWorkClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setStartWorkPhotos([]);
    setStartWorkDescription('');
    setShowStartModal(true);
  };

  const confirmStartWork = async () => {
    if (selectedJobId) {
      try {
        const formData = new FormData();
        formData.append('action', 'START_WORK');
        if (startWorkDescription) formData.append('description', startWorkDescription);
        startWorkFiles.forEach(file => formData.append('photos', file));

        await api.patch(`/technician/service-bookings/${selectedJobId}/action`, formData);
        setIsOnline(true);
        setShowStartModal(false);
        setSelectedJobId(null);
        setStartWorkPhotos([]);
        setStartWorkFiles([]);
        setStartWorkDescription('');
        await fetchJobs();
        setActiveTab('inProgress');
      } catch (error: any) {
        console.error('Start work failed', error);
        alert(error.response?.data?.message || 'Failed to start work');
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - startWorkPhotos.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);

      setStartWorkFiles(prev => [...prev, ...filesToProcess]);
      const newPhotos = filesToProcess.map(file => URL.createObjectURL(file));
      setStartWorkPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setStartWorkPhotos(prev => prev.filter((_, i) => i !== index));
    setStartWorkFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteWorkClick = (id: string) => {
    setSelectedJobId(id);
    setWorkDescription('');
    setCompleteWorkPhotos([]);
    setShowCompleteModal(true);
  };

  const submitCompleteWork = async () => {
    if (selectedJobId) {
      try {
        const formData = new FormData();
        formData.append('action', 'COMPLETE_WORK');
        if (workDescription) formData.append('description', workDescription);
        completeWorkFiles.forEach(file => formData.append('photos', file));

        await api.patch(`/technician/service-bookings/${selectedJobId}/action`, formData);
        setShowCompleteModal(false);
        setSelectedJobId(null);
        setWorkDescription('');
        setCompleteWorkPhotos([]);
        setCompleteWorkFiles([]);
        await fetchJobs();
        setActiveTab('awaiting');
      } catch (error: any) {
        console.error('Complete work failed', error);
        alert(error.response?.data?.message || 'Failed to complete work');
      }
    }
  };

  const handleCompletePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - completeWorkPhotos.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);

      setCompleteWorkFiles(prev => [...prev, ...filesToProcess]);
      const newPhotos = filesToProcess.map(file => URL.createObjectURL(file));
      setCompleteWorkPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removeCompletePhoto = (index: number) => {
    setCompleteWorkPhotos(prev => prev.filter((_, i) => i !== index));
    setCompleteWorkFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProgressClick = (id: string) => {
    setSelectedJobId(id);
    setProgressDescription('');
    setProgressPhotos([]);
    setShowProgressModal(true);
  };

  const handleAddExtraItemsClick = (id: string) => {
    setSelectedJobId(id);
    setShowExtraItemsModal(true);
  };

  const submitProgressUpdate = async () => {
    if (selectedJobId && progressDescription) {
      try {
        await api.patch(`/technician/service-bookings/${selectedJobId}/action`, {
          action: 'ADD_PROGRESS',
          description: progressDescription
        });
        setShowProgressModal(false);
        setSelectedJobId(null);
        setProgressDescription('');
        setProgressPhotos([]);
        await fetchJobs();
      } catch (error: any) {
        console.error('Add progress failed', error);
        alert(error.response?.data?.message || 'Failed to add progress update');
      }
    }
  };

  const submitExtraItems = async () => {
    if (selectedJobId && extraItemDesc.trim() && extraItemQty.trim()) {
      try {
        await api.patch(`/technician/service-bookings/${selectedJobId}/action`, {
          action: 'REQUEST_EXTRA_ITEMS',
          extraItems: [
            {
              description: extraItemDesc.trim(),
              qty: Number(extraItemQty)
            }
          ]
        });
        alert('Extra items requested successfully!');
        setShowExtraItemsModal(false);
        setExtraItemDesc('');
        setExtraItemQty('');
        await fetchJobs();
      } catch (error: any) {
        console.error('Extra items request failed', error);
        alert(error.response?.data?.message || 'Failed to request extra items');
      }
    }
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

    if (loading) {
      return <div className="empty-state">Loading jobs...</div>;
    }

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
          {job.status === 'assigned' && <span className="job-id">{job.displayId || job.id}</span>}
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

        {job.extraItems && job.extraItems.length > 0 && (
          <div style={{ marginTop: '12px', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Requested Extra Items:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {job.extraItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#1e293b', fontWeight: 500 }}>{item.description} (Qty: {item.qty})</span>
                  {item.status === 'APPROVED' && (
                    <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '0.75rem' }}>
                      ? Approved by Customer
                    </span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '0.75rem' }}>
                      ? Declined by Customer
                    </span>
                  )}
                  {item.status === 'PENDING' && (
                    <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '0.75rem' }}>
                      ? Pending Decision
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
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
              <button className="btn-action btn-add-progress" style={{ backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }} onClick={() => handleAddExtraItemsClick(job.id)}>Add Extra Items</button>
              <button className="btn-action btn-add-progress" onClick={() => handleAddProgressClick(job.id)}>Add Daily Progress</button>
              <button className="btn-action btn-complete-work" onClick={() => handleCompleteWorkClick(job.id)}>Complete Work</button>
            </>
          )}
        </div>
      </div>
    ));
  };

  const getJobCount = (status: JobStatus) => jobs.filter(job => job.status === status).length;

    const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <h1>Technician Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleToggleDuty}
            disabled={togglingDuty}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: isOnline ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.4)',
              backgroundColor: isOnline ? '#10b981' : 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: togglingDuty ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isOnline ? 'You are ON duty (Receiving new job assignments)' : 'You are OFF duty (Hidden from new job assignments)'}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#ffffff' : 'rgba(255,255,255,0.6)'
              }}
            />
            {togglingDuty ? 'Updating...' : isOnline ? 'Duty ON' : 'Duty OFF'}
          </button>
          <button className="profile-btn">
            <FiUser size={24} />
          </button>
        </div>
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
                  Please upload 1-3 photos to start work (optional).
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
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Extra Items Modal */}
      {showExtraItemsModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal">
            <div className="complete-modal-header">
              <h2>Add Extra Items</h2>
              <button className="close-btn" onClick={() => setShowExtraItemsModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="complete-modal-body">
              <p style={{ marginBottom: '15px', color: '#666' }}>Request client approval for additional items/services.</p>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                <input
                  type="text"
                  className="work-description-input"
                  placeholder="e.g. Extra camera mount"
                  value={extraItemDesc}
                  onChange={(e) => setExtraItemDesc(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Quantity</label>
                <input
                  type="number"
                  className="work-description-input"
                  placeholder="e.g. 2"
                  value={extraItemQty}
                  onChange={(e) => setExtraItemQty(e.target.value)}
                />
              </div>
            </div>
            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowExtraItemsModal(false)}>Cancel</button>
              <button
                className="btn-modal btn-submit"
                onClick={submitExtraItems}
                disabled={!extraItemDesc.trim() || !extraItemQty.trim()}
              >
                Send Request
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
                disabled={!progressDescription.trim()}
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
                <p className="upload-instruction">Please upload 1-3 completion photos (optional).</p>

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
        <button className="nav-item" onClick={handleLogout}>
          <FiLogOut size={24} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
