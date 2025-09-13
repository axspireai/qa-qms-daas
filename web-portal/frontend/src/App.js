import React, { useEffect, useState } from "react";
import { getDocuments, reviewDocument } from "./api";

function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents from backend
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setDocuments([]);
    }
    setLoading(false);
  };

  // Handle approve/reject actions
  const handleAction = async (documentName, action) => {
    const reviewerEmail = prompt("Enter your email:");
    const reviewerName = prompt("Enter your name:");
    if (!reviewerEmail || !reviewerName) {
      alert("Email and name are required!");
      return;
    }
    try {
      await reviewDocument(documentName, action, reviewerEmail, reviewerName);
      fetchDocuments();
    } catch (err) {
      console.error(`Failed to ${action} document:`, err);
      alert(`Failed to ${action} document. Check console for details.`);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) return <div>Loading documents...</div>;

  if (!documents.length) return <div>No documents found.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>QA/QMS Document Review</h1>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Status</th>
            <th>Reviewers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.document_name}>
              <td>{doc.document_name}</td>
              <td>{doc.status}</td>
              <td>
                {doc.reviewers && doc.reviewers.length
                  ? doc.reviewers.join(", ")
                  : "-"}
              </td>
              <td>
                {doc.status === "Review Pending" || doc.status === "uploaded" ? (
                  <>
                    <button
                      onClick={() => handleAction(doc.document_name, "approve")}
                      style={{ marginRight: "5px" }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(doc.document_name, "reject")}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
