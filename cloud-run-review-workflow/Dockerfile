# Python 3.11 slim image
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python app code
COPY . .

# Cloud Run expects PORT env variable
ENV PORT 8080

# Use Gunicorn to serve Flask app
CMD ["gunicorn", "--bind", ":8080", "--workers", "1", "--threads", "8", "--timeout", "0", "main:app"]
