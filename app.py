# Import Dependencies
from flask import Flask, render_template

# Create instance of Flask app
app = Flask(__name__)

# create route that renders index.html template
@app.route("/")
def index():
    return render_template("index.html")

# @app.route("/graph")
# def graph():
#     return render_template("index4.html")

if __name__ == "__main__":
    app.run(debug=True)