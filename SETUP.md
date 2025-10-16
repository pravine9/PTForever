# Setup Guide for PTForever

## Step-by-Step Setup for Thuvaraha's Birthday

### 1. Add Your Quiz Questions ✏️

Edit `data/quiz.json`:

1. Replace the example questions with your prepared questions
2. For each question, specify:
   - The question text
   - 4 answer options
   - Which answer is correct (0-3, where 0 is the first option)
   - Optional: Add a photo or video hint

**Example:**
```json
{
  "type": "question",
  "question": "What was the first movie we watched together?",
  "answers": [
    "The Notebook",
    "Inception", 
    "Titanic",
    "La La Land"
  ],
  "correctAnswer": 2
}
```

### 2. Add Your Photos/Videos 📸

1. Collect your photos and videos
2. Rename them to simple names (e.g., `first-date.jpg`, `beach-sunset.jpg`)
3. Copy them into the `media/` folder
4. Reference them in your quiz or memories

### 3. Customize the Quiz Success Message 💝

In `data/quiz.json`, update:

```json
{
  "passingScore": 70,
  "successMessage": "Your custom birthday message here!",
  "unlockContent": {
    "type": "message",
    "content": "Your heartfelt message when she passes the quiz..."
  }
}
```

Or unlock a special video:
```json
{
  "unlockContent": {
    "type": "video",
    "url": "media/special-birthday-message.mp4"
  }
}
```

### 4. Add Your Memories 💭

Edit `data/memories.json`:

1. Replace example memories with real ones
2. Add dates, titles, and descriptions
3. Tag them for easy filtering
4. Add photos/videos to special memories

**Example:**
```json
{
  "id": "first-kiss",
  "date": "2023-02-14",
  "title": "Our First Kiss",
  "content": "Under the stars at the park...",
  "tags": ["romantic", "special"],
  "media": {
    "type": "image",
    "url": "media/park-night.jpg"
  }
}
```

### 5. Set Up Private Memories 🔒

For memories you want password-protected:

```json
{
  "id": "secret-memory",
  "title": "Our Secret Adventure",
  "content": "...",
  "private": true,
  "password": "choose-a-password"
}
```

### 6. Customize the Look 🎨

**Change the site title:**
- Edit `index.html` and `quiz.html`
- Find `<h1 class="nav-title">PTForever</h1>`
- Change to your preferred name

**Change colors:**
- Edit `css/style.css`
- Look for the `:root` section at the top
- Change `--accent` to your favorite color

### 7. Test Locally 🧪

1. Open `index.html` in your web browser
2. Check all memories load correctly
3. Test the quiz
4. Try the password protection
5. Check that media files display properly

### 8. Deploy to GitHub Pages 🚀

**First time setup:**

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Birthday website for Thuvaraha"

# Add your GitHub remote (replace YOUR-USERNAME)
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/PTForever.git

# Push to GitHub
git push -u origin main
```

**Enable GitHub Pages:**

1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll down to "Pages" (in the left sidebar)
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"
7. Wait 2-3 minutes for deployment
8. Your site will be at: `https://YOUR-USERNAME.github.io/PTForever/`

### 9. Future Updates 🔄

Whenever you want to add new content:

```bash
# Edit your JSON files or add media

# Add changes
git add .

# Commit with a message
git commit -m "Added new memory/quiz question"

# Push to update the live site
git push
```

The site will auto-update in 2-3 minutes!

## Quick Checklist Before Launch ✅

- [ ] All quiz questions added and tested
- [ ] Quiz success message customized
- [ ] Photos/videos uploaded to media folder
- [ ] Memories added with correct dates
- [ ] Private memory passwords set
- [ ] Site title customized
- [ ] Tested locally in browser
- [ ] Media files display correctly
- [ ] Quiz scoring works
- [ ] Password protection works
- [ ] Deployed to GitHub Pages
- [ ] Live site loads correctly

## Tips for the Birthday Reveal 🎁

1. **Test everything** the day before
2. **Use private/incognito mode** to test as if you're viewing for the first time
3. **Consider making it a scavenger hunt** - give her the URL as part of a birthday card
4. **Have the password ready** if you're using private memories
5. **Be there** when she takes the quiz to see her reactions!

## Need Help?

Common issues and solutions:

**Media not showing?**
- Check file paths match exactly (case-sensitive!)
- Ensure files are in the media folder
- Try opening browser console (F12) to see errors

**Quiz not working?**
- Validate your JSON at [jsonlint.com](https://jsonlint.com)
- Check that `correctAnswer` numbers are 0-indexed (first answer = 0)

**Can't access after deploying?**
- Wait 5 minutes after first deployment
- Check GitHub Pages settings are correct
- Make sure repository is public (or upgrade for private repos)

---

**Have fun creating this special gift! 🎉❤️**

