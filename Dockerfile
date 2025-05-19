# Use Python as base image
FROM python:3.9

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install dependencies
RUN npm install
RUN pip install -r requirements.txt

# Copy application files
COPY . .

# Build Next.js application
RUN npm run build

# Expose ports
EXPOSE 3000 8000

# Start both Next.js and FastAPI servers
CMD ["sh", "-c", "npm start & uvicorn src.api.neuralcdm_api:app --host 0.0.0.0 --port 8000"] 