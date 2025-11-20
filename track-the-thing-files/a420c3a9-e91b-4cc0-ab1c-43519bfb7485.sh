#!/bin/bash

# Find and stop vLLM server processes

# Find vLLM processes
VLLM_PIDS=$(pgrep -f "vllm serve")

if [ -z "$VLLM_PIDS" ]; then
    echo "No vLLM server processes found."
else
    echo "Found vLLM server process(es): $VLLM_PIDS"
    echo "Stopping vLLM server..."

    # Kill the processes
    kill $VLLM_PIDS

    # Wait a moment and check if they stopped
    sleep 2

    # Check if any are still running and force kill if needed
    REMAINING=$(pgrep -f "vllm serve")
    if [ -n "$REMAINING" ]; then
        echo "Force stopping remaining processes: $REMAINING"
        kill -9 $REMAINING
    fi

    echo "vLLM server stopped."
fi