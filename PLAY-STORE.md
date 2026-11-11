# Publishing Gita Ghar on Google Play

Do this **after** the AWS deploy works and family testing is done.

## 1. Check the name

Search Google Play for "Gita Ghar" and make sure no other app uses it.

## 2. Create the Android package with PWABuilder

1. Go to **pwabuilder.com** and enter your CloudFront address (or your own domain, if you add one).
2. Choose **Android → Generate package**.
   - Package ID: `uk.gitaghar.app` (or similar; it can never be changed later)
   - App name: `Gita Ghar`
   - Keep "Signing key: create new".
3. Download the zip. It contains the app bundle (`.aab`), your **signing key** and an `assetlinks.json` file.
4. **Back up the signing key and its passwords somewhere safe** (for example a password manager). Without them you can never update the app.
5. Copy `assetlinks.json` into this repository at `.well-known/assetlinks.json`, then run `./deploy.sh` again. This proves to Android that the website and the app belong together, so the app opens full-screen without a browser bar.

## 3. Google Play Console

1. Create a developer account at play.google.com/console (one-time fee, plus identity checks).
2. Create the app, upload the `.aab` to **Closed testing**, and invite at least **12 testers** (your family testing group). New personal accounts must run the closed test for **14 days in a row** before going public. Check the exact rules in the Console when you sign up.
3. Fill in the store listing (below), the privacy policy link, the **Data safety** form, and the content rating questionnaire.

Before publishing, replace `[CONTACT EMAIL]` in `privacy.html` with the email you want people to contact, and deploy again.

## Store listing

**App name (max 30 characters):** Gita Ghar: Gita for Families

**Short description (max 80 characters)**
- English: Krishna's wisdom for families abroad, in English, Hindi and Gujarati.
- हिन्दी: विदेश में बसे परिवारों के लिए श्रीकृष्ण का ज्ञान, तीन भाषाओं में।
- ગુજરાતી: વિદેશમાં વસતા પરિવારો માટે શ્રીકૃષ્ણનું જ્ઞાન, ત્રણ ભાષામાં.

**Full description (English)**

Gita Ghar brings the Bhagavad Gita home, for Indian families living abroad.

When life feels heavy, tell Krishna what's on your mind, in English, Hindi, Gujarati or Hinglish, and Gita Ghar finds a fitting verse from the Gita, explains it simply and suggests a small calming practice.

• Tell Krishna: write what you're feeling and get the right verse
• 12 feelings, including homesick, worried, angry, grief and guilt
• The whole Gita, all 18 chapters, as an interactive story
• Family mode: two languages side by side, so children and grandparents can read together, with a children's summary and a family question for every chapter
• A small daily practice and your own Gita diary
• Optional sign-in to back up your diary and use it on any phone
• Verses shown in Devanagari, Gujarati script and English, always with chapter and verse numbers
• Works offline. No adverts, no tracking.

Gita Ghar shares the Gita's wisdom. It is not a replacement for professional help. If you are struggling, please call Samaritans on 116 123 (UK) or Tele-MANAS on 14416 (India).

**Category:** Books & Reference (or Lifestyle)

## Data safety form: suggested answers

| Question | Answer |
|---|---|
| Does the app collect or share user data? | Yes, collects. Does not share with third parties for their own use. |
| Personal info → Email address | Collected, optional (only if the user signs in). Purpose: account management. |
| App activity → Other user-generated content | Collected, optional (diary backup). Purpose: app functionality. |
| Messages / text typed into smart matching | Processed ephemerally, not stored (select "processed ephemerally"). |
| Is data encrypted in transit? | Yes |
| Can users request deletion? | Yes, in the app (Account & settings → Delete my account) |

Double-check these against the current form, which Google updates from time to time.
