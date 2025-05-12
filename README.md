# GeoAttendance

GeoAttendance is a Flask-based web application designed to manage employee attendance using geolocation and facial recognition. The application integrates various technologies to provide a robust and secure attendance management system.

## Features

1. **Employee Management**:
   - Add, update, and delete employee records.
   - Store employee details such as name, position, location, and photo.

2. **Location Management**:
   - Add, update, and delete location records.
   - Fetch nearest locations based on geolocation.

3. **Attendance Tracking**:
   - Log employee check-ins and check-outs with timestamps and geolocation.
   - Calculate total working hours for employees.

4. **Facial Recognition**:
   - Verify employee identity using facial recognition with the DeepFace library.

5. **Secure Authentication**:
   - Passwords are hashed using `werkzeug.security`.
   - Admin and user roles for secure access.

6. **RESTful API**:
   - Expose endpoints for managing employees, locations, and attendance logs.

7. **Database Integration**:
   - Uses SQLite for data storage.
   - Models defined using SQLAlchemy ORM.

8. **Cross-Origin Resource Sharing (CORS)**:
   - Enabled for seamless integration with frontend applications.

## Technologies Used

- **Backend**: Flask, SQLAlchemy
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite
- **Facial Recognition**: DeepFace
- **Geolocation**: Haversine formula for distance calculation
- **Security**: Password hashing with `werkzeug.security`

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd GeoAttendance
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   python
   >>> from SIH_db import db
   >>> db.create_all()
   >>> exit()
   ```

4. Run the application:
   ```bash
   python SIH_db.py
   ```

5. Access the application at `https://<your-ip>:5000`.

## API Endpoints

### Employee Management
- `POST /employees`: Add a new employee.
- `GET /employees`: Fetch all employees.
- `GET /employees/<int:employee_id>`: Fetch details of a specific employee.
- `PATCH /employees/<int:employee_id>/update_pass`: Update employee password.
- `PATCH /employees/<int:employee_id>/update_location`: Update employee location.
- `DELETE /employees/<int:employee_id>`: Delete an employee.

### Location Management
- `POST /Location`: Add a new location.
- `GET /Location`: Fetch all locations.
- `GET /Location/<string:name>`: Fetch details of a specific location.
- `DELETE /Location/<string:name>`: Delete a location.

### Attendance Management
- `POST /LogInOut`: Log employee check-in or check-out.
- `GET /LogInOut`: Fetch all attendance logs.
- `GET /LogInOut/<int:id>`: Fetch the latest log for a specific employee.
- `GET /LogInOut/allemp/<int:id>`: Fetch all logs for a specific employee.

### Facial Recognition
- `POST /submit_request`: Submit a facial recognition request for attendance.

### Utility
- `POST /get_nearest_locations`: Fetch the nearest locations based on geolocation.
- `GET /get_photo/<int:employee_id>`: Fetch the photo of an employee.
- `POST /upload_photo/<int:employee_id>`: Upload a photo for an employee.

## Demonstration

[GeoAttendance](https://youtu.be/p08WNrPTMFg)

## Folder Structure

```
GeoAttendance/
├── SIH_db.py          # Main application file
├── instance/
│   └── employees.db   # SQLite database
├── platforms/         # Cordova platform files
├── plugins/           # Cordova plugins
├── www/               # Frontend files
│   ├── css/           # CSS files
│   ├── img/           # Images
│   ├── js/            # JavaScript files
│   └── index.html     # Main HTML file
└── README.md          # Project documentation
```

## Security Notes

- Ensure SSL certificates (`cert.pem` and `key.pem`) are properly configured for secure communication.
- Use strong passwords for admin and user accounts.

## Future Enhancements

- Add support for multiple databases.
- Implement real-time notifications for attendance updates.
- Enhance the frontend with a modern UI framework.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [Flask](https://flask.palletsprojects.com/)
- [DeepFace](https://github.com/serengil/deepface)
- [SQLAlchemy](https://www.sqlalchemy.org/)
