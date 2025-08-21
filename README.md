# Solsphere

## Description

Solsphere is a full-stack application built with Electron, designed to manage and monitor machines. It provides a user-friendly interface to interact with machine data, leveraging a Node.js backend with an Express API.

## Features

*   Machine Management: Add, update, and delete machine records.
*   Real-time Monitoring: View real-time data and status of machines.
*   User Interface: Intuitive Electron-based user interface.
*   Backend API: Robust Node.js and Express API for data management.

## Technologies Used

*   Electron
*   Node.js
*   Express
*   TypeScript
*   Mongoose (or similar, based on `backend/config/db.js` and `backend/models/Machine.js`)

## Installation

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    ```
2.  Navigate to the project directory:

    ```bash
    cd Solsphere
    ```
3.  Install dependencies for both the frontend and backend:

    ```bash
    cd backend
    npm install
    cd ../
    npm install # Installs electron dependencies
    ```

4.  Configure the backend:

    *   Create a `.env` file in the `backend` directory with the necessary environment variables (e.g., database connection string).

5.  Run the application:

    ```bash
    npm start
    ```

## Usage

1.  Launch the application.
2.  Use the interface to manage and monitor machines.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.

## License

[Specify the license here, e.g., MIT License]
