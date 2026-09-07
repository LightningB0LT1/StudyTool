# Vocabulary Steps

A no-cost, static vocabulary study site designed for GitHub Pages. Learners get a random set of words and must answer every word correctly to complete it. When an answer is incorrect, the correct definition is shown and the word returns later in the same set.

On the home screen, learners choose a vocabulary list, choose whether to answer with the word or its definition, and choose typed answers or randomized multiple-choice answers. The default is typing the vocabulary word from its definition.

## Publish on GitHub Pages

1. Push these files to your repository's `main` branch.
2. In the GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main**, folder **/(root)**, then click **Save**.
5. Wait a minute or two. GitHub will show the public site address on that same page.

`index.html` is now in the repository root, which is why the deployed site will open the study tool instead of this README.

## Change words or set length

You do **not** need to edit code. On GitHub:

1. Open `data/vocabulary.json`.
2. Click the pencil icon (**Edit this file**).
3. Edit `setLength` for the number of questions per set, edit/add entries under a list's `words`, or add a whole new entry under `lists` to make another selectable list.
4. Click **Commit changes**. GitHub Pages publishes the update automatically.

Each word follows this shape:

```json
{ "id": "unique-id", "word": "abate", "definition": "to become less intense or widespread", "acceptedAnswers": [] }
```

Each selectable list has an `id`, `name`, `description`, and its own `words` list. Use the existing **Foundations** and **Challenge** lists as examples.

Only people with write access to your GitHub repository can change this list. Keep the repository private if you also want to keep the words private; GitHub Pages availability for private repositories depends on your GitHub plan. The deployed vocabulary list itself is readable by visitors, which is normal for a public study site.
