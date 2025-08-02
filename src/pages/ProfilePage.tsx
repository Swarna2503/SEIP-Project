import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import {
  createApplication,
  getDraftApplications,
  getApplicationHistory,
  deleteApplication,
} from "../apis/application";
import "../styles/profile.css";
import { getPdfUrl } from "../apis/document";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  useEffect(() => {
    if (!user?.user_id) return;
    
    async function fetchData() {
      if (!user || !user.user_id) {
        console.log("User not found or user_id missing:", user);
        return;
      }

      console.log("Fetching data for user_id:", user.user_id);

      const draftRes = await getDraftApplications(user.user_id);
      console.log("Draft response:", draftRes);

      if (draftRes.ok && Array.isArray(draftRes.data)) {
        console.log("Setting drafts:", draftRes.data);
        setDrafts(draftRes.data);
      } else {
        console.warn("Drafts fetch failed or data not an array");
      }

      const historyRes = await getApplicationHistory(user.user_id);
      console.log("History response:", historyRes);

      if (historyRes.ok && Array.isArray(historyRes.data)) {
        // For now, combine mock data with real data
        const enhanced = await Promise.all(
          historyRes.data.map(async (app) => {
            if (app.status === "application_complete") {
              try {
                const { data } = await getPdfUrl(app.application_id, true);
                return { ...app, pdf_url: data.pdfUrl };
              } catch (e) {
                console.warn(`Fetch PDF URL failed for ${app.application_id}`, e);
                return { ...app, pdf_url: null };
              }
            }
            return app;
           })
        );
          setHistory(enhanced);
      } else {
        setHistory([]);
      }

      setLoading(false);
    }
    fetchData();
  }, [user]);

  const handleDelete = async (applicationId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this draft?");
    if (!confirmDelete) return;

    const res = await deleteApplication(applicationId);
    if (res.ok) {
      setDrafts(prev => prev.filter(app => app.application_id !== applicationId));
    } else {
      alert("Failed to delete application.");
    }
  };

  const handleContinue = (app: any) => {
    const applicationId = app.application_id;

    switch (app.status) {
      case "draft":
        navigate("/ocr", { state: { applicationId } });
        break;
      case "driver_uploaded":
        navigate("/upload-title", { state: { applicationId } });
        break;
      case "title_uploaded":
        navigate("/responsive-form", { state: { applicationId } });
        break;
      case "form_completed":
        navigate("/signature", {state : {applicationId}});
        break;
      case "signed":
        navigate("/email-sent", { state: { applicationId } });
        break;
      case "pending_signature":
        navigate("/email-sent", { state: { applicationId } });
        break;
      case "application_complete":
        alert("This application has already been completed.");
        break;
      default:
        console.warn("Unrecognized status:", app.status);
        break;
    }
  };



  const handleNew = async () => {
    if (!user?.user_id) return;
    const res = await createApplication(user.user_id);
    if (res.ok && res.data?.application_id) {
      navigate("/ocr", { state: { applicationId: res.data.application_id } });
    }
  };

  const handleStatus = (applicationId: string) => {
    const app = [...drafts, ...history].find(a => a.application_id === applicationId);
    setSelectedApplication(app);
    setShowStatusModal(true);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) logout();
  };

  if (!user) return <p className="login-prompt">Please log in to view your profile.</p>;
  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <button onClick={() => navigate("/")} className="back-home-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Back to Home
        </button>
        <h1>Profile Dashboard</h1>
        <div className="user-info">
          <div className="user-avatar">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="user-email">{user.email}</div>
            <div className="user-id">ID: {user.user_id}</div>
          </div>
        </div>
      </div>

      <div className="profile-container">
        {/* Create New Application */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Create New Application</h2>
          </div>
          <button onClick={handleNew} className="create-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Start New Application
          </button>
        </div>

        {/* Draft Applications */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Draft Applications</h2>
            <span className="badge">{drafts.length}</span>
          </div>
          
          {drafts.length > 0 ? (
            <div className="draft-grid">
              {drafts.map((app, idx) => (
                <div key={idx} className="draft-card">
                  <div className="draft-header">
                    <h3>Application #{app.application_display_id}</h3>
                    <div className="application-status-tag">
                      {app.status === "pending_signature" && <span className="tag pending">Pending Signature</span>}
                      {app.status === "draft" && <span className="tag draft">Draft</span>}
                    </div>

                    <div className="draft-actions">
                      <button 
                        onClick={() => handleContinue(app)}
                        className="action-button continue"
                      >
                        Continue
                      </button>
                      <button 
                        onClick={() => handleStatus(app.application_id)}
                        className="action-button status"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        Status
                      </button>
                      <button 
                        onClick={() => handleDelete(app.application_id)}
                        className="action-button delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        <span className="sr-only">Delete application</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="draft-details">
                    <div className="detail-item">
                      <span>Created:</span>
                      <span>{app.created_at ? new Date(app.created_at).toLocaleString() : "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span>Last Updated:</span>
                      <span>{app.updated_at ? new Date(app.updated_at).toLocaleString() : "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span>Applicant:</span>
                      <span>{app.full_name || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span>DL Number:</span>
                      <span>{app.dl_number || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span>VIN:</span>
                      <span>{app.vin_number || "N/A"}</span>
                    </div>
                  </div>
                  
                  <div className="document-status">
                    <div className={`status-item ${app.driver_license_id ? "complete" : "incomplete"}`}>
                      <span>Driver License</span>
                      {app.driver_license_id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className={`status-item ${app.title_doc_id ? "complete" : "incomplete"}`}>
                      <span>Title Document</span>
                      {app.title_doc_id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p>No draft applications found</p>
              <button onClick={handleNew} className="text-button">Create your first application</button>
            </div>
          )}
        </div>

        {/* Application History */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Application History</h2>
            <span className="badge">{history.length}</span>
          </div>
          
          {history.length > 0 ? (
            <div className="history-list">
              {history.map((h, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-id">#{h.application_display_id}</div>
                  <div className={`history-status ${h.status?.toLowerCase()}`}>
                    {h.status}
                  </div>
                  <div className="history-date">
                    {new Date(h.created_at).toLocaleDateString()}
                  </div>
                  <div className="history-actions">
                    <button 
                      onClick={() => handleStatus(h.application_id)}
                      className="view-button"
                    >
                      View Details
                    </button>
                    {h.status === 'application_complete' && (
                      <a
                        href={h.pdf_url || '#'}
                        className={`download-button ${!h.pdf_url ? 'disabled' : ''}`}
                        download={`application_${h.application_display_id}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={!h.pdf_url ? (e) => {
                          e.preventDefault();
                          alert('PDF download will be available when the backend implementation is complete');
                        } : undefined}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No application history yet</p>
            </div>
          )}
        </div>

        {/* Status Modal */}
        {showStatusModal && selectedApplication && (
          <div className="modal-overlay">
            <div className="status-modal">
              <div className="modal-header">
                <h3>Application Status</h3>
                <button onClick={() => setShowStatusModal(false)} className="close-button">
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="status-detail">
                  <span>Application ID:</span>
                  <span>{selectedApplication.application_display_id}</span>
                </div>
                <div className="status-detail">
                  <span>Current Status:</span>
                  <span className={`status-badge ${selectedApplication.status?.toLowerCase() || 'pending'}`}>
                    {selectedApplication.status || 'Pending'}
                  </span>
                </div>
                <div className="status-detail">
                  <span>Created:</span>
                  <span>{new Date(selectedApplication.created_at).toLocaleString()}</span>
                </div>
                <div className="status-detail">
                  <span>Last Updated:</span>
                  <span>{new Date(selectedApplication.updated_at).toLocaleString()}</span>
                </div>
                {selectedApplication.driver_license_id && (
                  <div className="status-detail">
                    <span>Driver License:</span>
                    <span className="status-complete">Uploaded</span>
                  </div>
                )}
                {selectedApplication.title_doc_id && (
                  <div className="status-detail">
                    <span>Title Document:</span>
                    <span className="status-complete">Uploaded</span>
                  </div>
                )}
                {selectedApplication.status === 'Completed' && selectedApplication.pdf_url && (
                  <div className="status-detail">
                    <span>Document:</span>
                    <a
                      href={selectedApplication.pdf_url}
                      className="download-link"
                      download={`application_${selectedApplication.application_display_id}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </a>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  onClick={() => {
                    handleContinue(selectedApplication);
                    setShowStatusModal(false);
                  }}
                  className="modal-button"
                  disabled={selectedApplication.status === "application_complete"}
                >
                  {selectedApplication.status === "application_complete"
                    ? "Application Completed"
                    : "Continue Application"}     
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="profile-footer">
          <button 
            onClick={() => navigate("/forgot-password")}
            className="footer-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Reset Password
          </button>
          <button 
            onClick={handleLogout}
            className="footer-button logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}