
# A very simple Flask Hello World app for you to get started with...

from flask import Flask, render_template,request,Response,jsonify
from werkzeug import secure_filename
import uuid
import datetime

DEBUG = False

app = Flask(__name__)

@app.route('/',methods= ['GET'])
def index():

    context = {
        'timestamp': datetime.datetime.utcnow().timestamp()
    }

    return render_template('index.html', **context)


@app.route('/load_mtl',methods= ['POST'])
def load_mtl():
    f = request.files["file"]

    unique_filename = str(uuid.uuid4())
    
    name="mysite/static/mtl/"+unique_filename

    if DEBUG:
        print('DEBUG')
        name="./static/mtl/"+unique_filename

    f.save(name)
    return jsonify({"name":name.replace("mysite","")})


@app.route('/load_obj',methods= ['POST'])
def load_obj():
    f = request.files["file"]

    unique_filename = str(uuid.uuid4())
    name="mysite/static/obj/"+unique_filename

    if DEBUG:
        name="./static/obj/"+unique_filename

    f.save(name)
    return jsonify({"name":name.replace("mysite","")})

if __name__ == '__main__':
    DEBUG=True
    app.run(host='0.0.0.0', port=8003, debug=False)






