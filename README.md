# Gita Saathi

An interactive Bhagavad Gita companion, in English mixed with Hindi.

When someone feels stressed, they can open Gita Saathi, say what they're feeling, and hear what Krishna said about it in the Gita. They can also play through the Gita chapter by chapter as a short story, making choices and doing small calming actions along the way.

## Features

### Mann ghabraya hai? (What's troubling you?)

The user picks one of 9 feelings. Each one shows:

1. A short line of story context
2. Krishna's verse in Devanagari, then in English letters, then its meaning, with the chapter and verse number
3. A simple explanation in English and Hindi
4. A small action, such as breathing, writing or letting a feeling float away
5. A card to keep, saved on the device

| Feeling | Verse |
|---|---|
| Worried about results | 2.47 |
| Angry | 2.63 |
| Feeling low | 2.14 |
| Feeling like a failure | 6.5 |
| Comparing myself | 3.35 |
| Missing someone I lost | 2.20 |
| Restless mind, overthinking | 6.35 |
| Tired, burnt out | 6.17 |
| Alone, everything is too much | 18.66 |

### Gita ki kahani (The Gita story)

All 18 chapters are playable as levels. Progress is saved on the device.

| Chapter | Key verses | Activities |
|---|---|---|
| 1–2 Arjuna ka Dukh, Krishna ka Gyaan | 2.47, 2.48 | Arjuna's feeling, your worry, breathing, planting seeds, praise and criticism at a lotus, lifting the bow |
| 3 Karma Yoga | 3.5, 3.21, 3.37 | Try to do nothing for 10 seconds, who learns from you, how desire becomes anger |
| 4 Gyaan aur Karma | 4.7–8, 4.34, 4.42 | Bring back the light, who to learn from, cut a doubt |
| 5 Karma Sanyasa Yoga | 5.2, 5.10, 5.18, 5.29 | Water on a lotus leaf, the same light in all beings |
| 6 Dhyana Yoga | 6.5, 6.19, 6.26, 6.40 | Friend or enemy voice, steady the lamp, bring back wandering thoughts |
| 7 Gyaan aur Vigyaan | 7.7, 7.8, 7.16 | String a pearl mala, find Krishna in water, moon, sun and strength |
| 8 Akshara Brahma Yoga | 8.6, 8.7 | Arjuna's seven questions, the garden of thoughts |
| 9 Raja Vidya | 9.22, 9.26, 9.27, 9.31 | Make an offering, hand heavy bags to Krishna |
| 10 Vibhuti Yoga | 10.20, 10.25–37, 10.41 | Reveal Krishna's glories, ending with Arjuna |
| 11 Vishwarupa Darshana | 11.8, 11.12, 11.45, 11.54 | Open divine eyes, light the suns, bring gentle Krishna back |
| 12 Bhakti Yoga | 12.8, 12.9–11, 12.13–14 | Krishna's ladder, a garland of qualities |
| 13 Kshetra aur Kshetragya | 13.2, 13.8, 13.28 \* | Shine awareness on the field of body and mind |
| 14 Teen Gun | 14.5, 14.17, 14.26 | Sort habits into sattva, rajas and tamas |
| 15 Purushottama Yoga | 15.1, 15.15 | Cut the upside-down tree's branches, find Krishna in your heart |
| 16 Daivi aur Asuri | 16.1–3, 16.5, 16.21 | Find your divine quality, close the three gates |
| 17 Shraddha | 17.3, 17.15, 17.20 | Sort foods into bowls, choose words that are true, kind and helpful |
| 18 Moksha Sanyasa | 18.47, 18.63, 18.66, 18.73, 18.78 | Your choice, Arjuna stands, light 18 diyas |

\* Chapter 13 is numbered one lower in some editions, so the app shows both numbers.

## Languages

Choose **English**, **हिन्दी (Hindi)** or **ગુજરાતી (Gujarati)** from the top of the home page. The choice is remembered on the device.

- In Hindi, the Sanskrit verses are shown in Devanagari. In Gujarati, they are shown in Gujarati script.
- Translations live in their own files, so they can be checked or corrected without touching the app code:
  - `lang/hi.js` for Hindi
  - `lang/gu.js` for Gujarati
- Each line is `"English text": "translation"`. To fix a translation, change only the text on the right.

| Part of the app | Hindi | Gujarati |
|---|---|---|
| Home page, menus, chapter list | Done | Done |
| Mann ghabraya hai? (all 9 feelings) | Done | Done |
| Verse meanings in the chapters | Done | Done |
| All 18 chapter stories | Done | Done |

The translations still need checking by native speakers before the app is shared widely.

## How to run it

The app is `index.html` plus two language files in `lang/`, with no build step and no server needed.

- **On your computer:** download the repository (Code → Download ZIP), unzip it, and open `index.html` in any browser.
- **Online:** turn on GitHub Pages for this repository (Settings → Pages → Deploy from branch → `main`, folder `/ (root)`).

## Built with

- HTML, CSS and plain JavaScript (no frameworks)
- Inline SVG for the illustrations, all original drawings
- `localStorage` to save cards and chapter progress on the device
- Google Fonts: Baloo 2, Mukta and Tiro Devanagari Sanskrit

## A note on the content

- Krishna's actual verses are always shown with their chapter and verse number. Everything else is a retelling in simple words and is labelled as story or explanation.
- The verse translations are my own simple renderings and are still being checked by someone who knows the Gita well.
- This app shares the Gita's wisdom. It isn't a replacement for talking to someone. If things feel very heavy, please call **Samaritans on 116 123** (UK) or **Tele-MANAS on 14416** (India).
