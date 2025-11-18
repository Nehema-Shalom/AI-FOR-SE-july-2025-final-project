from flask import Flask, render_template, request, jsonify
import random
import spacy

# Initialize Flask App
app = Flask(__name__)
# Initialize Spacy (Note: this is a simple text classifier)
nlp = spacy.load("en_core_web_sm")

# Dictionary of pre-defined responses
responses = {
    "greetings": [
        "Hey there beautiful 💖 How are you feeling today?",
        "Hi love 🌸 I’m here to listen, what’s on your heart?",
        "Hello sweet soul 💕 you’re safe here, talk to me."
    ],
    "sadness": [
        "I'm sorry you're feeling down. Remember, it's okay to feel sad sometimes. I'm here for you.",
        "It's tough to go through hard times. Take your time, and know that you're not alone.",
        "Sending you a big virtual hug 🤗. You're stronger than you think."
    ],
    "Happiness": [
        "That's wonderful to hear! Keep shining your light 🌟.",
        "Wow, that's amazing! I'm so happy for you 😊.",
        "Yay! Celebrate your joy and spread the happiness around 🎉."
    ],
    "Anger": [
        "It's okay to feel angry sometimes. Take a deep breath and try to find a healthy way to express it.",
        "Remember, anger is a natural emotion. Let's work through it together.",
        "Try to channel your anger into something positive, like exercise or creative activities."
    ],
    "encouragement": [
        "You are capable of amazing things! Keep pushing forward 💪.",
        "Believe in yourself and all that you are. You have the strength to overcome any challenge.",
        "Every step you take is a step closer to your goals. Keep going, you're doing great!"
    ],
    "Help": [
        "It’s so brave of you to reach out 💖. You can contact the Kenya GBV helpline at **1195** (it’s free and 24/7).",
        "I can share some healing resources or hotlines with you 🌷 — would you like that?",
        "Help is always available, darling. You are never alone ❤️."
    ],
    "default": [
        "I'm here to listen. Tell me more about how you're feeling.",
        "Hey, it's okay to share your thoughts with me. I'm here for you.",
        "I'm here for you, no matter what. Share your thoughts with me."
    ]
}


def analyze_emotion(user_input):
    text = user_input.lower()
    # Spacy is loaded but not strictly needed for this keyword-based logic,
    # but we keep the structure for future NLP enhancements.
    # doc = nlp(user_input) 

    if any(word in text for word in ["hi", "hello", "hey", "greetings"]):
        return "greetings"
    elif any(word in text for word in ['sad', 'unhappy', 'depressed', 'alone', 'tired']):
        return "sadness"
    elif any(word in text for word in ['happy', 'joyful', 'excited']):
        return "Happiness"
    elif any(word in text for word in ['angry', 'furious', 'irritated']):
        return "Anger"
    elif any(word in text for word in ['help', 'support', 'hotline', 'contact', 'crisis']):
        return "Help"
    else:
        return "default"


@app.route("/")
def main():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/stories")
def stories():
    return render_template("stories.html")

@app.route("/resources")
def resources():
    return render_template("resources.html")

@app.route("/hotline")
def hotline():
    return render_template("hotline.html")

@app.route("/faqs")
def faqs():
    return render_template("faqs.html")


@app.route("/chat", methods=['POST'])
def chat():
    # Use request.json for cleaner JSON handling from the client
    data = request.json
    
    if not data or 'message' not in data:
        # Client did not send valid JSON or missed the 'message' key
        return jsonify({"error": "Invalid input: Missing 'message' in JSON body"}), 400
    
    user_message = data['message']

    # 1. Analyze the user message
    emotion = analyze_emotion(user_message)
    
    # 2. Select a random response based on the detected emotion
    # Use .get() with a default to prevent key errors
    response_text = random.choice(responses.get(emotion, responses['default']))

    # 3. CRITICAL FIX: Return a JSON response with the generated text
    return jsonify({
        "response": response_text,
        "emotion_detected": emotion
    })


if __name__ == "__main__":
    app.run(debug=True)