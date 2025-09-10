from flask import Flask, request
from google.cloud import documentai_v1 as documentai
from google.cloud import firestore, pubsub_v1
import json, base64, os

app = Flask(__name__)
db = firestore.Client()
publisher = pubsub_v1.PublisherClient()
review_topic = publisher.topic_path(os.environ['GCP_PROJECT'], "review-required")

# Use environment variable for processor name
PROCESSOR_NAME = os.environ.get("PROCESSOR_NAME")

@app.route("/", methods=["POST"])
def pubsub_listener():
    envelope = request.get_json()
    if not envelope or 'message' not in envelope:
        return "No Pub/Sub message", 400

    pubsub_message = base64.b64decode(envelope['message']['data']).decode('utf-8')
    message_json = json.loads(pubsub_message)
    bucket = message_json['bucket']
    name = message_json['name']

    # Document AI processing
    client = documentai.DocumentProcessorServiceClient()
    document = {"uri": f"gs://{bucket}/{name}"}
    request_doc = {"name": PROCESSOR_NAME, "raw_document": document}
    result = client.process_document(request=request_doc)
    text = result.document.text

    # Store metadata in Firestore
    db.collection('documents').document(name).set({
        'document_name': name,
        'text': text,
        'status': 'Uploaded'
    })

    # Publish message to review workflow
    publisher.publish(review_topic, json.dumps({'document_name': name}).encode('utf-8'))
    return "Processed", 200

# --- Start Flask on the port Cloud Run expects ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
