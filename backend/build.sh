#!/usr/bin/env bash
set -o errexit

# Print current directory for debugging
echo "Starting in directory: $(pwd)"

# Change to the directory containing the script
cd "$(dirname "$0")"
echo "Changed to directory: $(pwd)"

# Install dependencies
pip install -r requirements.txt

# Run Django commands
python manage.py collectstatic --no-input
python manage.py migrate

# Start the server with the correct path
# If manage.py is in the root directory:
exec gunicorn --worker-class=uvicorn.workers.UvicornWorker asgi:application

# Alternative: If manage.py is in a subdirectory called 'backend':
# cd backend
# exec gunicorn --worker-class=uvicorn.workers.UvicornWorker asgi:application