from flask import Flask, jsonify, render_template, request, redirect, url_for, flash, session
from sqlalchemy import func
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime,timedelta
import logging
import cv2
import numpy as np
import io
from flask import send_file
from deepface import DeepFace
from PIL import Image
app = Flask(__name__)
CORS(app,resources={r"/*": {"origins": "*"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///employees.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False



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
    photo = db.Column(db.LargeBinary, nullable=True)
    hrs_worked = db.Column(db.FLOAT())
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
    longi = db.Column(db.DOUBLE, nullable=False)
    lati = db.Column(db.DOUBLE, nullable=False)


class requests(db.Model):
    sno= db.Column(db.Integer,primary_key=True,autoincrement=True)
    id = db.Column(db.Integer)
    name = db.Column(db.String(20),default=False)
    dist = db.Column(db.DOUBLE, nullable=False)
    time = db.Column(db.DATETIME(),nullable=False)
    longi = db.Column(db.DOUBLE, nullable=False)
    lati = db.Column(db.DOUBLE, nullable=False)
    status = db.Column(db.BOOLEAN(),default=False)
    stat = db.Column(db.String(20),default=False)
    photo = db.Column(db.LargeBinary, nullable=True)

with app.app_context():
    
    #db.drop_all()  # Optionally drop all tables if you want a fresh start
    
    db.create_all()
    
    

  
@app.route('/')
def home():
    if 'username' in session:
        return   # Redirect to dashboard if logged in
    return 

@app.route('/employee/working_hours', methods=['GET'])
def get_working_hours():
    employees = Employee.query.all()
    
    for employee in employees:
        # Calculate total working hours for each employee
        time = calculate_working_hours(employee.id)
        employee.hrs_worked = -time
        print(f"Employee ID {employee.id}: Total working hours  {time}")
        db.session.commit()
    db.session.close()
        # Here, you might want to update this total_hours in a new column in the Employee table or another table
        # For demonstration, we'll just print it
        

    return jsonify({"message": "All employees' working hours updated successfully!"}),202
    

def calculate_working_hours(employee_id):
    logs = LogInOut.query.filter_by(id=employee_id).order_by(LogInOut.time.desc()).all()
    
    if not logs:
        return "No records found for this employee"
    
    total_time = timedelta()  # Initialize total time to zero
    
    login_time = None  # To store the time of the last login
    
    for log in logs:
        if log.status:  # True indicates login
            if login_time is not None:
                # Handle case where there was a previous login without a corresponding logout
                print(f"Unpaired loginnnnnnnnnn at {login_time} for {employee_id}. Ignoring this login.")
            login_time = log.time
        else:  # False indicates logout
            if login_time is not None:
                # Calculate the difference between the login and logout time
                total_time += log.time - login_time
                login_time = None  # Reset login_time after calculating the duration
            else:
                print(f"Unpaired login at {login_time} for {employee_id}. Ignoring this login.")
        print(employee_id,total_time)
    # Handle the case where there's an unpaired login at the end
    if login_time is not None:
        print(f"Warning: Employee logged in at {login_time} but never logged out.")
    
    # Convert total time to hours and minutes
    hours, remainder = divmod(total_time.total_seconds(), 3600)
    minutes, _ = divmod(remainder, 60)
    time=float((hours*60+minutes)/60)
    
    return time   

@app.route('/', methods=['POST'])
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
    db.session.close()
    # Return a success message
    return jsonify({"message": "Location added successfully!"}), 200

@app.route('/Location/<string:name>', methods=['DELETE'])
def delete_location(name):
    # Query to get the specific location by id
    location = Location.query.filter_by(name=name).first()

    if location is None:
        return jsonify({"error": "Location not found"}), 404

    # Delete the location
    db.session.delete(location)

    db.session.commit()
    db.session.close()
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

@app.route('/employees/location/<string:loc_name>', methods=['GET'])
def get_locatione(loc_name):
    # Query to get the specific employee by id
    #print(username)
    employee = Employee.query.filter_by(loc_name=loc_name).first()

    if employee is None:
        return jsonify({"error": "Employee not found"}), 404

    return jsonify(employee.loc_name), 200



######################################################################


@app.route('/latest_locations', methods=['GET'])
def get_latest_locations():
    # Subquery to get the latest time for each employee
    subquery = db.session.query(
        LogInOut.id,
        func.max(LogInOut.time).label('latest_time')
    ).group_by(LogInOut.id).subquery()

    # Query to get the latest log for each employee
    latest_logs = db.session.query(
        LogInOut.id,
        LogInOut.lati,
        LogInOut.longi,
        LogInOut.time
    ).join(
        subquery,
        (LogInOut.id == subquery.c.id) & (LogInOut.time == subquery.c.latest_time)
    ).all()

    # Format the result as a list of dictionaries
    result = [
        {
            'id': log.id,
            'latitude': log.lati,
            'longitude': log.longi,
            'time': log.time
        } for log in latest_logs
    ]
    print(result)
    return jsonify(result)




@app.route('/LogInOut/<int:id>', methods=['GET'])
def get_previous_employee(id):
    latest_log = LogInOut.query.filter_by(id=id)\
                               .order_by(LogInOut.time.desc())\
                               .first()

    if latest_log is None:
        return jsonify({"error": "No logs found for this employee"}), 404
    print(latest_log.dist)
    #print(jsonify(model_to_dict(latest_log)))
    return jsonify(model_to_dict(latest_log)), 200

@app.route('/LogInOut/allemp/<int:id>', methods=['GET'])
def get_previous_employeee(id):
    logs = LogInOut.query.filter_by(id=id).all()
                               

    if logs is None:
        return jsonify({"error": "No logs found for this employee"}), 404
    log_entries = [model_to_dict(log) for log in logs]
    #print(jsonify(model_to_dict(latest_log)))
    return jsonify(log_entries), 200


@app.route('/LogInOut', methods=['GET'])
def get_logins():
    '''
    new_login = LogInOut(id=1,dist=0,time=datetime.now(),status=True)
    db.session.add(new_login)
    db.session.commit()
    db.session.close()
    '''
    logins=LogInOut.query.all()
    
    res = [{'id': emp.id, 'dist': emp.dist, 'time': emp.time,'status':emp.status,'longi':emp.longi,'lati':emp.lati} for emp in logins]
    print(res)
    return jsonify(res)

@app.route('/LogInOut', methods=['POST'])
def add_employees():
    data = request.get_json()
    id=data['Id']
    status=data['status']
    if data['status'] == 'True':
        status=True
    else:
        status=False
    #print()
    employee = LogInOut.query.filter_by(id=id).order_by(LogInOut.time.desc()).first()
    #print("dist is"+data['dist'])
    if status==employee.status:
        return jsonify({'message': 'same as before'}), 201
    else:
        new_employee = LogInOut(id=data['Id'],dist=data['dist'], time=datetime.utcfromtimestamp(data['time']/1000),status=status,longi=data['longitude'],lati=data['latitude'])#to be changed
        #print(bool(data['status']))
        
        db.session.add(new_employee)
        db.session.commit()
        db.session.close()
        return jsonify({'message': 'updated'}), 201

#######################################################################
@app.route('/employees/<int:employee_id>/update_pass', methods=['PATCH'])
def update_employee_pass(employee_id):
    data = request.get_json()

    # Validate that the new loc_name is provided
    new_loc_name = data.get('loc_name')
    #print(new_loc_name)
    if not new_loc_name:
        return jsonify({"error": "New pass is required"}), 400
    print(employee_id)
    # Query to get the specific employee by ID
    employee = Employee.query.filter_by(id=employee_id).first()
    #print(employee.loc_name)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Update the loc_name
    employee.password = generate_password_hash(new_loc_name)
    db.session.commit()
    db.session.close()
    return jsonify({"message": "Employee pass updated successfully"}), 200
@app.route('/employees/<int:employee_id>/update_location', methods=['PATCH'])
def update_employee_location(employee_id):
    data = request.get_json()

    # Validate that the new loc_name is provided
    new_loc_name = data.get('loc_name')
    #print(new_loc_name)
    if not new_loc_name:
        return jsonify({"error": "New location name is required"}), 400
    print(employee_id)
    # Query to get the specific employee by ID
    employee = Employee.query.filter_by(id=employee_id).first()
    #print(employee.loc_name)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Update the loc_name
    employee.loc_name = new_loc_name
    db.session.commit()
    return jsonify({"message": "Employee location updated successfully"}), 200
@app.route('/employees/id/<int:id>', methods=['GET'])
def fetch_locations(id):
    employee = Employee.query.filter_by(id=id).first()
    print(employee.loc_name)
    if employee is None:
        return jsonify({"error": "Employee not found"}), 404
    employee_data = {
        'id': employee.id,
        'name': employee.name,
        'position': employee.position,
        'hrs_worked': employee.hrs_worked,
        'location':employee.loc_name,
        # Replace 'date' with the actual field name if different
        # Add other fields as needed
    }

    return jsonify(employee_data), 200
'''
@app.route('/employees/ids/<int:employee_id>', methods=['GET'])
def get_employeeee(employee_id):
    # Fetch the employee using the employee_id
    employee = Employee.query.get_or_404(employee_id)
    
    # Extract employee data (adjust the attribute names based on your model)
    employee_data = {
        'id': employee.id,
        'name': employee.name,
        'position': employee.position,
        'hrs_worked': employee.hrs_worked,
        'location':employee.loc_name,
        # Replace 'date' with the actual field name if different
        # Add other fields as needed
    }
    
    # Return the employee data as JSON
    return jsonify(employee_data)
'''
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
    result = [{'id': emp.id, 'name': emp.name, 'position': emp.position,'hrs_worked':emp.hrs_worked} for emp in employees]
    #res = [{'id': emp.id, 'dist': emp.dist, 'time': emp.time,'status':emp.status} for emp in logins]
    return jsonify(result)

@app.route('/employees', methods=['POST'])
def add_employee():
    # Ensure content type is multipart/form-data
    if 'application/json' in request.content_type:
        return jsonify({'error': 'Expected multipart/form-data'}), 400

    # Retrieve JSON data from the form
    Id = request.form.get('Id')
    name = request.form.get('name')
    position = request.form.get('position')
    loc = request.form.get('loc')
    uId = request.form.get('uId')
    pass_ = request.form.get('pass')  # Avoid using 'pass' as it's a reserved keyword

    # Retrieve the photo file
    photo_file = request.files.get('photo')
    if photo_file:
        photo = photo_file.read()
    else:
        return jsonify({'error': 'No photo uploaded.'}), 400

    # Check for missing fields
    if not all([Id, name, position, loc, uId, pass_]):
        return jsonify({'error': 'Missing required employee details.'}), 400

    try:
        # Add employee to the database
        new_employee = Employee(
            id=Id,
            name=name,
            position=position,
            loc_name=loc,
            username=uId,
            password=generate_password_hash(pass_),
            hrs_worked='0.0',
            photo=photo
        )
        db.session.add(new_employee)
        db.session.commit()

        # Add a login record
        new_login = LogInOut(
            id=Id,
            dist=0,
            time=datetime.now(),
            status=True,
            longi=0.0,
            lati=0.0
        )
        db.session.add(new_login)
        db.session.commit()

        return jsonify({'message': 'Employee added successfully'}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
        return jsonify({'error': 'An error occurred while adding the employee.'}), 500

    finally:
        db.session.close()

@app.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    db.session.delete(employee)
    db.session.commit()
    db.session.close()
    return jsonify({'message': 'Employee deleted successfully'})

@app.route('/requests/<int:sno>/approve', methods=['PATCH'])
def approve_request(sno):
    request_entry = requests.query.filter_by(id=sno).order_by(requests.sno.desc()).first()
    if request_entry is None:
        return jsonify({"error": "Request not found"}), 404
    
    request_entry.stat = "approved"  # Set the status to approved
    copy_request_to_loginout(sno)
    db.session.commit()
    db.session.close()
    return jsonify({"message": "Request approved successfully!"}), 200

@app.route('/requests/<int:sno>/disapprove', methods=['PATCH'])
def disapprove_request(sno):
    request_entry = requests.query.filter_by(id=sno).order_by(requests.sno.desc()).first()
    if request_entry is None:
        return jsonify({"error": "Request not found"}), 404
    
    request_entry.stat = "disapproved"  # Set the status to disapproved
    db.session.commit()
    db.session.close()
    return jsonify({"message": "Request disapproved successfully!"}), 200

@app.route('/requests', methods=['GET'])
def get_requests():
    all_requests = requests.query.filter_by(stat="Pending").all()
    #print(all_requests)
    requests_list = [model_to_dict(req) for req in all_requests]
    return jsonify(requests_list), 200

@app.route('/submit_request', methods=['POST'])
def submit_request():
    try:
        # Extract data from the form
        data = request.form
        
        # Extract form data with fallbacks
        request_id = int(data.get('Id'))
        name = data.get('name', '')
        dist = float(data.get('dist', 0))
        time = datetime.utcfromtimestamp(int(data.get('time')) / 1000)
        longitude = float(data.get('longitude', 0))
        latitude = float(data.get('latitude', 0))
        stat = data.get('stat', 'Pending')

        # Handle the uploaded photo
        photo = request.files.get('photo')
        if not photo:
            return jsonify({'error': 'Photo is required'}), 400
        
        # Convert the uploaded photo to an image format (PIL) and then to a NumPy array
        photo_data = Image.open(io.BytesIO(photo.read()))
        photo_array = np.array(photo_data)
        
        # Fetch the employee from the database
        employee = Employee.query.filter_by(id=request_id).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404
        
        # Convert stored employee photo from binary to a NumPy array
        stored_photo_data = Image.open(io.BytesIO(employee.photo))
        stored_photo_array = np.array(stored_photo_data)

        # Verify the photos using DeepFace
        result = DeepFace.verify(photo_array, stored_photo_array)

        if result["verified"]:
            # Add a new log entry if verification is successful
            new_entry = LogInOut(
                id=request_id,
                dist=dist,
                time=time,
                status=True,
                longi=longitude,
                lati=latitude
            )
            db.session.add(new_entry)
            db.session.commit()
            return jsonify({'message': 'Photos match and logs have been updated'}), 201
        else:
            return jsonify({'message': 'Photos do not match'}), 401

    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to process request'}), 500

    finally:
        db.session.close()



def copy_request_to_loginout(sno):
    # Query the row from the requests table
    request_entry = requests.query.filter_by(id=sno).first()
    
    if not request_entry:
        return jsonify({'error': 'Request with sno {} not found'.format(sno)}), 404

    try:
        # Create a new LogInOut instance using data from the request_entry
        new_entry = LogInOut(
            id=request_entry.id,
            dist=request_entry.dist,
            time=request_entry.time,
            status=request_entry.status,
            longi=request_entry.longi,
            lati=request_entry.lati
        )
        
        # Add the new entry to the session
        db.session.add(new_entry)
        # Commit the transaction
        db.session.commit()
        
        return jsonify({'message': 'Request copied to LogInOut successfully', 'id': new_entry.sno}), 201

    except Exception as e:
        # Rollback in case of error
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@app.route('/upload_photo/<int:employee_id>', methods=['POST'])
def upload_photo(employee_id):
    employee = Employee.query.filter_by(id=employee_id).first()
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    photo = request.files['photo'].read()
    employee.photo = photo
    db.session.commit()
    return jsonify({"message": "Photo uploaded successfully"}), 200

@app.route('/get_photo/<int:employee_id>', methods=['GET'])
def get_photo(employee_id):
    employee = Employee.query.filter_by(id=employee_id).first()
    if not employee or not employee.photo:
        return jsonify({"error": "Photo not found"}), 404

    return send_file(
        io.BytesIO(employee.photo),
        mimetype='image/jpeg',
        as_attachment=True,
        download_name=f"employee_{employee_id}_photo.jpg"
    )



if __name__ == '__main__':
#    logging.basicConfig(level=logging.DEBUG)
    context = ("cert.pem","key.pem")

    with app.app_context():
        admin = Employee.query.filter_by(username='admin').first()
        if not admin:
            new_employee = Employee(
                id=1,
                name='vaishvik',
                position='admin',
                loc_name="office",
                username='admin',
                password=generate_password_hash('admin123'),
                hrs_worked=0.0
            )
            new_employe = LogInOut(id=1,dist=0, time=datetime.now(),status=True,longi=long,lati=lat)#to be changed
            #print(type(time))

            db.session.add(new_employe)
            db.session.commit()
            db.session.close()
            db.session.add(new_employee)
            db.session.commit()
            db.session.close()
    app.run(host = '192.168.0.110',port = 5000,ssl_context=context)
    
#openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
#192.168.230.112
#192.168.0.106
#192.168.137.213
