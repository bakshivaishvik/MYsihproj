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

# Define a model for the database
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    position = db.Column(db.String(20), nullable=False)
    username = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(20), nullable=False)
    
    
    
def model_to_dict(model_instance):
    """Convert a SQLAlchemy model instance into a dictionary."""
    return {
        column.name: getattr(model_instance, column.name)
        for column in model_instance.__table__.columns
    }
    
    

class LogInOut(db.Model):
    sno = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id = db.Column(db.Integer)
    dist = db.Column(db.Float, nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Employee {self.name}>'
    
    
@app.route('/LogInOut/<int:id>', methods=['GET'])
def get_previous_employee(id):
    latest_log = LogInOut.query.filter_by(id=id)\
                               .order_by(LogInOut.time.desc())\
                               .first()

    if latest_log is None:
        return jsonify({"error": "No logs found for this employee"}), 404
    print(latest_log)
    print(jsonify(model_to_dict(latest_log)))

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
    data = request.get_json()
    username = data['username']
    password = data['password']
    user = Employee.query.filter_by(username=username).first()

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
    
    if user and (user.password == password) and username=='admin':
        
        return jsonify({'message': 'login successful'}), 200
    
    elif user and (user.password == password):
        return jsonify({'message': 'login successful'}), 202
    
    else:
        
        return jsonify({'message': 'login unsuccessful'}), 306

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('home'))





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

@app.route('/employees/<string:username>', methods=['GET'])
def get_employee(username):
    # Query to get the specific employee by id
    print(username)
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
    new_employee = Employee(id=data['Id'],name=data['name'], position=data['position'], username=data['uId'], password=generate_password_hash(data['pass']))
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
    context = (
        r"C:\Users\Sonu\server.crt",  
        r"C:\Users\Sonu\server.key"
    )
    with app.app_context():
        admin = Employee.query.filter_by(username='admin').first()
        if not admin:
            new_employee = Employee(
                id=1,
                name='abhinith',
                position='admin',
                username='admin',
                password=generate_password_hash('admin123')
            )
            db.session.add(new_employee)
            db.session.commit()
    
    app.run(host='192.168.0.110', port=5001, ssl_context=context)
