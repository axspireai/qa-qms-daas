from flask import Flask, request
from google.cloud import documentai_v1 as documentai
from google.cloud import firestore, pubsub_v1
import json, base64, os

# Initialize Flask app
app = Flask(__name__)

# Firestore client
db = firestore.Client()

# Pub/Sub publisher
publisher = pubsub_v1.PublisherClient()

# Project ID and review topic
PROJECT_ID = os.environ.get("GCP_PROJECT", "qa-qms-daas")
review_topic = publisher.topic_path(PROJECT_ID, "review-required")

# Document AI processor name (use your actual processor ID)
PROCESSOR_NAME = os.environ.get(
    "PROCESSOR_NAME",
    "projects/qa-qms-daas/locations/us/processors/236690020d3b6944"
)


@app.route("/", methods=["POST"])
def pubsub_listener():
    """Receive Pub/Sub messages and process documents with Document AI."""
    envelope = request.get_json()
    if not envelope or "message" not in envelope:
        return "Invalid Pub/Sub message", 400

    pubsub_message = base64.b64decode(envelope["message"]["data"]).decode("utf-8")
    message_json = json.loads(pubsub_message)

    bucket = message_json.get("bucket")
    name = message_json.get("name")
    if not bucket or not name:
        return "Missing bucket or file name", 400

    # Document AI processing
    client = documentai.DocumentProcessorServiceClient()
    raw_doc = documentai.RawDocument(
        gcs_uri=f"gs://{bucket}/{name}",
        mime_type="application/pdf"
    )
    try:
        result = client.process_document(
            request=documentai.ProcessRequest(
                name=PROCESSOR_NAME,
                raw_document=raw_doc
            )
        )
        text = result.document.text
    except Exception as e:
        return f"Document AI error: {str(e)}", 500

    # Store metadata in Firestore
    db.collection("documents").document(name).set({
        "document_name": name,
        "gcs_path": f"gs://{bucket}/{name}",
        "text": text,
        "status": "Uploaded"
    })

    # Publish message to review workflow
    future = publisher.publish(
        review_topic,
        json.dumps({"document_name": name}).encode("utf-8")
    )
    future.result()  # Ensure the message is published

    return "Processed", 200


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint for Cloud Run."""
    return "OK", 200


# Start Flask app (Cloud Run requires binding to PORT)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
