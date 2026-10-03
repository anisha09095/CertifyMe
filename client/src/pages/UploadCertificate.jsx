import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function UploadCertificate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    issueDate: "",
    description: "",
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFormData({
      ...formData,
      [id]: value,
    });

    setError("");
    setMessage("");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.title.trim()) {
      setError("Please enter the certificate title.");
      return;
    }

    if (!formData.issuer.trim()) {
      setError("Please enter the issuing organization.");
      return;
    }

    if (!formData.issueDate) {
      setError("Please select the issue date.");
      return;
    }

    if (!file) {
      setError("Please select a certificate file.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const data = new FormData();

    data.append("title", formData.title);
    data.append("issuer", formData.issuer);
    data.append("issueDate", formData.issueDate);
    data.append("description", formData.description);
    data.append("certificate", file);

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/certificates/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed.");
      }

      setMessage("Certificate uploaded successfully!");

      setFormData({
        title: "",
        issuer: "",
        issueDate: "",
        description: "",
      });

      setFile(null);

      document.getElementById("certificate").value = "";

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Certificate upload error:", error);
      setError(error.message || "Unable to upload certificate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="login-container">
        <div className="brand-section">
          <h1>Certify Me</h1>
          <h2>Certificate Management Portal</h2>
        </div>

        <div className="login-card">
          <h2>Upload Certificate</h2>

          <p className="login-subtitle">
            Add your certificate to manage it securely
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Certificate Title</label>

              <input
                type="text"
                id="title"
                placeholder="e.g. Java Certification"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="issuer">Issuing Organization</label>

              <input
                type="text"
                id="issuer"
                placeholder="e.g. Oracle"
                value={formData.issuer}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="issueDate">Issue Date</label>

              <input
                type="date"
                id="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                placeholder="Enter certificate description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="certificate">Certificate File</label>

              <input
                type="file"
                id="certificate"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            {message && <p className="form-success">{message}</p>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Uploading..." : "Upload Certificate"}
            </button>
          </form>

          <p className="register-text">
            <Link to="/dashboard" className="register-link">
              ← Back to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default UploadCertificate;
