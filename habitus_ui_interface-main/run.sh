#!/bin/bash

python -m uvicorn main:app &
serve frontend/build