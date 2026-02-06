FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY . .

RUN uv pip install --system --no-cache .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]