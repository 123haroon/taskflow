# TaskFlow — Mini Todo App

A responsive todo dashboard built with **React, TypeScript, Vite, Tailwind CSS v4**, and **Lucide React**.

## Features

- Add a task with title, optional description and priority
- Mark tasks complete or incomplete
- Delete a task or clear all completed tasks
- Filter by All tasks / In progress / Completed
- Search tasks by title or description
- Progress overview and completion percentage
- Light / dark mode

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually http://localhost:5173).

Production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
  App.tsx       # UI and task logic
  index.css     # Tailwind setup and styles
  main.tsx      # React entry point
index.html
vite.config.ts
```

The project comes with a few example tasks on first launch. Delete them if you want to start from an empty list. All changes save locally in your browser.

## Git practice roadmap

After extracting this project, open a terminal in the `taskflow` folder.

**1. Initialize Git:**

```bash
git init
git branch -M main
git add .
git commit -m "Initial TaskFlow project"
```

**2. Create and switch branches:**

```bash
git switch -c feature/update-heading
# Edit the heading in src/App.tsx
git add src/App.tsx
git commit -m "Update dashboard heading"
git switch main
git merge feature/update-heading
```

**3. Later exercises:**

- **Conflict:** Change the same heading differently on two branches, then merge and resolve.
- **Cherry-pick:** Create 2 independent commits on a feature branch and cherry-pick only one into main.
- **Stash:** Edit a file without committing; run `git stash push -m "WIP"`, then `git stash pop`.
- **Rebase:** Create a feature branch, add commits to main separately, then `git rebase main` on the feature branch.
- **Reset vs revert:** Practice on a test branch, not on a shared production branch.
- **Pull request:** Push a feature branch and open a PR on GitHub.

> **Note:** `.env` files containing real secrets should not be pushed. This app does not need any environment variables.
> ## Git Practice

Learning Git fetch, cherry-pick, rebase, reset, and revert.

## Upcoming Features

- Task counter
- Task categories
- Task reminders
