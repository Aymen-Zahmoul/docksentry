FROM python:3.11
WORKDIR /app
COPY . .
EXPOSE 22
CMD ["python", "app.py"]
