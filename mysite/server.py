
# A very simple Flask Hello World app for you to get started with...

from flask import Flask, render_template,request,Response,jsonify
from werkzeug import secure_filename
import uuid

app = Flask(__name__)

@app.route('/',methods= ['GET'])
def index():
    return render_template('index.html')


@app.route('/load_mtl',methods= ['POST'])
def load_mtl():
    f = request.files["file"]

    unique_filename = str(uuid.uuid4())
    name="mysite/static/mtl/"+unique_filename

    f.save(name)
    return jsonify({"name":name.replace("mysite","")})


@app.route('/load_obj',methods= ['POST'])
def load_obj():
    f = request.files["file"]

    unique_filename = str(uuid.uuid4())
    name="mysite/static/obj/"+unique_filename

    f.save(name)
    return jsonify({"name":name.replace("mysite","")})






