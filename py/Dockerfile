FROM python:3.10-slim
RUN pip install --upgrade pip
COPY . /app
WORKDIR /app
RUN pip install --no-cache-dir -r  requirements.txt

ENV PORT 8080


CMD [ "uvicorn", "main:app", "--reload","--host", "0.0.0.0", "--port", "8080"]