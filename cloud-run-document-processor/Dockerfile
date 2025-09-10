FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps (Firestore / PubSub / Document AI need grpc + build tools)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Cloud Run will inject PORT, but default to 8080
ENV PORT=8080

# Run Flask (use gunicorn for production stability)
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
