import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { LANGS, t, tx } from '../utils/i18n';

const MedicalRecords = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date-desc'); // Sort options
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]); // For bulk actions
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiLang, setAiLang] = useState('en');
  const [creatingReminders, setCreatingReminders] = useState(false);

  // Persist AI language preference; default remains English
  useEffect(() => {
    const saved = localStorage.getItem('aiLang');
    if (saved) setAiLang(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('aiLang', aiLang);
  }, [aiLang]);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Lab Results',
    date: new Date().toISOString().split('T')[0],
    description: '',
    file: null,
    tags: '', // New field
    priority: 'normal' // New field
  });

  const categories = [
    'Lab Results',
    'X-Ray',
    'MRI Scan',
    'CT Scan',
    'Prescription',
    'Medical Report',
    'Vaccination Record',
    'Other'
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/medical-records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch medical records');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadForm(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('category', uploadForm.category);
      formData.append('date', uploadForm.date);
      formData.append('description', uploadForm.description);

      await axios.post('/api/medical-records', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Trigger AI analysis right after successful upload
      try {
        const aiForm = new FormData();
        aiForm.append('file', uploadForm.file);
        const aiRes = await axios.post('/api/ai/analyze', aiForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setAnalysisResult(aiRes.data);
        setShowAnalysisModal(true);
      } catch (aiErr) {
        console.error('AI analysis error:', aiErr);
        toast.warn(aiErr.response?.data?.message || 'AI analysis unavailable for this file.');
      }

      toast.success('Medical record uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        category: 'Lab Results',
        date: new Date().toISOString().split('T')[0],
        description: '',
        file: null,
        tags: '',
        priority: 'normal'
      });
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload record');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/medical-records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleDownload = (record) => {
    const downloadUrl = `http://localhost:5000${record.fileUrl}`;
    window.open(downloadUrl, '_blank');
    toast.success('Downloading file...');
  };

  const handleEdit = (record) => {
    setEditingRecord({
      id: record._id,
      title: record.title,
      category: record.recordType,
      description: record.description || ''
    });
  };

  const handleUpdateRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/medical-records/${editingRecord.id}`, {
        title: editingRecord.title,
        recordType: editingRecord.category,
        description: editingRecord.description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Record updated successfully');
      setEditingRecord(null);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to update record');
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('doc')) return '📘';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Generate AI Insights
  const generateAIInsights = () => {
    if (records.length === 0) return;

    const categoryCounts = {};
    records.forEach(record => {
      categoryCounts[record.recordType] = (categoryCounts[record.recordType] || 0) + 1;
    });

    const mostCommon = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    const recentRecords = records.filter(r => {
      const date = new Date(r.recordDate || r.createdAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date >= monthAgo;
    });

    const oldestRecord = records.reduce((oldest, record) => 
      new Date(record.recordDate || record.createdAt) < new Date(oldest.recordDate || oldest.createdAt) ? record : oldest
    );

    const insights = {
      totalRecords: records.length,
      mostCommonType: mostCommon[0],
      mostCommonCount: mostCommon[1],
      recentActivity: recentRecords.length,
      oldestRecord: formatDate(oldestRecord.recordDate || oldestRecord.createdAt),
      avgPerMonth: (records.length / 12).toFixed(1),
      recommendations: [
        records.length > 20 ? '✅ Great job maintaining your health records!' : '💡 Try to upload more records for better health tracking',
        recentRecords.length === 0 ? '⚠️ No recent records uploaded. Stay updated!' : '✅ Good activity in the last month',
        categoryCounts['Prescription'] > 5 ? '💊 Many prescriptions found. Consider setting medication reminders' : null,
        categoryCounts['Lab Results'] > 3 ? '🔬 Regular lab tests detected. Keep monitoring your health!' : null,
      ].filter(Boolean)
    };

    setAiInsights(insights);
    setShowAIInsights(true);
  };

  // Calculate Analytics
  const getAnalytics = () => {
    const categoryData = {};
    const monthlyData = {};
    
    records.forEach(record => {
      // Category analytics
      categoryData[record.recordType] = (categoryData[record.recordType] || 0) + 1;
      
      // Monthly analytics
      const month = new Date(record.recordDate || record.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return { categoryData, monthlyData };
  };

  // Group records by date for timeline
  const getTimelineData = () => {
    const grouped = {};
    records.forEach(record => {
      const month = new Date(record.recordDate || record.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(record);
    });
    return grouped;
  };

  // Bulk actions
  const toggleSelectRecord = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const selectAllRecords = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(r => r._id));
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedRecords.length} selected records? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedRecords.map(id => 
          axios.delete(`/api/medical-records/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      toast.success(`${selectedRecords.length} records deleted successfully`);
      setSelectedRecords([]);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete some records');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Title', 'Category', 'Date', 'Uploaded At', 'Description', 'File Name', 'File Size'],
      ...filteredRecords.map(record => [
        record.title,
        record.recordType,
        formatDate(record.recordDate || record.createdAt),
        formatDate(record.uploadedAt || record.createdAt),
        record.description || '',
        record.fileName,
        formatFileSize(record.fileSize)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Records exported to CSV');
  };

  const shareRecords = async () => {
    if (!shareEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Simulate sharing functionality
    toast.success(`Share link sent to ${shareEmail}`);
    setShowShareModal(false);
    setShareEmail('');
  };

  // Filter and search logic with sorting
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.description && record.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || record.recordType === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'date-desc':
        return new Date(b.recordDate || b.createdAt) - new Date(a.recordDate || a.createdAt);
      case 'date-asc':
        return new Date(a.recordDate || a.createdAt) - new Date(b.recordDate || b.createdAt);
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'size-desc':
        return (b.fileSize || 0) - (a.fileSize || 0);
      case 'size-asc':
        return (a.fileSize || 0) - (b.fileSize || 0);
      default:
        return 0;
    }
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Lab Results': '#3b82f6',
      'X-Ray': '#8b5cf6',
      'MRI Scan': '#ec4899',
      'CT Scan': '#f59e0b',
      'Prescription': '#10b981',
      'Medical Report': '#06b6d4',
      'Vaccination Record': '#14b8a6',
      'Other': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your medical records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page medical-records-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>📋 Medical Records</h1>
            <p>Securely store and manage your medical documents</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            + Upload New Record
          </button>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{records.length}</span>
            <span className="stat-label">Total Records</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatFileSize(records.reduce((sum, r) => sum + (r.fileSize || 0), 0))}</span>
            <span className="stat-label">Storage Used</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{records.length > 0 ? formatDate(records[0].uploadedAt || records[0].createdAt) : 'N/A'}</span>
            <span className="stat-label">Latest Upload</span>
          </div>
        </div>

        {/* Advanced Action Bar */}
        <div className="advanced-actions">
          <button className="action-btn-secondary" onClick={() => setShowAnalytics(true)}>
            📊 Analytics
          </button>
          <button className="action-btn-secondary" onClick={() => setShowTimeline(true)}>
            📅 Timeline View
          </button>
          <button className="action-btn-secondary" onClick={generateAIInsights}>
            🤖 AI Insights
          </button>
          <button className="action-btn-secondary" onClick={exportToCSV}>
            📥 Export CSV
          </button>
          <button className="action-btn-secondary" onClick={() => setShowShareModal(true)}>
            🔗 Share
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="controls-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search records by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⊞
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRecords.length > 0 && (
          <div className="bulk-actions-bar">
            <span>{selectedRecords.length} selected</span>
            <div className="bulk-actions">
              <button onClick={bulkDelete} className="btn btn-danger btn-sm">
                🗑️ Delete Selected
              </button>
              <button onClick={() => setSelectedRecords([])} className="btn btn-secondary btn-sm">
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* AI Analysis Summary Modal */}
        {showAnalysisModal && analysisResult && (
          <div className="modal-overlay" onClick={() => setShowAnalysisModal(false)}>
            <div className="modal-content ai-insights-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ alignItems: 'center', gap: '0.75rem' }}>
                <h2>🧠 {t(aiLang, 'AI Health Summary')}</h2>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="ai-lang" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>🌐</label>
                  <select id="ai-lang" value={aiLang} onChange={(e) => setAiLang(e.target.value)} className="filter-select" style={{ padding: '0.25rem 0.5rem' }}>
                    {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
                <button className="close-btn" onClick={() => setShowAnalysisModal(false)}>×</button>
              </div>
              <div className="insights-content">
                <div className="insight-cards">
                  <div className="insight-card">
                    <div className="insight-icon">📄</div>
                    <div className="insight-value" style={{ fontSize: '1.1rem' }}>{analysisResult.fileType?.toUpperCase()}</div>
                    <div className="insight-label">{t(aiLang, 'File Type')}</div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">❤️</div>
                    <div className="insight-value">{Object.keys(analysisResult.summary?.keyVitals || {}).length}</div>
                    <div className="insight-label">{t(aiLang, 'Vitals Detected')}</div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">🩺</div>
                    <div className="insight-value">{(analysisResult.summary?.possibleConditions || []).length}</div>
                    <div className="insight-label">{t(aiLang, 'Possible Conditions')}</div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">⚠️</div>
                    <div className="insight-value">{(analysisResult.summary?.redFlags || []).length}</div>
                    <div className="insight-label">{t(aiLang, 'Red Flags')}</div>
                  </div>
                </div>

                <div className="recommendations" style={{ marginBottom: '1rem' }}>
                  <h3>{t(aiLang, 'Key Vitals')}</h3>
                  {Object.keys(analysisResult.summary?.keyVitals || {}).length === 0 ? (
                    <p className="text-muted">{t(aiLang, 'None detected.')}</p>
                  ) : (
                    <ul>
                      {Object.entries(analysisResult.summary.keyVitals).map(([k, v]) => (
                        <li key={k}><strong>{k}:</strong> {v}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="recommendations" style={{ marginBottom: '1rem' }}>
                  <h3>{t(aiLang, 'Possible Conditions')}</h3>
                  {(analysisResult.summary?.possibleConditions || []).length === 0 ? (
                    <p className="text-muted">{t(aiLang, 'None detected.')}</p>
                  ) : (
                    <ul>
                      {analysisResult.summary.possibleConditions.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="recommendations" style={{ marginBottom: '1rem' }}>
                  <h3>{t(aiLang, 'Red Flags')}</h3>
                  {(analysisResult.summary?.redFlags || []).length === 0 ? (
                    <p className="text-muted">{t(aiLang, 'None detected.')}</p>
                  ) : (
                    <ul>
                      {analysisResult.summary.redFlags.map((c, idx) => (
                        <li key={idx}>⚠️ {tx(aiLang, c)}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="recommendations">
                  <h3>{t(aiLang, 'Suggestions')}</h3>
                  <ul>
                    {(analysisResult.summary?.suggestions || []).map((s, idx) => (
                      <li key={idx}>{tx(aiLang, s)}</li>
                    ))}
                  </ul>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {t(aiLang, 'Disclaimer: This is an automated summary to help you understand your document. It is not medical advice.')}
                  </p>
                </div>

                {analysisResult.prescription && analysisResult.prescription.medications && analysisResult.prescription.medications.length > 0 && (
                  <div className="recommendations" style={{ marginTop: '1rem' }}>
                    <h3>{t(aiLang, 'Prescription Summary')}</h3>
                    {analysisResult.prescription.header?.date && (
                      <p style={{ margin: '0 0 0.5rem 0' }}>{t(aiLang, 'Date')}: {analysisResult.prescription.header.date}</p>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                      {analysisResult.prescription.medications.map((m, idx) => (
                        <div key={idx} style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{m.name} {m.strength ? `• ${m.strength}` : ''}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {m.form && <span>{t(aiLang, 'Form')}: {m.form}</span>}
                            {m.frequency && <span>• {m.frequency}</span>}
                            {m.duration && <span>• {m.duration}</span>}
                          </div>
                          {m.notes && m.notes.length > 0 && (
                            <ul style={{ margin: '0.5rem 0 0 1rem' }}>
                              {m.notes.map((n, i) => <li key={i}>{tx(aiLang, n)}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                    {analysisResult.prescription.instructions && analysisResult.prescription.instructions.length > 0 && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <h4 style={{ margin: 0 }}>{t(aiLang, 'Additional Instructions')}</h4>
                        <ul style={{ margin: '0.5rem 0 0 1rem' }}>
                          {analysisResult.prescription.instructions.map((n, i) => <li key={i}>{tx(aiLang, n)}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {analysisResult.lifestylePlan && (
                  <div className="recommendations" style={{ marginTop: '1rem' }}>
                    <h3>{t(aiLang, 'Personalized Lifestyle Plan')}</h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                        <strong>{t(aiLang, 'Sleep')}</strong>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {t(aiLang, 'Target')}: {analysisResult.lifestylePlan.sleep?.targetHours} • {analysisResult.lifestylePlan.sleep?.schedule}
                          {analysisResult.lifestylePlan.sleep?.notes && (
                            <div style={{ marginTop: '0.25rem' }}>{analysisResult.lifestylePlan.sleep.notes}</div>
                          )}
                        </div>
                      </div>

                      <div style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                        <strong>{t(aiLang, 'Diet')}</strong>
                        <div style={{ marginTop: '0.25rem' }}>
                          {analysisResult.lifestylePlan.diet?.focus?.length > 0 && (
                            <>
                              <div style={{ fontWeight: 600 }}>{t(aiLang, 'Focus')}</div>
                              <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                                {analysisResult.lifestylePlan.diet.focus.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                              </ul>
                            </>
                          )}
                          {analysisResult.lifestylePlan.diet?.avoid?.length > 0 && (
                            <>
                              <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>{t(aiLang, 'Avoid')}</div>
                              <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                                {analysisResult.lifestylePlan.diet.avoid.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                              </ul>
                            </>
                          )}
                          {analysisResult.lifestylePlan.diet?.tips?.length > 0 && (
                            <>
                              <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>{t(aiLang, 'Tips')}</div>
                              <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                                {analysisResult.lifestylePlan.diet.tips.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                              </ul>
                            </>
                          )}
                        </div>
                      </div>

                      <div style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                        <strong>{t(aiLang, 'Hydration')}</strong>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {t(aiLang, 'Target')}: {analysisResult.lifestylePlan.hydration?.targetLiters}
                          {analysisResult.lifestylePlan.hydration?.tips?.length > 0 && (
                            <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                              {analysisResult.lifestylePlan.hydration.tips.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                        <strong>{t(aiLang, 'Activity')}</strong>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {t(aiLang, 'Goal')}: {analysisResult.lifestylePlan.activity?.targetMinutesPerWeek} min/week
                        </div>
                        {analysisResult.lifestylePlan.activity?.types?.length > 0 && (
                          <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                            {analysisResult.lifestylePlan.activity.types.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                          </ul>
                        )}
                        {analysisResult.lifestylePlan.activity?.cautions?.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <span style={{ fontWeight: 600 }}>{t(aiLang, 'Cautions')}</span>
                            <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                              {analysisResult.lifestylePlan.activity.cautions.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                        <strong>{t(aiLang, 'Monitoring')}</strong>
                        {analysisResult.lifestylePlan.monitoring?.checks?.length > 0 && (
                          <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                            {analysisResult.lifestylePlan.monitoring.checks.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                          </ul>
                        )}
                      </div>

                      <div style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                        <strong>{t(aiLang, 'Reminders')}</strong>
                        {analysisResult.lifestylePlan.reminders?.meds?.length > 0 && (
                          <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                            {analysisResult.lifestylePlan.reminders.meds.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                          </ul>
                        )}
                        {analysisResult.lifestylePlan.reminders?.general?.length > 0 && (
                          <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                            {analysisResult.lifestylePlan.reminders.general.map((s, i) => <li key={i}>{tx(aiLang, s)}</li>)}
                          </ul>
                        )}
                      </div>

                      {analysisResult.lifestylePlan.redFlags?.length > 0 && (
                        <div style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                          <strong>Red Flags</strong>
                          <ul style={{ margin: '0.25rem 0 0 1rem' }}>
                            {analysisResult.lifestylePlan.redFlags.map((t, i) => <li key={i}>⚠️ {t}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {analysisResult?.prescription?.medications?.length > 0 && (
                  <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                    <button
                      className="btn btn-primary"
                      disabled={creatingReminders}
                      onClick={async () => {
                        try {
                          setCreatingReminders(true);
                          const meds = analysisResult.prescription.medications;
                          const token = localStorage.getItem('token');

                          // map frequency to default times
                          const freqToTimes = (freqRaw) => {
                            const f = (freqRaw || '').toLowerCase();
                            if (/(\b1-1-1\b|\btid\b|three)/.test(f)) return ['08:00', '14:00', '20:00'];
                            if (/(\b1-0-1\b)/.test(f)) return ['08:00', '20:00'];
                            if (/(\bod\b|once|daily)/.test(f)) return ['08:00'];
                            if (/(\bbd\b|twice)/.test(f)) return ['08:00', '20:00'];
                            if (/(\bqid\b|four)/.test(f)) return ['08:00', '12:00', '16:00', '20:00'];
                            if (/(\bhs\b|bedtime)/.test(f)) return ['22:00'];
                            return ['08:00'];
                          };

                          const todayISO = new Date().toISOString().slice(0,10);
                          let success = 0, fail = 0;
                          for (const m of meds) {
                            // Skip SOS-only meds by default
                            if (/\bsos\b/i.test(m.frequency || '')) continue;
                            const body = {
                              medicineName: m.name,
                              dosage: m.strength || '',
                              frequency: m.frequency || 'Once Daily',
                              startDate: todayISO,
                              // let server default endDate +7 days; can include if needed
                              times: freqToTimes(m.frequency),
                              notes: (m.notes || []).join('; ')
                            };
                            try {
                              await axios.post('/api/reminders', body, { headers: { Authorization: `Bearer ${token}` } });
                              success++;
                            } catch(e) { fail++; }
                          }
                          if (success > 0) toast.success(`${success} reminder(s) created`);
                          if (fail > 0) toast.warn(`${fail} reminder(s) could not be created`);
                        } finally {
                          setCreatingReminders(false);
                        }
                      }}
                    >
                      {creatingReminders ? 'Creating reminders…' : 'Create medication reminders'}
                    </button>
                  </div>
                )}

                {analysisResult.fileType === 'dicom' && (
                  <div className="recommendations" style={{ marginTop: '1rem' }}>
                    <h3>DICOM Viewer</h3>
                    <p>We detected a DICOM file. A built-in viewer for 2D/3D exploration will appear here in the next step.</p>
                  </div>
                )}

                {analysisResult.extractedText && analysisResult.fileType !== 'dicom' && (
                  <div className="recommendations" style={{ marginTop: '1rem' }}>
                    <h3>Extracted Text (Preview)</h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--background-color)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{analysisResult.extractedText.slice(0, 4000)}</pre>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowAnalysisModal(false)}>{t(aiLang, 'Close')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Select Bar */}
        {filteredRecords.length > 0 && (
          <div className="quick-select-bar">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedRecords.length === filteredRecords.length}
                onChange={selectAllRecords}
              />
              <span>Select All ({filteredRecords.length})</span>
            </label>
          </div>
        )}

        {/* Records Display */}
        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No medical records found</h3>
            <p>
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by uploading your first medical record'}
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                Upload First Record
              </button>
            )}
          </div>
        ) : (
          <div className={`records-${viewMode}`}>
            {filteredRecords.map(record => (
              <div key={record._id} className="record-card">
                <div className="record-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRecords.includes(record._id)}
                    onChange={() => toggleSelectRecord(record._id)}
                  />
                </div>
                <div className="record-icon">
                  {getFileIcon(record.fileType)}
                </div>
                <div className="record-content">
                  <div className="record-header">
                    <h3>{record.title}</h3>
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(record.recordType) }}
                    >
                      {record.recordType}
                    </span>
                  </div>
                  <p className="record-date">
                    📅 {formatDate(record.recordDate || record.createdAt)}
                    <span className="relative-time"> • {getRelativeTime(record.recordDate || record.createdAt)}</span>
                  </p>
                  {record.uploadedAt && (
                    <p className="record-uploaded" style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                      📤 Uploaded: {formatDate(record.uploadedAt)}
                    </p>
                  )}
                  {record.description && (
                    <p className="record-description">{record.description}</p>
                  )}
                  <div className="record-meta">
                    <span>📎 {record.fileName}</span>
                    <span>💾 {formatFileSize(record.fileSize)}</span>
                  </div>
                </div>
                <div className="record-actions">
                  <button 
                    onClick={() => handleView(record)}
                    className="action-btn view-btn"
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => handleDownload(record)}
                    className="action-btn download-btn"
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button 
                    onClick={() => handleEdit(record)}
                    className="action-btn edit-btn"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(record._id)}
                    className="action-btn delete-btn"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Upload Medical Record</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleUpload} className="upload-form">
                <div className="form-group">
                  <label htmlFor="title">Record Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={uploadForm.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Blood Test Results"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={uploadForm.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={uploadForm.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={uploadForm.description}
                    onChange={handleInputChange}
                    placeholder="Additional notes or details about this record..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tags">Tags (comma-separated)</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={uploadForm.tags}
                      onChange={handleInputChange}
                      placeholder="e.g., diabetes, routine, urgent"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={uploadForm.priority}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="file">Upload File *</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.dcm"
                      required
                    />
                    {uploadForm.file && (
                      <div className="file-preview">
                        <span>{getFileIcon(uploadForm.file.type)} {uploadForm.file.name}</span>
                        <span className="file-size">({formatFileSize(uploadForm.file.size)})</span>
                      </div>
                    )}
                  </div>
                  <small>Accepted formats: PDF, DOC, DOCX, JPG, PNG, GIF, DICOM (.dcm) (Max 10MB)</small>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showViewModal && selectedRecord && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Record Details</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowViewModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="record-details">
                <div className="detail-row">
                  <strong>Title:</strong>
                  <span>{selectedRecord.title}</span>
                </div>
                <div className="detail-row">
                  <strong>Category:</strong>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(selectedRecord.recordType) }}
                  >
                    {selectedRecord.recordType}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{formatDate(selectedRecord.recordDate || selectedRecord.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <strong>Uploaded:</strong>
                  <span>{formatDate(selectedRecord.uploadedAt || selectedRecord.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <strong>File Name:</strong>
                  <span>{selectedRecord.fileName}</span>
                </div>
                <div className="detail-row">
                  <strong>File Size:</strong>
                  <span>{formatFileSize(selectedRecord.fileSize)}</span>
                </div>
                <div className="detail-row">
                  <strong>File Type:</strong>
                  <span>{selectedRecord.fileType}</span>
                </div>
                {selectedRecord.description && (
                  <div className="detail-row">
                    <strong>Description:</strong>
                    <span>{selectedRecord.description}</span>
                  </div>
                )}
                <div className="detail-row">
                  <strong>Uploaded:</strong>
                  <span>{formatDate(selectedRecord.createdAt)}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleDownload(selectedRecord)}
                >
                  Download File
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingRecord && (
          <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Record</h2>
                <button 
                  className="close-btn"
                  onClick={() => setEditingRecord(null)}
                >
                  ×
                </button>
              </div>
              <div className="edit-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editingRecord.title}
                    onChange={(e) => setEditingRecord({...editingRecord, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingRecord.category}
                    onChange={(e) => setEditingRecord({...editingRecord, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editingRecord.description}
                    onChange={(e) => setEditingRecord({...editingRecord, description: e.target.value})}
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleUpdateRecord}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
            <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📊 Record Analytics</h2>
                <button className="close-btn" onClick={() => setShowAnalytics(false)}>×</button>
              </div>
              <div className="analytics-content">
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h3>Category Distribution</h3>
                    <div className="chart-bars">
                      {Object.entries(getAnalytics().categoryData).map(([cat, count]) => (
                        <div key={cat} className="chart-bar">
                          <div className="bar-label">{cat}</div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill"
                              style={{ 
                                width: `${(count / records.length) * 100}%`,
                                backgroundColor: getCategoryColor(cat)
                              }}
                            >
                              {count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>Monthly Upload Trend</h3>
                    <div className="chart-bars">
                      {Object.entries(getAnalytics().monthlyData).slice(-6).map(([month, count]) => (
                        <div key={month} className="chart-bar">
                          <div className="bar-label">{month}</div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill"
                              style={{ width: `${(count / Math.max(...Object.values(getAnalytics().monthlyData))) * 100}%` }}
                            >
                              {count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Modal */}
        {showTimeline && (
          <div className="modal-overlay" onClick={() => setShowTimeline(false)}>
            <div className="modal-content timeline-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📅 Medical Records Timeline</h2>
                <button className="close-btn" onClick={() => setShowTimeline(false)}>×</button>
              </div>
              <div className="timeline-content">
                {Object.entries(getTimelineData()).map(([month, monthRecords]) => (
                  <div key={month} className="timeline-group">
                    <div className="timeline-month">{month}</div>
                    <div className="timeline-items">
                      {monthRecords.map(record => (
                        <div key={record._id} className="timeline-item">
                          <div className="timeline-dot" style={{ backgroundColor: getCategoryColor(record.recordType) }}></div>
                          <div className="timeline-content-item">
                            <div className="timeline-title">{record.title}</div>
                            <div className="timeline-meta">
                              <span className="timeline-category">{record.recordType}</span>
                              <span className="timeline-date">{formatDate(record.recordDate || record.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Modal */}
        {showAIInsights && aiInsights && (
          <div className="modal-overlay" onClick={() => setShowAIInsights(false)}>
            <div className="modal-content ai-insights-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🤖 AI-Powered Health Insights</h2>
                <button className="close-btn" onClick={() => setShowAIInsights(false)}>×</button>
              </div>
              <div className="insights-content">
                <div className="insight-cards">
                  <div className="insight-card">
                    <div className="insight-icon">📊</div>
                    <div className="insight-value">{aiInsights.totalRecords}</div>
                    <div className="insight-label">Total Records</div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">🏆</div>
                    <div className="insight-value">{aiInsights.mostCommonType}</div>
                    <div className="insight-label">Most Common Type</div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">📈</div>
                    <div className="insight-value">{aiInsights.recentActivity}</div>
                    <div className="insight-label">Records This Month</div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">📅</div>
                    <div className="insight-value">{aiInsights.avgPerMonth}</div>
                    <div className="insight-label">Avg per Month</div>
                  </div>
                </div>
                <div className="recommendations">
                  <h3>💡 Smart Recommendations</h3>
                  <ul>
                    {aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔗 Share Medical Records</h2>
                <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
              </div>
              <div className="share-content">
                <p>Share your medical records securely with healthcare providers or family members.</p>
                <div className="form-group">
                  <label>Recipient Email</label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="share-input"
                  />
                </div>
                <div className="share-options">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Include all records</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Set expiration (7 days)</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Require password protection</span>
                  </label>
                </div>
                <div className="share-link">
                  <p>Or share via link:</p>
                  <div className="link-box">
                    <input type="text" value="https://securemedstore.com/share/abc123xyz" readOnly />
                    <button className="btn btn-outline" onClick={() => {
                      navigator.clipboard.writeText('https://securemedstore.com/share/abc123xyz');
                      toast.success('Link copied to clipboard!');
                    }}>
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={shareRecords}>
                  Send Share Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .medical-records-page {
          min-height: calc(100vh - 80px);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin-bottom: 0.5rem;
        }

        .advanced-actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .action-btn-secondary {
          padding: 0.65rem 1.25rem;
          background-color: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-color);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .action-btn-secondary:hover {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          transform: translateY(-2px);
        }

        .stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .controls-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--background-color);
          color: var(--text-color);
        }

        .search-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.5;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--background-color);
          color: var(--text-color);
          cursor: pointer;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 0.25rem;
          background-color: var(--background-color);
        }

        .view-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-color);
          cursor: pointer;
          border-radius: 0.25rem;
          font-size: 1.2rem;
          transition: all 0.2s;
        }

        .view-btn.active {
          background-color: var(--primary-color);
          color: white;
        }

        .bulk-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: var(--primary-color);
          color: white;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .bulk-actions {
          display: flex;
          gap: 0.5rem;
        }

        .quick-select-bar {
          padding: 0.75rem 1rem;
          background-color: var(--light-bg);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          cursor: pointer;
        }

        .records-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .records-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .record-card {
          background-color: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .record-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .record-checkbox {
          display: flex;
          align-items: flex-start;
          padding-top: 0.25rem;
        }

        .record-checkbox input[type="checkbox"] {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .record-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .relative-time {
          color: var(--text-secondary);
          font-size: 0.8em;
        }

        .record-content {
          flex: 1;
          min-width: 0;
        }

        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .record-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--text-color);
          word-break: break-word;
        }

        .category-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .record-date {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0.25rem 0;
        }

        .record-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0.5rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .record-meta {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }

        .record-actions {
          display: flex;
          gap: 0.5rem;
          flex-direction: column;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s;
          background-color: var(--light-bg);
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .view-btn:hover { background-color: #3b82f6; }
        .download-btn:hover { background-color: #10b981; }
        .edit-btn:hover { background-color: #f59e0b; }
        .delete-btn:hover { background-color: #ef4444; }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          margin: 0 auto 1rem;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background-color: var(--background-color);
          border-radius: 1rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-color);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--text-secondary);
          cursor: pointer;
          line-height: 1;
        }

        .upload-form,
        .edit-form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-color);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--background-color);
          color: var(--text-color);
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: var(--text-secondary);
          font-size: 0.75rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .file-upload-area {
          border: 2px dashed var(--border-color);
          border-radius: 0.5rem;
          padding: 1rem;
          text-align: center;
        }

        .file-preview {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: var(--light-bg);
          border-radius: 0.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-size {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
          justify-content: flex-end;
        }

        .record-details {
          padding: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row strong {
          color: var(--text-color);
        }

        .detail-row span {
          color: var(--text-secondary);
          text-align: right;
        }

        /* Analytics Modal Styles */
        .analytics-modal,
        .timeline-modal,
        .ai-insights-modal {
          max-width: 900px;
        }

        .analytics-content {
          padding: 1.5rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .analytics-card {
          background-color: var(--light-bg);
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .analytics-card h3 {
          margin-bottom: 1rem;
          color: var(--primary-color);
        }

        .chart-bars {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .chart-bar {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 1rem;
          align-items: center;
        }

        .bar-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bar-container {
          background-color: var(--background-color);
          border-radius: 0.5rem;
          overflow: hidden;
          height: 30px;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.5rem;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          min-width: 35px;
          transition: width 0.5s ease;
        }

        /* Timeline Styles */
        .timeline-content {
          padding: 1.5rem;
          max-height: 600px;
          overflow-y: auto;
        }

        .timeline-group {
          margin-bottom: 2rem;
        }

        .timeline-month {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--primary-color);
        }

        .timeline-items {
          position: relative;
          padding-left: 2rem;
        }

        .timeline-item {
          position: relative;
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .timeline-dot {
          position: absolute;
          left: -2rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: var(--primary-color);
          border: 3px solid var(--background-color);
          box-shadow: 0 0 0 2px var(--border-color);
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -1.5rem;
          top: 20px;
          bottom: -20px;
          width: 2px;
          background-color: var(--border-color);
        }

        .timeline-item:last-child::before {
          display: none;
        }

        .timeline-content-item {
          flex: 1;
          background-color: var(--light-bg);
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .timeline-title {
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .timeline-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
        }

        .timeline-category {
          color: var(--primary-color);
          font-weight: 500;
        }

        .timeline-date {
          color: var(--text-secondary);
        }

        /* AI Insights Styles */
        .insights-content {
          padding: 1.5rem;
        }

        .insight-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .insight-card {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          text-align: center;
        }

        .insight-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .insight-value {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .insight-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .recommendations {
          background-color: var(--light-bg);
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .recommendations h3 {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .recommendations ul {
          list-style: none;
          padding: 0;
        }

        .recommendations li {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background-color: var(--background-color);
          border-left: 3px solid var(--primary-color);
          border-radius: 0.25rem;
        }

        /* Share Modal Styles */
        .share-content {
          padding: 1.5rem;
        }

        .share-content p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .share-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--background-color);
          color: var(--text-color);
        }

        .share-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin: 1.5rem 0;
          padding: 1rem;
          background-color: var(--light-bg);
          border-radius: 0.5rem;
        }

        .share-link {
          margin-top: 1.5rem;
        }

        .link-box {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .link-box input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background-color: var(--light-bg);
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: 100%;
          }

          .records-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .record-card {
            flex-direction: column;
          }

          .record-actions {
            flex-direction: row;
            justify-content: flex-end;
          }

          .modal-content {
            max-width: 100%;
            margin: 0;
            border-radius: 0;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .insight-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .chart-bar {
            grid-template-columns: 100px 1fr;
          }

          .advanced-actions {
            justify-content: center;
          }

          .action-btn-secondary {
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MedicalRecords;