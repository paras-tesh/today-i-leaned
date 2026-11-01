# Today I Learned

A small social web app for sharing interesting facts. Users can log in, post a fact with a source and a category, filter facts by category, vote on them (👍 interesting, 🤯 mind-blowing, ⛔️ false) and delete facts.

The project started as plain HTML/CSS/JavaScript and was migrated to React.

## Tech stack

- **React 19** + **Vite** (frontend)
- **Supabase** (PostgreSQL database, auto-generated REST API, email/password authentication)

## Features

- Email/password sign up and log in (Supabase Auth)
- Add a fact (text up to 200 characters, valid source URL, category) with form validation and error messages
- Filter facts by category
- Toggle votes: click an emoji to vote, click it again to remove the vote
- Delete a fact
- Responsive layout (desktop, tablet and mobile)

## Project structure

```
index.html
public/logo.png
src/
├── main.jsx               # React entry point
├── App.jsx                # global state, session handling, data loading
├── supabaseClient.js      # Supabase client + REST config
├── data.js                # category list
├── style.css
└── components/
    ├── Header.jsx
    ├── Login.jsx
    ├── CategoryFilter.jsx
    ├── NewFactForm.jsx
    ├── FactList.jsx
    └── Fact.jsx
```

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Database

Table `facts`:

| column             | type                      |
| ------------------ | ------------------------- |
| `id`               | bigint, primary key       |
| `text`             | text                      |
| `source`           | text                      |
| `category`         | text                      |
| `votesInteresting` | int, default 0            |
| `votesMindblowing` | int, default 0            |
| `votesFalse`       | int, default 0            |

Row Level Security is enabled, with policies for `select`, `insert`, `update` and `delete`.

> **Note:** this is a learning project, so the policies are intentionally open. For a production app, restrict `update`/`delete` to the fact's owner (for example with a `user_id` column and `auth.uid()`), and store votes in a separate table per user.

## License

MIT
