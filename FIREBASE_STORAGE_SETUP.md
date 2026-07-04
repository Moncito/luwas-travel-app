# Firebase Storage Configuration Guide

## Problem: Images Not Loading in Activity Cards

Activity images are failing to load in the customize trip page. This guide provides solutions to fix Firebase Storage image delivery.

---

## Root Causes & Solutions

### 1. **Firebase Storage CORS Configuration Missing**

**Symptom:** Images upload successfully but fail to load in the browser (gray placeholder appears)

**Fix:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Storage → Settings
3. Click "Cors Configuration" tab
4. Add the following CORS rules:

```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://luwas-travel.vercel.app"
    ],
    "method": ["GET", "HEAD", "DELETE", "POST", "PUT"],
    "responseHeader": ["Content-Type", "x-goog-acl"],
    "maxAgeSeconds": 3600
  }
]
```

> Replace `https://luwas-travel.vercel.app` with your actual domain

### 2. **Firestore Storage Rules Not Allowing Public Read**

**Symptom:** Image URLs are generated but downloads are blocked

**Fix:**
Update your Firebase Storage rules in Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload images
    match /uploads/{userId}/{allPaths=**} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null;  // Authenticated write only
    }

    // Fallback rule
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. **Image URLs Not Being Saved to Firestore**

**Symptom:** `imageUrl` field is empty in Firestore documents

**Check:**

1. Open Firebase Console → Firestore → activities collection
2. Click on an activity document
3. Verify the `imageUrl` field contains a valid URL (looks like: `https://firebasestorage.googleapis.com/...`)

**Fix:** If empty, check that `ImageUploader.tsx` is properly calling `onUploadComplete`:

```typescript
<ImageUploader onUploadComplete={(url) => setImageUrl(url)} />
```

### 4. **Next.js Image Config Not Allowing Firebase Domain**

**Status:** ✅ Already configured in `next.config.ts`

```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "firebasestorage.googleapis.com" },
  ];
}
```

---

## Testing Image Loading

### Local Testing

```bash
# 1. Start dev server
npm run dev

# 2. Go to admin panel → Add Activity
# 3. Upload an image and check:
#    - Image preview shows in form
#    - "Image uploaded!" toast appears
#    - Firestore contains imageUrl field with full URL

# 4. Navigate to customize trip page
# 5. Verify images load in activity cards
```

### Firestore Document Check

Expected `imageUrl` value:

```
https://firebasestorage.googleapis.com/v0/b/YOUR-PROJECT.appspot.com/o/uploads%2FTIMESTAMP-FILENAME.jpg?alt=media
```

---

## Advanced Debugging

### 1. Check Browser Console for Image Load Errors

1. Open DevTools (F12)
2. Go to Network tab
3. Try loading a page with images
4. Look for failed requests to `firebasestorage.googleapis.com`
5. Check the response headers and error messages

### 2. Check Firebase Storage Activity Logs

1. Firebase Console → Storage
2. Click on uploaded files
3. Verify permissions and access tokens

### 3. Test Direct Image URL

1. Copy an `imageUrl` from Firestore
2. Paste directly in browser address bar
3. If image loads, the URL is valid (CORS issue)
4. If you get error, check Storage Rules

---

## Quick Checklist

- [ ] Firebase Storage CORS configured for your domain
- [ ] Storage rules allow public `read` access
- [ ] `imageUrl` field populated in Firestore `activities` documents
- [ ] Image URLs use format: `https://firebasestorage.googleapis.com/...`
- [ ] Next.js config allows `firebasestorage.googleapis.com` domain
- [ ] Test image loads directly in browser tab

---

## Image Upload Flow

```
User selects image
    ↓
ImageUploader starts upload to Firebase Storage
    ↓
getDownloadURL() returns public URL with permanent access token
    ↓
URL passed to onUploadComplete callback
    ↓
State updated: setImageUrl(url)
    ↓
Saved to Firestore in 'imageUrl' field
    ↓
Activity card fetches from Firestore
    ↓
Next.js Image component loads from firebasestorage.googleapis.com
    ↓
✅ Image displays in card
```

---

## Common Issues & Fixes

| Issue                                         | Solution                                               |
| --------------------------------------------- | ------------------------------------------------------ |
| Gray placeholder in activity cards            | Check CORS config, Storage rules, image URL exists     |
| "Image unavailable" error message             | Image URL is invalid or has expired (shouldn't happen) |
| Upload succeeds but no preview                | `onUploadComplete` not wired up or callback not firing |
| Profile images load but activity images don't | Different Storage folders with different permissions   |
| Images work on localhost but not on Vercel    | Add Vercel domain to CORS config                       |

---

## If All Else Fails

1. **Reset Storage Rules:**

   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;  // Public access - test only!
       }
     }
   }
   ```

   Test if images load → if yes, restrict rules. If no, problem is URL generation.

2. **Check ActivityUploader Logs:**

   ```typescript
   // In ImageUploader.tsx, add logging:
   console.log("✅ Upload complete:", url);
   ```

3. **Check Next.js Build:** Some image config issues only appear after `next build`
   ```bash
   npm run build
   npm run start
   ```

---

## Reference

- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)
- [Firebase CORS Guide](https://cloud.google.com/storage/docs/cross-origin)
