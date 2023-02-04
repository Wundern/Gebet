from functools import wraps
import json
from os import environ as env
from werkzeug.exceptions import HTTPException
from urllib.parse import quote_plus, urlencode

from dotenv import load_dotenv, find_dotenv
from flask import Flask
from flask import jsonify
from flask import redirect
from flask import render_template
from flask import session
from flask import url_for
from authlib.integrations.flask_client import OAuth
from six.moves.urllib.parse import urlencode

from authlib.integrations import flask_client
from authlib.integrations.base_client.errors import OAuthError

app = Flask(__name__)
app.secret_key = 'cb5f8796c95d1156b9cbb1ae82d4bc0e9308ae09e921c1c7cb6fc2f95e6d4fbb'

oauth = OAuth(app)

def fetch_token(name, request):
        token = OAuth2Token.find(
            name=name,
            user=request.user
        )
        return token.to_token()

oauth.register(
    'auth0',
    client_id='CTXmyHPD0VJVzl3Co37idV5T0kRa0dj2',
    client_secret='n6SsiY1u0KVvBCnQ1E8TFu9T8eDugg6j9494YTkxnBZP3Yy_PewmmuQj0h5uST7z',
    api_base_url='https://wunder-willen.jp.auth0.com',
    access_token_url='https://wunder-willen.jp.auth0.com/oauth/token',
    authorize_url='https://wunder-willen.jp.auth0.com/authorize',
    client_kwargs={
        'scope': 'openid profile email',
    },
    server_metadata_url='https://wunder-willen.jp.auth0.com/.well-known/openid-configuration',
    fetch_token=fetch_token,
)   

@app.route('/callback', methods=["GET", "POST"])
def callback_handling():
    # Handles response from token endpoint
    token = oauth.auth0.authorize_access_token()
    session["user"] = token
    
    resp = oauth.auth0.get('userinfo')
    userinfo = resp.json()

    # Store the user information in flask session.
    session['jwt_payload'] = userinfo
    session['profile'] = {
        'user_id': userinfo['sub'],
        'name': userinfo['name'],
        'picture': userinfo['picture']
    }
    return render_template('dashboard.html',
                           userinfo=session['profile'],
                           userinfo_pretty=json.dumps(session['jwt_payload'], indent=4))
    # return redirect('/dashboard')
    # return redirect('/')


@app.route('/login')
def login():
    #return auth0.authorize_redirect(redirect_uri='com.auth0.gebet://login-callback')
    return oauth.auth0.authorize_redirect(redirect_uri='https://f304-240f-34-2d24-1-aca5-6fc8-7ad5-e6be.jp.ngrok.io/callback')

@app.route('/')
def home():
    return render_template('home.html')



def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'profile' not in session:
            # Redirect to Login page here
            return redirect('/')
        return f(*args, **kwargs)

    return decorated

@app.route('/dashboard')
@requires_auth
def dashboard():
    return render_template('dashboard.html',
                           userinfo=session['profile'],
                           userinfo_pretty=json.dumps(session['jwt_payload'], indent=4))

@app.route('/logout')
def logout():
    # Clear session stored data
    session.clear()
    # Redirect user to logout endpoint
    params = {'returnTo': url_for('home', _external=True, _scheme='https',), 'client_id': 'CTXmyHPD0VJVzl3Co37idV5T0kRa0dj2'}
    return redirect(oauth.auth0.api_base_url + '/v2/logout?' + urlencode(params))

if __name__ == "__main__":
    app.run(debug=False, threaded=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
