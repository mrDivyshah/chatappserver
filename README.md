# Chat App Backend

## Overview
This is the backend server for a real-time chat application built using Node.js, Express, MySQL, and Socket.io. Users can join the chat using a unique username, receive a dynamically assigned UUID, and send messages to other users via WebSockets.

## Features
- Users join using a **unique username**.
- A **UUID is assigned** to each user for identification.
- **Messages are stored** in a MySQL database.
- **WebSocket-based** real-time messaging.
- **REST API for fetching messages**.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Real-time Communication:** Socket.io

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/chat-app-backend.git
   cd chat-app-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and configure database connection:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASS=your_database_password
   DB_NAME=your_database_name
   PORT=5000
   ```
4. Start the server:
   ```sh
   npm start
   ```

## Database Schema
The backend uses two tables:
1. **Users Table:**
   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(255) UNIQUE NOT NULL,
     uuid VARCHAR(255) UNIQUE NOT NULL
   );
   ```
2. **Messages Table:**
   ```sql
   CREATE TABLE IF NOT EXISTS messages (
     id INT AUTO_INCREMENT PRIMARY KEY,
     senderUUID VARCHAR(255) NOT NULL,
     receiverUUID VARCHAR(255) NOT NULL,
     message TEXT NOT NULL,
     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## API Endpoints
1. **Join Chat (Register User)**
   ```http
   POST /join
   ```
   - **Request Body:** `{ "username": "JohnDoe" }`
   - **Response:** `{ "username": "JohnDoe", "uuid": "generated-uuid" }`

2. **Get Messages**
   ```http
   GET /messages/:uuid
   ```
   - **Response:** List of the latest 50 messages for the user.

## WebSocket Events
1. **Register User (Join WebSocket Room)**
   ```js
   socket.emit("register", uuid);
   ```
2. **Send Message**
   ```js
   socket.emit("sendMessage", {
       senderUUID: "user1-uuid",
       receiverUUID: "user2-uuid",
       message: "Hello!"
   });
   ```
3. **Receive Message**
   ```js
   socket.on("receiveMessage", (data) => {
       console.log("New message received", data);
   });
   ```

## Running the Server
- Use `npm start` to start the Express and WebSocket server.
- Make sure MySQL is running and the `.env` file is correctly set up.

## Future Enhancements
- Add **user presence status**.
- Implement **message read receipts**.
- Add **group chat functionality**.

## License
This project is open-source and available for modification and redistribution under the MIT License.

npm install express mysql2 socket.io cors dotenv uuid swagger-jsdoc swagger-ui-express
