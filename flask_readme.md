# Import the Flask class from the flask library.
# This is the main component of any Flask application.
from flask import Flask

# Create an instance of the Flask class.
# '__name__' is a special Python variable that gives the name of the current module.
# Flask uses this to know where to look for resources like templates and static files.
app = Flask(__name__)

# This is a 'decorator'. It tells Flask that the function below it
# should be triggered when someone visits the main URL of our site ('/').
@app.route("/")
def hello_world():
  # This function simply returns the string "Hello, World!"
  # Flask will automatically turn this string into an HTTP response for the browser.
  return "Hello, World!"

# This block checks if the script is being run directly (and not imported).
# If it is, it starts the development server.
if __name__ == "__main__":
  # The app.run() method launches a local web server.
  # debug=True means the server will automatically restart when you save changes,
  # and it will show detailed error messages if something goes wrong.
  app.run(debug=True)