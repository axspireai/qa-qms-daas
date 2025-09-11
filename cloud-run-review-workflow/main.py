from flask import Flask, request, jsonify
from google.cloud import firestore
import os

app = Flask(__name__)

# Firestore init
project_id = os.getenv("FIRESTORE_PROJECT", "qa-qms-daas")
db = firestore.Client(project=project_id)

@app.route("/documents", methods=["GET"])
def list_documents():
    docs_ref = db.collection("documents").stream()
    docs = []
    for d in docs_ref:
        doc = d.to_dict()
        doc["document_name"] = d.id
        docs.append(doc)
    return jsonify(docs)

@app.route("/documents/<doc_id>/review", methods=["POST"])
def review_document(doc_id):
    data = request.json
    action = data.get("action")
    reviewer_email = data.get("reviewer_email")
    reviewer_name = data.get("reviewer_name")

    doc_ref = db.collection("documents").document(doc_id)
    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({"error": "Document not found"}), 404

    update_data = {
        "status": "Approved" if action == "approve" else "Rejected",
        "reviewers": firestore.ArrayUnion([f"{reviewer_name} <{reviewer_email}>"])
    }
    doc_ref.update(update_data)

    return jsonify({"message": f"Document {action}d successfully"})

@app.route("/")
def home():
    return "QA-QMS Review Workflow Backend 🚀"
