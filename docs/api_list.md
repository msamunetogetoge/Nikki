# Backend API List

Extracted from `py/main.py`.

| Method | Path                | Description                                     | Auth Required  |
| :----- | :------------------ | :---------------------------------------------- | :------------- |
| GET    | `/`                 | Health check / Hello World                      | No             |
| GET    | `/nikki`            | Get list of nikkis (filtered by user, date)     | Yes (Implicit) |
| POST   | `/search/nikki`     | Search nikkis with encrypted params             | Yes (Implicit) |
| POST   | `/nikki`            | Create a new nikki                              | Yes            |
| PUT    | `/nikki/{nikki_id}` | Update a nikki                                  | Yes            |
| DELETE | `/nikki/{nikki_id}` | Delete a nikki                                  | Yes            |
| GET    | `/tag`              | Get tags for a user                             | Yes            |
| POST   | `/tag/delete`       | Delete tags (Note: POST used instead of DELETE) | Yes            |
| POST   | `/user`             | Register a new user                             | No             |
| PUT    | `/user`             | Register/Update a trial user                    | No             |
| POST   | `/login`            | Login (Returns UserStore)                       | No             |
| GET    | `/user/{user_id}`   | Check if user ID exists                         | No             |
| DELETE | `/user/{user_id}`   | Delete user and their nikkis                    | Yes            |
| GET    | `/random`           | Create and return a random user                 | No             |
