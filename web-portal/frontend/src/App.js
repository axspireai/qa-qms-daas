import React, { useEffect, useState } from "react";
import { getDocuments, reviewDocument } from "./api";

function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    const docs = await getDocuments();
    setDocuments(docs);
    setLoading(false);
  };

  const handleAction = async (docId, action) => {
    const reviewerEmail = prompt("Enter your email:");
    const reviewerName = prompt("Enter your name:");
    await reviewDocument(docId, action, reviewerEmail, reviewerName);
    fetchDocuments();
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>QA/QMS Document Review</h1>
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
          {documents.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No documents found.
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.document_name || doc.id}</td>
                <td>{doc.status}</td>
                <td>{doc.reviewers && doc.reviewers.length > 0 ? doc.reviewers.join(", ") : "-"}</td>
                <td>
                  {doc.status === "Review Pending" || doc.status === "uploaded" ? (
                    <>
                      <button onClick={() => handleAction(doc.id, "approve")}>
                        Approve
                      </button>
                      <button onClick={() => handleAction(doc.id, "reject")}>
                        Reject
                      </button>
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
