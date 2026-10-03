import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchCertificates = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/certificates", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch certificates");
        }

        setCertificates(data.certificates);
      } catch (error) {
        console.error("Fetch certificates error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [navigate]);

  const totalCertificates = certificates.length;

  const verifiedCertificates = certificates.filter(
    (certificate) => certificate.status === "Verified",
  ).length;

  const pendingCertificates = certificates.filter(
    (certificate) => certificate.status === "Pending",
  ).length;

  const handleViewCertificate = async (certificateId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/certificates/${certificateId}/file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to open certificate");
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("View certificate error:", error);
      setError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Certify Me</h1>
          <p>Certificate Management Portal</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h2>Welcome, {user?.name || "User"}!</h2>

          <p>Manage and track your certificates from one place.</p>
        </section>

        {error && <p className="form-error">{error}</p>}

        <section className="stats-container">
          <div className="stat-card">
            <h3>Total Certificates</h3>
            <p>{totalCertificates}</p>
          </div>

          <div className="stat-card">
            <h3>Verified</h3>
            <p>{verifiedCertificates}</p>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <p>{pendingCertificates}</p>
          </div>
        </section>

        <section className="dashboard-actions">
          <Link to="/upload" className="dashboard-button">
            Upload Certificate
          </Link>
        </section>

        <section className="certificate-section">
          <h2>Your Certificates</h2>

          {loading ? (
            <p>Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p>No certificates uploaded yet.</p>
          ) : (
            <div className="certificate-list">
              {certificates.map((certificate) => (
                <div className="certificate-card" key={certificate._id}>
                  <h3>{certificate.title}</h3>

                  <p>
                    <strong>Issuer:</strong> {certificate.issuer}
                  </p>

                  <p>
                    <strong>Issue Date:</strong>{" "}
                    {new Date(certificate.issueDate).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Status:</strong> {certificate.status}
                  </p>

                  <button
                    onClick={() => handleViewCertificate(certificate._id)}
                    className="dashboard-button"
                  >
                    View Certificate
                  </button>

                  {certificate.description && (
                    <p>
                      <strong>Description:</strong> {certificate.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
