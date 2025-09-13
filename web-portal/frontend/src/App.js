import React, { useEffect, useState } from "react";
import { getDocuments, reviewDocument } from "./api";

function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments();
      console.log("📦 API raw response:", docs); // Debugging
      // Ensure it's always an array
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
      setDocuments([]); // fallback to empty
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (docId, action) => {
    const reviewerEmail = prompt("Enter your email:");
    const reviewerName = prompt("Enter your name:");
    if (!reviewerEmail || !reviewerName) return;

    try {
      await reviewDocument(docId, action, reviewerEmail, reviewerName);
      fetchDocuments();
    } catch (err) {
      console.error("❌ Error submitting review:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>QA/QMS Document Review</h1>

      {documents.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Document</th>
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
                <td>{doc.reviewers ? doc.reviewers.join(", ") : "-"}</td>
                <td>
                  {doc.status === "Review Pending" || doc.status === "Uploaded" ? (
                    <>
                      <button onClick={() => handleAction(doc.document_name, "approve")}>
                        Approve
                      </button>
                      <button onClick={() => handleAction(doc.document_name, "reject")}>
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
      )}
    </div>
  );
}

export default App;
