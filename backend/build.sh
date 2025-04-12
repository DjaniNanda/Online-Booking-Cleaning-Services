#!/bin/bash
set -o errexit

# Change to the backend directory
cd "$(dirname "$0")"

# Now we can find requirements.txt in the current directory
pip install -r requirements.txt

# Run Django commands
python manage.py collectstatic --no-input
python manage.py migrate