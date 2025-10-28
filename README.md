# PTForever - Our Memory Timeline & Quiz

Our private blog, memory timeline and quiz website.

## 🎉 Features

- **Memory Timeline**: Chronological display of special moments with tags
- **Interactive Quiz**: Birthday quiz with photos/videos and unlockable content
- **Password Protection**: Private memories that require a password
- **Thaali Gold Calculator**: Live gold prices with sovereign/poun calculator (hidden page)
- **Easy Content Management**: Simple JSON files to add/edit content
- **Responsive Design**: Works beautifully on mobile and desktop
- **No Build Required**: Pure HTML/CSS/JS - just edit and deploy!

## 📁 File Structure

## 📝 Adding Memories

## 🚀 Quick Start

### Adding a New Memory

Edit `data/memories.json` and add a new entry:

```json
{
  "id": "unique-id",
  "date": "2024-10-16",
  "title": "Memory Title",
  "content": "Description of this memory...",
  "tags": ["tag1", "tag2"],
  "private": false,
  "media": {
    "type": "image",
    "url": "media/photo.jpg"
  }
}
```

**Fields:**
- `id`: Unique identifier (required)
- `date`: Date in YYYY-MM-DD format (required)
- `title`: Memory title (required)
- `content`: Memory description (required)
- `tags`: Array of tags for filtering (optional)
- `private`: Set to `true` to password-protect (optional)
- `password`: Password for private memories (optional, defaults to "forever")
- `media`: Photo or video (optional)
  - `type`: "image" or "video"
  - `url`: Path to file in media folder

### Adding Quiz Questions

Edit `data/quiz.json`:

**Regular Question:**
```json
{
  "type": "question",
  "question": "Your question here?",
  "answers": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "correctAnswer": 0,
  "media": {
    "type": "image",
    "url": "media/hint.jpg"
  }
}
```

**Media Break (Photo/Video between questions):**
```json
{
  "type": "media",
  "title": "Remember this? 💕",
  "media": {
    "type": "image",
    "url": "media/special.jpg"
  },
  "message": "Optional message to display"
}
```

**Quiz Settings (at the top of quiz.json):**
- `passingScore`: Percentage needed to pass (e.g., 70)
- `successMessage`: Message shown when quiz is passed
- `unlockMemoryId`: ID of memory to unlock when quiz is passed
- `unlockContent`: Special content shown when quiz is passed
  - `type`: "message", "image", or "video"
  - `content`: Message text (for type: "message")
  - `url`: File path (for type: "image" or "video")

### Adding Media Files

1. Place your photos/videos in the `media/` folder
2. Reference them in JSON as: `"media/filename.jpg"`

**Supported formats:**
- Images: .jpg, .jpeg, .png, .gif
- Videos: .mp4, .webm, .ogg

## 🌐 Deploying to GitHub Pages

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/PTForever.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repo settings
   - Scroll to "Pages" section
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Save

3. **Your site will be live at:**
   `https://YOUR-USERNAME.github.io/PTForever/`

## 🎨 Customization

### Changing Colors

Edit `css/style.css` - look for the `:root` section at the top:

```css
:root {
    --primary: #2c3e50;    /* Dark blue */
    --accent: #e74c3c;     /* Red accent */
    --light: #ecf0f1;      /* Light gray */
    /* ... change these! */
}
```

### Changing Site Title

Edit `index.html` and `quiz.html`:
- Update `<title>` tags
- Update `.nav-title` text

## 🔒 Password Protection

Private memories are protected with a simple password. The default password is **"forever"**.

To change it, add a `password` field to the memory in `memories.json`:

```json
{
  "private": true,
  "password": "your-password-here"
}
```

**Note:** This is client-side protection, suitable for casual privacy but not for highly sensitive information.

## 💍 Thaali Gold Calculator (Hidden Page)

Access the gold calculator at: `/thaali.html`

This page provides:
- **Live Gold Prices**: Real-time 24k gold prices in USD and GBP
- **Sovereign Calculator**: Calculate thaali costs based on number of pouns/sovereigns
- **Currency Conversion**: Automatic USD to GBP conversion
- **Quick Presets**: Fast calculations for common sovereign counts

**APIs Used:**
- **Gold-API.com** - Live gold prices (**UNLIMITED FREE REQUESTS!**)
- **ExchangeRate-API.com** - Currency conversion (free, no key needed)
- **GoldPrice.org** - Fallback public data (no auth needed)

**Free API Options (Recommended):**
1. 🏆 **Gold-API.com**: UNLIMITED requests/month (Best!) - https://gold-api.com/
2. 🥈 **GoldAPI.io**: 1,000 requests/month - https://goldapi.io/
3. 🥉 **FreeGoldPrice.org**: Generous free tier with hourly updates

**Quick Setup:**
1. Sign up at https://gold-api.com/ (free, 2 minutes)
2. Copy your API key
3. Add it to `js/thaali.js` (line 12)
4. Done! Unlimited price checks!

**No API Key? No Problem!**
The calculator works out-of-the-box using fallback prices. Just access `/thaali.html`

See `SETUP_THAALI_API.txt` for detailed setup instructions.

## 💡 Tips

- **Start Simple**: Edit the example data first to understand the structure
- **Test Locally**: Open `index.html` in your browser before deploying
- **Backup**: Keep a copy of your JSON files before making major changes
- **Video Hosting**: For large videos, consider hosting on YouTube/Vimeo and embedding
- **Dates**: Use YYYY-MM-DD format for proper sorting
- **Gold Prices**: Thaali calculator works without API key, but add one for best results (unlimited free!)

## 🐛 Troubleshooting

**Quiz not loading?**
- Check that `data/quiz.json` is valid JSON (use JSONLint.com)
- Make sure `correctAnswer` index matches your answers array

**Media not showing?**
- Verify file path is correct: `media/filename.jpg`
- Check file actually exists in media folder
- Use relative paths, not absolute

**Private memories won't unlock?**
- Check password is correct in JSON
- Try clearing browser localStorage: `localStorage.clear()` in console

## 📝 Sample Content Included

The site comes with example memories and quiz questions. Replace them with your own!

## ❤️ Made with Love

Created for celebrating special moments and memories. Enjoy building your forever timeline!

