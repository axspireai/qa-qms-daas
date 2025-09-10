FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY . .

# Cloud Run expects PORT environment variable
ENV PORT 8080

# Run the Flask app
CMD ["python", "main.py"]
