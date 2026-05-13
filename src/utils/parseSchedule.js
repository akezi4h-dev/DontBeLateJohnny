const MONTH_MAP = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
  sep: 9, oct: 10, nov: 11, dec: 12,
}

function detectEmployer(text) {
  const t = text.toLowerCase()
  if (t.includes('publix')) return 'publix'
  if (t.includes('vanderbilt') || t.includes('vumc')) return 'vanderbilt'
  if (t.includes('nashville general') || t.includes('ngh') || t.includes('general hospital')) return 'nashville_general'
  return 'other'
}

// "7:00 AM", "07:00", "7am", "7:00am" → "07:00" | null
function parseTime(raw) {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '')
  const m12 = s.match(/^(\d{1,2}):(\d{2})(am|pm)$/)
  if (m12) {
    let h = parseInt(m12[1]), min = parseInt(m12[2])
    if (m12[3] === 'pm' && h !== 12) h += 12
    if (m12[3] === 'am' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
  }
  const mShort = s.match(/^(\d{1,2})(am|pm)$/)
  if (mShort) {
    let h = parseInt(mShort[1])
    if (mShort[2] === 'pm' && h !== 12) h += 12
    if (mShort[2] === 'am' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:00`
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/)
  if (m24) return `${String(parseInt(m24[1])).padStart(2, '0')}:${m24[2]}`
  return null
}

// Various date formats → "YYYY-MM-DD" | null
function parseDate(raw, fallbackYear = new Date().getFullYear()) {
  const s = raw.trim().toLowerCase()
  // "May 13, 2026" or "May 13"
  const mLong = s.match(/([a-z]+)\s+(\d{1,2})(?:[,\s]+(\d{4}))?/)
  if (mLong && MONTH_MAP[mLong[1]]) {
    const month = MONTH_MAP[mLong[1]]
    const day = parseInt(mLong[2])
    const year = mLong[3] ? parseInt(mLong[3]) : fallbackYear
    if (day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  // "5/13/2026" or "5/13"
  const mSlash = s.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/)
  if (mSlash) {
    const month = parseInt(mSlash[1])
    const day = parseInt(mSlash[2])
    let year = mSlash[3] ? parseInt(mSlash[3]) : fallbackYear
    if (year < 100) year += 2000
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  return null
}

export function parseScheduleText(ocrText) {
  const lines = ocrText.split('\n').map((l) => l.trim()).filter(Boolean)
  const shifts = []
  const fallbackYear = new Date().getFullYear()
  const globalEmployer = detectEmployer(ocrText)

  // "7:00 AM - 3:00 PM", "7am-3pm", "07:00 to 15:00", "9:30 AM – 6:00 PM (CDT)"
  const rangeRe = /([\d]{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*[-–—to]+\s*([\d]{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
  // iOS Calendar bare day: "16", "16SAT", "06"
  const bareDayRe = /^(\d{1,2})\s*(?:mon|tue|wed|thu|fri|sat|sun)?$/i

  let lastDate = null
  let currentMonth = null
  let currentYear = fallbackYear

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase().trim()

    // Standalone month header ("May", "June") — iOS Calendar section divider
    if (MONTH_MAP[lineLower]) {
      currentMonth = MONTH_MAP[lineLower]
      continue
    }

    // Skip All Day and Off labels
    if (/^all\s*day$/i.test(line) || /^off$/i.test(line)) continue

    // Standard date formats ("May 13", "5/13/2026")
    const date = parseDate(line, currentYear)
    if (date) lastDate = date

    // iOS Calendar bare day number ("16", "16 SAT") when we know the month
    if (!date && currentMonth) {
      const bd = line.match(bareDayRe)
      if (bd) {
        const day = parseInt(bd[1])
        if (day >= 1 && day <= 31) {
          lastDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        }
      }
    }

    // Time range on this line
    const rangeMatch = line.match(rangeRe)
    if (rangeMatch && lastDate) {
      const startTime = parseTime(rangeMatch[1])
      const endTime = parseTime(rangeMatch[2])

      if (startTime && endTime) {
        const contextLines = lines.slice(Math.max(0, i - 4), Math.min(lines.length, i + 4))
        const employer = detectEmployer(contextLines.join(' ')) || globalEmployer

        const duplicate = shifts.some((s) => s.date === lastDate && s.startTime === startTime)
        if (!duplicate) {
          shifts.push({ employer, date: lastDate, startTime, endTime, notes: '' })
        }
      }
    }
  }

  return shifts
}
