# 🚀 How to Use PTForever

## Quick Navigation

### 🏠 Main Pages:
- **`index.html`** - Opens the main memory timeline
- **`favorites-quiz.html`** - Takes the Favorites Quiz (30 questions)
- **`quiz.html`** - Takes Thuvaraha's Birthday Quiz

### 📍 Where is Everything?

**In the Sidebar (left side):**
1. **📖 All Memories** - Main timeline page
2. **🎯 Birthday Quiz** - Quiz for Thuvaraha's birthday
3. **💝 Favorites Quiz** - Quiz about your favorite things
4. **⏱️ Timeline** - Click to expand, shows all dates including **October 20, 2024**

## 🎯 To Take the Favorites Quiz:

**Option 1:** Open `favorites-quiz.html` in your browser
**Option 2:** Click "💝 Favorites Quiz" in the sidebar

## 📅 To See October 20, 2024:

1. Open `index.html`
2. Look at the left sidebar
3. Click "⏱️ Timeline" to expand it
4. You'll see "October 20, 2024" in the list
5. Click it to open the full page

## ✏️ How to Add Content

### Add a Memory:
Edit `data/memories.json`:
```json
{
  "id": "new-memory",
  "date": "2024-11-01",
  "title": "Memory Title",
  "content": "Memory description...",
  "tags": ["tag1", "tag2"],
  "hasPage": true
}
```

### Add a Quiz Question:
Edit `data/favorites-quiz.json`:
```json
{
  "id": "new-question",
  "category": "Movies",
  "question": "Question text?",
  "answers": ["A", "B", "C", "D"],
  "correctAnswer": 0
}
```

## 🐛 Troubleshooting

**Quiz not loading?**
- Make sure JSON file is valid
- Open browser console (F12) to see errors

**October 20 not showing?**
- Click the "⏱️ Timeline" button to expand it
- It should be at the top of the list

**Need help?**
- Check `README.md` for full documentation
- Check browser console (F12) for errors

## 📂 File Structure

```
PTForever/
├── index.html              # Main page - START HERE
├── favorites-quiz.html     # Favorites quiz
├── quiz.html               # Birthday quiz
├── memory.html             # Dynamic memory pages
├── data/
│   ├── memories.json       # Edit to add memories
│   └── favorites-quiz.json # Edit to add quiz questions
├── media/                  # Put photos/videos here
└── css/ js/               # Styling and functionality
```

## 🎨 What You Have

✅ Memory timeline with October 20, 2024
✅ Favorites Quiz (30 questions ready!)
✅ Birthday Quiz
✅ Dynamic memory pages
✅ Beautiful design with purple theme
✅ Mobile responsive
✅ Easy to update (just edit JSON)

That's it! Keep it simple. 🎉

