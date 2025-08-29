// index.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const isNumeric = (s) => /^[-+]?\d+$/.test(s);
const isAlpha = (s) => /^[A-Za-z]+$/.test(s);

// Build concat_string: take ALL letters across input (from any item), reverse, alternate caps (Upper, lower, ...)
function buildConcatString(data) {
  const letters = [];
  for (const item of data) {
    if (typeof item === 'string') {
      for (const ch of item) if (/[A-Za-z]/.test(ch)) letters.push(ch);
    }
  }
  letters.reverse();
  return letters
    .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join('');
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body || {};
    if (!Array.isArray(data)) {
      return res.status(400).json({ is_success: false, message: 'data must be an array' });
    }

    const odd_numbers = [];
    const even_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let sum = 0;

    for (const raw of data) {
      const s = String(raw);
      if (isNumeric(s)) {
        const n = parseInt(s, 10);
        (Math.abs(n) % 2 === 0 ? even_numbers : odd_numbers).push(s); // keep numbers as strings
        sum += n;
      } else if (isAlpha(s)) {
        alphabets.push(s.toUpperCase()); // alphabets converted to uppercase
      } else {
        special_characters.push(s);
      }
    }

    const user_id =
      `${(process.env.FULL_NAME || 'john doe').toLowerCase().replace(/\s+/g, '_')}` +
      `_${process.env.DOB_DDMMYYYY || '01011990'}`;

    return res.status(200).json({
      is_success: true,
      user_id,
      email: process.env.EMAIL || 'john@xyz.com',
      roll_number: process.env.ROLL_NUMBER || 'ABCD123',
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(sum),
      concat_string: buildConcatString(data),
    });
  } catch (err) {
    return res.status(500).json({ is_success: false, message: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
