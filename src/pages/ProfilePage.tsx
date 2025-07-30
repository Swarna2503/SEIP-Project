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

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   if (!user?.user_id) return;

  //   async function fetchData() {
  //     if (!user || !user.user_id) return;

  //     const draftRes = await getDraftApplications(user.user_id);
  //     if (draftRes.ok && Array.isArray(draftRes.data)) {
  //       setDrafts(draftRes.data);
  //     }

  //     const historyRes = await getApplicationHistory(user.user_id);
  //     if (historyRes.ok && Array.isArray(historyRes.data)) {
  //       setHistory(historyRes.data);
  //     }

  //     setLoading(false);
  //   }

  //   fetchData();
  // }, [user]);

  useEffect(() => {
    if (!user?.user_id) return;

    async function fetchData() {
      if (!user || !user.user_id) return;

      const draftRes = await getDraftApplications(user.user_id);
      console.log("DEBUG drafts raw:", draftRes.data);   // ← 在这里打印
      // 先检查 ok 且 data 是数组
      if (draftRes.ok && Array.isArray(draftRes.data)) {
        // 这里用 item 而不是 d，避免报 undefined
        console.table(
          draftRes.data.map(item => ({
            displayId: item.application_display_id,
            driverLicense: item.driver_license_id,
            titleDoc: item.title_doc_id,
          }))
        );

        setDrafts(draftRes.data);
      }
      if (draftRes.ok && Array.isArray(draftRes.data)) {
        setDrafts(draftRes.data);
      }

      const historyRes = await getApplicationHistory(user.user_id);
      if (historyRes.ok && Array.isArray(historyRes.data)) {
        setHistory(historyRes.data);
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


  const handleContinue = (applicationId: string) => {
    navigate("/ocr", { state: { applicationId } });
  };

  const handleNew = async () => {
    if (!user?.user_id) return;
    const res = await createApplication(user.user_id);
    if (res.ok && res.data?.application_id) {
      navigate("/ocr", { state: { applicationId: res.data.application_id } });
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) logout();
  };

  if (!user) return <p>Please log in to view your profile.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-wrapper">
      <h1>👤 Profile</h1>
      <button onClick={() => navigate("/")} className="back-home-button">🏠 Back to Home</button>


      {/* Basic Info */}
      <div className="profile-section">
        <h2>Basic Information</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.user_id}</p>
      </div>

      {/* Create New */}
      <div className="profile-section">
        <button onClick={handleNew}>📝 Create New Application</button>
      </div>

      {/* All Drafts */}
      <div className="profile-section">
        <h2>Current Draft Applications</h2>
        {drafts.length > 0 ? (
          drafts.map((app, idx) => (
            <div key={idx} className="draft-card">
              <p><strong>ID:</strong> {app.application_display_id}</p>
              <p><strong>Created:</strong> {app.created_at ? new Date(app.created_at).toLocaleString() : "N/A"}</p>
              <p><strong>Last Updated:</strong> {app.updated_at ? new Date(app.updated_at).toLocaleString() : "N/A"}</p>
              <p><strong>Applicant Name:</strong> {app.full_name || "N/A"}</p>
              <p><strong>Driver License:</strong> {app.driver_license_id ? "📄 Uploaded" : "❌ Missing"}</p>
              <p><strong>Title Document:</strong> {app.title_doc_id ? "📄 Uploaded" : "❌ Missing"}</p>
              <button onClick={() => handleContinue(app.application_id)}>🚗 Continue</button>
              <button onClick={() => handleDelete(app.application_id)} style={{ marginLeft: "1rem", color: "red" }}>
                🗑️ Delete
              </button>
            </div>
          ))
        ) : (
          <p>No draft applications found.</p>
        )}
      </div>

      {/* History */}
      <div className="profile-section">
        <h2>History</h2>
        {history.length > 0 ? (
          <ul>
            {history.map((h, idx) => (
              <li key={idx}>
                ✔️ {h.application_display_id} - {h.status} - {new Date(h.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No past submitted applications.</p>
        )}
      </div>

      {/* Footer */}
      <div className="profile-section">
        <button onClick={() => navigate("/forgot-password")}>🔑 Reset Password</button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}
