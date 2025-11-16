# TODO Checklist

## 1. Set up Firebase Auth

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project and name it (e.g., Quizda).
3. Enable Firebase Authentication in the Authentication section.
4. Add sign-in methods (e.g., Email/Password, Google, etc.).
5. Generate and download the Firebase Admin SDK service account key.
6. Add the Firebase credentials to the `.env` file in the backend.

---

## 2. Set up Cloudflare R2

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to the R2 section and create a new bucket (e.g., `quiz-questions`).
3. Note down the bucket name, account ID, access key, and secret key.
4. Add the R2 credentials to the `.env` file in the backend.
5. Test the R2 integration by uploading a sample JSON file.

---

## 3. Set up Cloudflare D1

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to the D1 section and create a new database (e.g., `quizda-db`).
3. Note down the database binding name and connection details.
4. Write and execute the SQL migrations to create the required tables (e.g., `users`, `quizzes`).
5. Test the D1 integration by inserting and querying sample data.
