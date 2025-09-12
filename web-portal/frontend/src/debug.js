import { getDocuments } from "./api";

async function debugDocuments() {
  try {
    const docs = await getDocuments();
    console.log("API returned documents:", docs);
  } catch (err) {
    console.error("Error fetching documents:", err);
  }
}

// Run the debug function immediately
debugDocuments();

// Optionally, expose to window to call from console
window.debugDocuments = debugDocuments;
