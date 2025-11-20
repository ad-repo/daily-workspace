if ! python3 -c "import vllm" &> /dev/null; then
    pip install vllm
fi


# vllm serve ./models/RedHatAI/Llama-3.3-70B-Instruct-FP8-dynamic \
#     --host 0.0.0.0 \
#     --port 8000 \
#     --served-model-name meta-llama/Llama-3.3-70B-Instruct \
#     --tensor-parallel-size=4 \
#     --distributed-executor-backend=mp \
#     --max-model-len=16000


# nohup vllm serve /models/RedHatAI/Llama-3.3-70B-Instruct \
#     --host 0.0.0.0 \
#     --port 8000 \
#     --served-model-name meta-llama/Llama-3.3-70B-Instruct \
#     --tensor-parallel-size=8 \
#     --distributed-executor-backend=mp \
#     --max-model-len=16000 \
#     >> vllm_server.log 2>&1 &


nohup vllm serve /models/RedHatAI/gpt-oss-120b \
    --host 0.0.0.0 \
    --port 8000 \
    --served-model-name teacher \
    --tensor-parallel-size=8 \
    --distributed-executor-backend=mp \
    --max-model-len=128000 \
    >> vllm_server.log 2>&1 &

# nohup vllm serve /models/RedHatAI/gpt-oss-120b \
#     --host 0.0.0.0 \
#     --port 8000 \
#     --served-model-name teacher \
#     --tensor-parallel-size=8 \
#     --distributed-executor-backend=mp \
#     --max-model-len=32000 \
#     >> vllm_server.log 2>&1 &


# nohup vllm serve /models/RedHatAI/gpt-oss-120b \
#     --host 0.0.0.0 \
#     --port 8000 \
#     --served-model-name teacher \
#     --tensor-parallel-size=4 \
#     --distributed-executor-backend=mp \
#     --max-model-len=16000 \
#     >> vllm_server.log 2>&1 &


# nohup vllm serve /models/RedHatAI/phi-4 \
#     --host 0.0.0.0 \
#     --port 8000 \
#     --served-model-name teacher \
#     --tensor-parallel-size=1 \
#     --distributed-executor-backend=mp \
#     --max-model-len=16000 \
#     >> vllm_server.log 2>&1 &

    