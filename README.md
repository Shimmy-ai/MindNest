# MindNest

MindNest is a personal productivity dashboard built with React, Chakra UI, and Flask. It helps you track habits, goals, worries, gratitude, daily spending, and appointments—all in one place.

## Features

- **Calendar:** Select any date and add appointments/events for that day.
- **Habits:** Track habits you want to quit, with daily lists and confirmation messages.
- **Goals:** Set and view daily goals, with a list for each day.
- **Worries:** Write down worries for the day, helping you reflect and manage stress.
- **Gratitude:** Enter up to three gratitude entries per day, see your gratitude list for today, and get confirmation when you add something.
- **Spending:** Log daily spending by item and amount (SEK), see a list and total for each day.
- **Quotes:** View motivational quotes, with options to show a random local quote or fetch one from an API.
- **Theme Toggle:** Switch between light and dark mode using an icon in the navigation bar.
- **Responsive Design:** Works well on desktop and mobile.

## Getting Started

### Backend (Flask)
1. Install dependencies:
    ```bash
    pip install flask flask-cors
    ```
2. Run the backend:
    ```bash
    python app.py
    ```

### Frontend (React)
1. Go to the frontend folder:
    ```bash
    cd thinky-frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the frontend:
    ```bash
    npm run dev
    ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Data Storage

- Habits, gratitude, and spending are saved to JSON files on the backend for persistence.

## License

MIT

---