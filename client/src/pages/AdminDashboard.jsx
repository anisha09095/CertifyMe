import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
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
        const response = await fetch(
          "http://localhost:5000/api/certificates/admin",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch certificates");
        }

        setCertificates(data.certificates);
      } catch (error) {
        console.error("Admin fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [navigate]);

  const handleVerify = async (certificateId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/certificates/admin/${certificateId}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify certificate");
      }

      setCertificates((currentCertificates) =>
        currentCertificates.map((certificate) =>
          certificate._id === certificateId
            ? { ...certificate, status: "Verified" }
            : certificate,
        ),
      );
    } catch (error) {
      console.error("Verify certificate error:", error);
      setError(error.message);
    }
  };

  const handleReject = async (certificateId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/certificates/admin/${certificateId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject certificate");
      }

      setCertificates((currentCertificates) =>
        currentCertificates.map((certificate) =>
          certificate._id === certificateId
            ? { ...certificate, status: "Rejected" }
            : certificate,
        ),
      );
    } catch (error) {
      console.error("Reject certificate error:", error);
      setError(error.message);
    }
  };

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

  const pendingCertificates = certificates.filter(
    (certificate) => certificate.status === "Pending",
  ).length;

  const verifiedCertificates = certificates.filter(
    (certificate) => certificate.status === "Verified",
  ).length;

  const rejectedCertificates = certificates.filter(
    (certificate) => certificate.status === "Rejected",
  ).length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Certify Me</h1>
          <p>Admin Verification Portal</p>
        </div>

        <div>
          <button onClick={() => navigate("/dashboard")}>User Dashboard</button>

          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h2>Welcome, {user?.name || "Admin"}!</h2>
          <p>Review and manage certificate submissions from all users.</p>
        </section>

        {error && <p className="form-error">{error}</p>}

        <section className="stats-container">
          <div className="stat-card">
            <h3>Total Certificates</h3>
            <p>{certificates.length}</p>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <p>{pendingCertificates}</p>
          </div>

          <div className="stat-card">
            <h3>Verified</h3>
            <p>{verifiedCertificates}</p>
          </div>

          <div className="stat-card">
            <h3>Rejected</h3>
            <p>{rejectedCertificates}</p>
          </div>
        </section>

        <section className="certificate-section">
          <h2>Certificate Submissions</h2>

          {loading ? (
            <p>Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p>No certificate submissions found.</p>
          ) : (
            <div className="certificate-list">
              {certificates.map((certificate) => (
                <div className="certificate-card" key={certificate._id}>
                  <h3>{certificate.title}</h3>

                  <p>
                    <strong>Student:</strong>{" "}
                    {certificate.userId?.name || "Unknown"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {certificate.userId?.email || "Unknown"}
                  </p>

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
                    className="view-button"
                  >
                    View Certificate
                  </button>

                  {certificate.status === "Pending" && (
                    <button
                      onClick={() => handleVerify(certificate._id)}
                      className="verify-button"
                    >
                      Verify Certificate
                    </button>
                  )}

                  {certificate.status === "Pending" && (
                    <button
                      onClick={() => handleReject(certificate._id)}
                      className="reject-button"
                    >
                      Reject Certificate
                    </button>
                  )}

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

export default AdminDashboard;
