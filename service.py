from flask import Flask, request, jsonify
from main import respond

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate_response():
    data = request.json
    context = "\n".join([c['content'] for c in data.get('context', [])])
    prompt = f"Previous conversations:\n{context}\n\nNew email: {data['text']}"
    
    return jsonify({
        'text': your_ai_library.generate(prompt),
        'context_id': len(data['context'])
    })
