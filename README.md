# Group-12-Project-CSCE3444-fa25

## Project Description
This is a Sudoku web application that allows users to play Sudoku, challenge bots, and engage in multiplayer games. It features customizable board themes and real-time interactions.

## Local Development Setup
To set up and run the project locally, follow these steps:

### 1. Clone the Repository
If you haven't already, clone the project repository:
```bash
git clone https://github.com/asngofficial/Group-12-Project-CSCE3444-fa25
cd Group-12-Project-CSCE3444-fa25
```

### 2. Install Dependencies
#### Frontend Dependencies
Navigate to the project root directory and install frontend dependencies:
npm install

#### Backend Dependencies
Navigate to the `server` directory and install backend dependencies:
cd server
npm install
### 3. Environment Configuration
Since .env shoul be encrypted it is in our git ignore and therfore will be ignored on a pull request.
## What you should add:##
For Local Testing: create .env in project root
Add this line or your preffered address: VITE_API_BASE_URL=http://localhost:3002

For Server Testing: create .env in server root:  JWT_SECRET=Your_Secret_Key
This is where you would put your backend secret key

#### Start the Backend Server
Open a new terminal, navigate to the `server` directory, and start the backend:
cd server
npm start
The server should start on `http://localhost:3002`.

#### Start the Frontend Development Server
Open another new terminal, navigate to the project root directory, and start the 
npm run dev


