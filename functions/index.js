// AI photo grader — a callable Cloud Function that sends a learner's uploaded
// photo to OpenAI's vision model and returns a structured grade on the six
// fundamentals the Aperture course teaches.
//
// The OpenAI API key is a Secret Manager secret (OPENAI_API_KEY), never
// shipped to the client. Set it once with:
//   firebase functions:secrets:set OPENAI_API_KEY
// Requires the Blaze plan (Functions need outbound network to reach OpenAI).

const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const OpenAI = require('openai')

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')

// Vision + JSON-schema structured outputs. Swap to a newer vision model here if desired.
const MODEL = 'gpt-4o'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const LESSON_IDS = ['exposure-triangle', 'depth-of-field', 'metering', 'white-balance', 'rule-of-thirds', 'light-direction']

const SYSTEM = `You are the photography coach inside "Aperture", a hands-on course that teaches beginners exposure, depth of field, metering, white balance, composition, and light. A learner has uploaded one of their own photos for a grade.

Grade it like a warm, honest mentor — encouraging but specific and truthful. Ground EVERY observation in what is actually visible in the image; never invent detail you cannot see. Be kind: even a weak photo has something working. Speak in a photographer's felt language ("the background separates nicely", "the highlights are clipping on the sky"), not a jargon dump.

Score these six dimensions 1–10 and give an overall 0–100:
- Exposure — too dark / too bright / well judged? clipped highlights or crushed shadows?
- Focus & depth — is the subject sharp? is depth of field used well (background separation, or appropriate deep focus)?
- Composition — framing, balance, thirds / leading lines / negative space; is the subject placed with intent?
- Colour & white balance — does colour read natural (or intentionally stylised), or is there an unwanted cast?
- Light — quality and direction of light; does it shape the subject or fall flat?
- Subject & moment — is there a clear subject and a reason for the photo?

Then give 1–3 genuine strengths, 1–3 specific and actionable improvements, and the ONE Aperture lesson that would most help this photographer next (choose its id from the allowed set) with a one-line why.

Keep every string tight and human. Return only the structured grade.`

const GRADE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['overall', 'verdict', 'dimensions', 'strengths', 'improvements', 'nextLesson'],
  properties: {
    overall: { type: 'integer', description: 'Overall quality, 0–100.' },
    verdict: { type: 'string', description: 'One warm, specific sentence summarising the photo.' },
    dimensions: {
      type: 'array',
      description: 'Exactly the six fundamentals, each scored.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'score', 'note'],
        properties: {
          name: { type: 'string', enum: ['Exposure', 'Focus & depth', 'Composition', 'Colour & white balance', 'Light', 'Subject & moment'] },
          score: { type: 'integer', description: 'Score 1–10.' },
          note: { type: 'string', description: 'One concrete, kind observation grounded in what is visible.' },
        },
      },
    },
    strengths: { type: 'array', description: '1–3 genuine strengths.', items: { type: 'string' } },
    improvements: { type: 'array', description: '1–3 specific, actionable next steps.', items: { type: 'string' } },
    nextLesson: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'title', 'why'],
      properties: {
        id: { type: 'string', enum: LESSON_IDS },
        title: { type: 'string', description: 'The lesson name.' },
        why: { type: 'string', description: 'One line on why this lesson helps next.' },
      },
    },
  },
}

exports.gradePhoto = onCall(
  { secrets: [OPENAI_API_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    // Any signed-in user (including the anonymous "guest") may grade; this keeps
    // the paid endpoint from being hit by fully unauthenticated callers.
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to grade a photo.')

    const { imageBase64, mimeType } = request.data || {}
    if (!imageBase64 || !mimeType) throw new HttpsError('invalid-argument', 'Send imageBase64 and mimeType.')
    if (!ALLOWED_MIME.has(mimeType)) throw new HttpsError('invalid-argument', 'Use a JPEG, PNG, WebP, or GIF image.')
    if (imageBase64.length > 7_000_000) throw new HttpsError('invalid-argument', 'Image too large — downscale before uploading.')

    const client = new OpenAI({ apiKey: OPENAI_API_KEY.value() })

    let completion
    try {
      completion = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Grade this photograph.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'auto' } },
            ],
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'photo_grade', strict: true, schema: GRADE_SCHEMA },
        },
      })
    } catch (err) {
      console.error('OpenAI call failed', err)
      throw new HttpsError('internal', 'The grader had trouble — please try again.')
    }

    const choice = (completion.choices || [])[0]
    // A strict-schema refusal comes back on message.refusal, not as content.
    if (choice?.message?.refusal) {
      throw new HttpsError('failed-precondition', 'This image could not be graded.')
    }

    const text = choice?.message?.content
    if (!text) throw new HttpsError('internal', 'No grade came back — please try again.')

    // Structured outputs return clean JSON; parse defensively all the same.
    let grade
    try {
      grade = JSON.parse(text)
    } catch {
      const m = text.match(/\{[\s\S]*\}/)
      if (!m) throw new HttpsError('internal', 'The grade was malformed — please try again.')
      grade = JSON.parse(m[0])
    }
    return grade
  },
)
