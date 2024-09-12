import face_recognition
import cv2
#from google.colab.patches import cv2_imshow

# Load the reference images
image1_path = "ryan1.jpeg"  # Path to the first image
image2_path = "ryan2.jpeg"  # Path to the second image

# Load the images and find face encodings
image1 = face_recognition.load_image_file(image1_path)
image2 = face_recognition.load_image_file(image2_path)

# Extract face encodings
image1_encodings = face_recognition.face_encodings(image1)
image2_encodings = face_recognition.face_encodings(image2)

# Ensure both images contain at least one face
if len(image1_encodings) > 0 and len(image2_encodings) > 0:
    # Compare the first face encoding from each image
    match_results = face_recognition.compare_faces([image1_encodings[0]], image2_encodings[0])

    if match_results[0]:
        print("The faces match!")
    else:
        print("The faces do not match!")
else:
    print("One or both images do not contain any faces.")

# Optional: Visualize the images
image1_display = cv2.imread(image1_path)
image2_display = cv2.imread(image2_path)

cv2.imshow("Image 1", image1_display)
cv2.imshow("Image 2", image2_display)

cv2.waitKey(0)
cv2.destroyAllWindows()