# 🚀 Quick Start - Get It Live in 10 Minutes!

## For Thuvaraha's Birthday - Fast Track Setup

### 1. Add Your Quiz Questions (5 minutes)

Open `data/quiz.json` and replace the questions with yours:

```json
{
  "type": "question",
  "question": "Where did we first meet?",
  "answers": ["Coffee shop", "Library", "Park", "Party"],
  "correctAnswer": 0
}
```

**Important:** 
- `correctAnswer` starts at 0 (first answer = 0, second = 1, etc.)
- Add comma after each question except the last one

### 2. Add a Success Message (1 minute)

At the top of `quiz.json`, customize:

```json
"successMessage": "Happy 25th Birthday! You know us so well! 🎉❤️"
```

### 3. Test It Locally (1 minute)

Double-click `index.html` to open in your browser
- Click through the memories
- Go to Quiz page and test it

### 4. Deploy to GitHub (3 minutes)

```bash
# In terminal, navigate to the folder
cd "/Users/pravine/VS Code/PTForever"

# Add all files
git add .

# Commit
git commit -m "Birthday website for Thuvaraha"

# Create repo on GitHub (do this first in browser):
# - Go to github.com
# - Click "+" → "New repository"  
# - Name it "PTForever"
# - Don't initialize with README
# - Click "Create repository"

# Then run these commands (replace YOUR-USERNAME):
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/PTForever.git
git push -u origin main
```

### 5. Enable GitHub Pages (30 seconds)

1. Go to your repo on GitHub
2. Click **Settings**
3. Click **Pages** (left sidebar)
4. Under "Source", select **main** branch
5. Click **Save**

**Done!** Your site will be live at:
`https://YOUR-USERNAME.github.io/PTForever/`

Wait 2-3 minutes for it to deploy.

---

## Want to Add Photos/Videos?

### Quick Method:

1. Put photos in the `media/` folder
2. Name them simply: `photo1.jpg`, `sunset.jpg`, etc.
3. Reference in `data/memories.json`:

```json
{
  "id": "beach-day",
  "date": "2024-06-15",
  "title": "Beach Day",
  "content": "Amazing day at the beach!",
  "tags": ["fun", "adventure"],
  "media": {
    "type": "image",
    "url": "media/sunset.jpg"
  }
}
```

4. Push to GitHub:
```bash
git add .
git commit -m "Added photos"
git push
```

---

## The Absolute Minimum to Launch

You can launch with just the quiz! The memories section is optional.

**Minimum steps:**
1. Edit quiz questions in `data/quiz.json`
2. Add success message
3. Deploy to GitHub Pages

**Add memories later** when you have time!

---

## Birthday Day Checklist

- [ ] Quiz questions are ready
- [ ] Success message is heartfelt
- [ ] Test quiz locally one more time
- [ ] Site is deployed and live
- [ ] Test on your phone too
- [ ] Share the URL with her!

---

## Need Help Fast?

**JSON Validator:** [jsonlint.com](https://jsonlint.com)
- Copy your JSON, paste there, click "Validate"
- It will show you exactly what's wrong

**Common Mistake:** Missing or extra commas in JSON
```json
[
  {"id": "1"},  ← comma
  {"id": "2"}   ← NO comma (last item)
]
```

**GitHub Not Deploying?**
- Make sure repo is **public** (or upgrade for private)
- Wait 5 full minutes
- Check GitHub Actions tab for any errors

---

## Make It Personal

Quick customization tips:

**Change site name:**
- Edit `index.html` line 11: `<h1 class="nav-title">YOUR NAME HERE</h1>`
- Do the same in `quiz.html`

**Change the accent color:**
- Edit `css/style.css` line 11: `--accent: #e74c3c;` 
- Try: `#ff6b9d` (pink), `#9b59b6` (purple), `#3498db` (blue)

**Change quiz title:**
- Edit `quiz.html` around line 23
- Update the "Happy 25th Birthday, Thuvaraha!" text

---

## You've Got This! 🎉

This is a beautiful gift. She's going to love it! ❤️

For detailed instructions, see `SETUP.md`
For templates, see `CONTENT-TEMPLATE.md`
For everything else, see `README.md`

