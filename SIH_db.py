from flask import Flask, jsonify, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
app = Flask(__name__)
CORS(app,resources={r"/*": {"origins": "*"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///employees.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False



# Define a model for the database
'''
class User(db2.Model):
    id = db2.Column(db2.Integer, primary_key=True)
    username = db2.Column(db2.String(80), unique=True, nullable=False)
    password = db2.Column(db2.String(120), nullable=False)

with app.app_context():
    db2.create_all()
'''
db = SQLAlchemy(app)
lat=17.384384
long=78.353006

class Location(db.Model):
    #__bind_key__ = 'locations'  # Specifies the secondary database

    name = db.Column(db.String(100),primary_key=True, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    def to_dict(self):
        return {
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'description': self.description
        }

# Define a model for the database
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    position = db.Column(db.String(20), nullable=False)
    username = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(20), nullable=False)
    loc_name = db.Column(db.String(20),nullable=False)
    def __repr__(self):
        return f'<Employee {self.name}>'

    
    
def model_to_dict(model_instance):
    """Convert a SQLAlchemy model instance into a dictionary."""
    return {
        column.name: getattr(model_instance, column.name)
        for column in model_instance.__table__.columns
    }
    
    

class LogInOut(db.Model):
    sno= db.Column(db.Integer,primary_key=True,autoincrement=True)
    id = db.Column(db.Integer)
    dist =db.Column(db.DOUBLE, nullable=False)
    time = db.Column(db.DATETIME(),nullable=False)
    status = db.Column(db.BOOLEAN(),default=False)
    
    
@app.route('/LogInOut/<int:id>', methods=['GET'])
def get_previous_employee(id):
    latest_log = LogInOut.query.filter_by(id=id)\
                               .order_by(LogInOut.time.desc())\
                               .first()

    if latest_log is None:
        return jsonify({"error": "No logs found for this employee"}), 404
    #print(latest_log)
    #print(jsonify(model_to_dict(latest_log)))
    return jsonify(model_to_dict(latest_log)), 200

with app.app_context():
    
    #db.drop_all()  # Optionally drop all tables if you want a fresh start
    db.create_all()
    
    

  
@app.route('/')
def home():
    if 'username' in session:
        return   # Redirect to dashboard if logged in
    return 
    

@app.route('/login', methods=['POST'])
def login():
    #new_employee = Employee(id=1,name='abhinith', position='admin', username='admin', password='admin123')
    #db.session.add(new_employee)
    #db.session.add(new_login)
    
    #db.session.commit()
    
    data = request.get_json()
    username=data['username']
    password=data['password']
    user = Employee.query.filter_by(username=username).first()
    #print(user)
    #print(username,password,user.password)
    
    if user and check_password_hash(user.password, password):
        return jsonify({'message': 'login successful'}), 200 if username == 'admin' else 202
    else:
        
        return jsonify({'message': 'login unsuccessful'}), 306
    
@app.route('/login', methods=['GET'])
def get_login():
    
    
    data = request.get_json()
    username=data['username']
    password=data['password']
    user = Employee.query.filter_by(username=username).first()
    #print(username,password,user.password)
    
    if user and check_password_hash(user.password, password):
        return jsonify({'message': 'login successful'}), 200 if username == 'admin' else 202
    else:
        
        return jsonify({'message': 'login unsuccessful'}), 306

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('home'))

@app.route('/Location', methods=['POST'])
def add_location():
    # Extracting form data
    data = request.get_json()


    # Simulating saving to a database
    # You can replace this with actual database logic
    new_employee = Location(name=data['name'], latitude=data['latitude'],longitude=data['longitude'],description=data['description'])#to be changed
    #print(type(time))

    db.session.add(new_employee)
    db.session.commit()

    # Return a success message
    return jsonify({"message": "Location added successfully!"}), 200

@app.route('/Location/<string:name>', methods=['DELETE'])
def delete_location(name):
    # Query to get the specific location by id
    location = Location.query.get(name)

    if location is None:
        return jsonify({"error": "Location not found"}), 404

    # Delete the location
    db.session.delete(location)
    db.session.commit()

    # Return a success message
    return jsonify({"message": "Location deleted successfully!"}), 200


@app.route('/Location', methods=['GET'])
def get_locations():
    # Query all locations from the database
    locations = Location.query.all()

    # Convert the list of Location objects to a list of dictionaries
    locations_data = [location.to_dict() for location in locations]

    # Return the data as JSON
    return jsonify(locations_data), 200

@app.route('/Location/<string:name>', methods=['GET'])
def get_location(name):
    # Query the specific location by name from the database
    location = Location.query.filter_by(name=name).first()

    if location is None:
        return jsonify({"error": "Location not found"}), 404

    # Convert the Location object to a dictionary
    location_data = {
        "name": location.name,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "description": location.description
    }

    # Return the data as JSON
    return jsonify(location_data), 200
'''
@app.route('/employees/location/<string:loc_name>', methods=['GET'])
def get_location(loc_name):
    # Query to get the specific employee by id
    #print(username)
    employee = Employee.query.filter_by(loc_name=loc_name).first()

    if employee is None:
        return jsonify({"error": "Employee not found"}), 404

    return jsonify(employee.loc_name), 200
'''


######################################################################
@app.route('/LogInOut', methods=['GET'])
def get_logins():
    new_login = LogInOut(id=1,dist=0,time=datetime.now(),status=True)
    db.session.add(new_login)
    db.session.commit()
    logins=LogInOut.query.all()
    
    res = [{'id': emp.id, 'dist': emp.dist, 'time': emp.time,'status':emp.status} for emp in logins]
    return jsonify(res)

@app.route('/LogInOut', methods=['POST'])
def add_employees():
    data = request.get_json()
    
    new_employee = LogInOut(id=data['Id'],dist=data['dist'], time=datetime.utcfromtimestamp(data['time']/1000),status=True)#to be changed
    #print(type(time))
    
    db.session.add(new_employee)
    db.session.commit()
    return jsonify({'message': 'updated'}), 201

#######################################################################
@app.route('/employees/id/<int:id>', methods=['GET'])
def delete_employee(id):
    employee = Employee.query.filter_by(id=id).first()
    print(employee.loc_name)
    if employee is None:
        return jsonify({"error": "Employee not found"}), 404

    return jsonify(employee.loc_name), 200

@app.route('/employees/username/<string:username>', methods=['GET'])
def get_employee(username):
    # Query to get the specific employee by id
    #print(username)
    employee = Employee.query.filter_by(username=username).first()

    if employee is None:
        return jsonify({"error": "Employee not found"}), 404

    return jsonify(employee.id), 200

@app.route('/employees', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    #logins=LogInOut.query.all()
    result = [{'id': emp.id, 'name': emp.name, 'position': emp.position} for emp in employees]
    #res = [{'id': emp.id, 'dist': emp.dist, 'time': emp.time,'status':emp.status} for emp in logins]
    return jsonify(result)

@app.route('/employees', methods=['POST'])
def add_employee():
    data = request.get_json()
    new_employee = Employee(id=data['Id'],name=data['name'], position=data['position'],loc_name=data['loc'], username=data['uId'], password=generate_password_hash(data['pass']))
    db.session.add(new_employee)
    db.session.commit()
    return jsonify({'message': 'Employee added successfully'}), 201

@app.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    db.session.delete(employee)
    db.session.commit()
    return jsonify({'message': 'Employee deleted successfully'})

if __name__ == '__main__':
    context = (r"C:\Users\Sonu\server.crt", r"C:\Users\Sonu\server.key")

    with app.app_context():
        admin = Employee.query.filter_by(username='admin').first()
        if not admin:
            new_employee = Employee(
                id=1,
                name='abhinith',
                position='admin',
                loc_name="office",
                username='admin',
                password=generate_password_hash('admin123')
            )
            new_employe = LogInOut(id=1,dist=0, time=datetime.now(),status=True)#to be changed
            #print(type(time))

            db.session.add(new_employe)
            db.session.commit()
            db.session.add(new_employee)
            db.session.commit()
    app.run(host = '192.168.0.110',port = 5001,ssl_context=context)
    

