import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const idCategories = [
  {
    title: "U.S. Driver License/ID Card",
    description: "Individual • Business • Government • Trust • Non-Profit",
  },
  {
    title: "Military/Government",
    description:
      "NATO ID • U.S. Dept. of State ID • U.S. Military ID • U.S. Dept. of Homeland Security ID",
  },
  { title: "Passport", description: "U.S. Passport • Foreign Passport" },
  {
    title: "Immigration",
    description: "U.S. Citizenship & Immigration Services/DOJ ID",
  },
  { title: "Other", description: "Other Military Status of Forces Photo ID" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedIdType, setSelectedIdType] = useState("");

  return (
    <div className="home-wrapper">
      {/* ─── Top App Bar ─── */}
      <header className="app-bar">
        <div className="inner">
          <div className="app-title-group">
            <h1>Texas Auto Title Portal</h1>
            <p>Department of Motor Vehicles – Title Processing Center</p>
          </div>
          <div className="progress-widget">
            <div className="label">Overall Progress</div>
            <div className="value">0%</div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="main-content">
        <div className="container">
          {/* 2) Required Forms */}
          <section className="section">
            <div className="section-header-ocr">
              <span className="icon">📄</span>
              <h2>Required Forms</h2>
            </div>
            <div className="form-card-ocr">
              <div className="form-card-content">
                <span className="status-icon">⚠️</span>
                <div>
                  <h3>
                    Application for Texas Certificate of Title (Form 130-U)
                  </h3>
                  <p>Primary application form for vehicle title transfer</p>
                  <p className="meta">Estimated time: 15 minutes</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="status-badge pending">Pending</span>
                <button
                  onClick={() => navigate("/ocr")}
                  className="start-button"
                >
                  Start Form →
                </button>
              </div>
            </div>
          </section>

          {/* 3) Required Document Checklist */}
          <section className="section">
            <div className="section-header">
              <span className="icon">🛡️</span>
              <h2>Required Document Checklist</h2>
            </div>

            {/* a) Texas Certificate of Title */}
            <div className="checklist-item">
              <span className="checklist-icon">📄</span>
              <div className="checklist-item-content">
                <h4>Texas Certificate of Title</h4>
                <p>
                  Current vehicle title or Manufacturer’s Statement of Origin
                  (MSO) for new vehicles
                </p>
              </div>
            </div>

            {/* b) Identification with dropdown */}
            <div className="checklist-item">
              <span className="checklist-icon">👤</span>
              <div className="checklist-item-content">
                <h4>Identification</h4>
                <p>Valid photo identification – see acceptable ID types below</p>
                <div className="id-dropdown" style={{ marginTop: "0.75rem" }}>
                  <label htmlFor="id-type-select">Acceptable Photo ID Types</label>
                  <select
                    id="id-type-select"
                    value={selectedIdType}
                    onChange={(e) => setSelectedIdType(e.target.value)}
                  >
                    <option value="">Select acceptable ID type…</option>
                    {idCategories.map((c) => (
                      <option key={c.title} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* c) Driver’s License */}
            <div className="checklist-item">
              <span className="checklist-icon">🛡️</span>
              <div className="checklist-item-content">
                <h4>Driver’s License</h4>
                <p>
                  Valid Texas driver’s license or state-issued ID card
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
