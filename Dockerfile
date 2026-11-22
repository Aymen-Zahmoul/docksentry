# [DOCKSENTRY Hardened: Replaced bloated python:3.11 with minimal python:3.12-slim]
FROM python:3.12-slim
WORKDIR /app
COPY . .
EXPOSE 22
CMD ["python", "app.py"]
