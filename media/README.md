# Media Folder

Place your photos and videos here!

## Supported Formats

**Images:**
- .jpg, .jpeg
- .png
- .gif
- .webp

**Videos:**
- .mp4
- .webm
- .ogg

## Tips

- Keep filenames simple (no spaces, use hyphens: `my-photo.jpg`)
- Optimize images before uploading (compress large files)
- For large videos, consider using YouTube/Vimeo embeds instead
- Recommended max file size: 5MB per image, 20MB per video

## Example Structure

```
media/
├── sunset.jpg
├── first-date.jpg
├── birthday-video.mp4
└── special-moment.png
```

## How to Reference

In your JSON files, reference media like this:

```json
"media": {
  "type": "image",
  "url": "media/sunset.jpg"
}
```

