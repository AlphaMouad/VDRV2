'use server'

export interface InvestorAccount {
  investorId: string
  fullName: string
  companyName: string
  email: string
  numberOfVillas: number
  avatarType: 'REPE' | 'FamilyOffice' | 'UHNWI' | 'Other'
}

// Google Sheet ID: 19xhrYZ3x9YvPHCQq26TC9KQ1kuIQL0t7ocSOuig64A0
// This URL fetches the CSV export of the sheet.
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/19xhrYZ3x9YvPHCQq26TC9KQ1kuIQL0t7ocSOuig64A0/gviz/tq?tqx=out:csv'

// Column layout (0-indexed):
//   [0] investorId
//   [1] fullName
//   [2] companyName
//   [3] email
//   [4] password
//   [5] numberOfVillas
//   [6] avatarType (Investor Type)
// Note: We check user credentials AND investor type from this sheet.

// ─── CSV parser (handles quoted fields with embedded commas / quotes) ─────────

function parseCSVRow(row: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

interface RawAccount extends InvestorAccount {
  password: string
}

function parseAvatarType(raw: string): 'REPE' | 'FamilyOffice' | 'UHNWI' | 'Other' {
  const v = raw.trim().toLowerCase().replace(/[\s_-]+/g, '')
  if (v === 'repe') return 'REPE'
  if (v === 'familyoffice' || v === 'fo') return 'FamilyOffice'
  if (v === 'uhnwi') return 'UHNWI'
  return 'Other'
}

function parseCSV(csv: string): RawAccount[] {
  const lines = csv.split('\n').filter((line) => line.trim())
  if (lines.length < 2) return []

  return lines
    .slice(1) // skip header row
    .map((line) => {
      const fields = parseCSVRow(line)
      return {
        investorId:    fields[0] || '',
        fullName:      fields[1] || '',
        companyName:   fields[2] || '',
        email:         fields[3] || '',
        password:      fields[4] || '',
        numberOfVillas: parseInt(fields[5], 10) || 20,
        // Extract Investor Type (Avatar Type) from column 6
        avatarType:    parseAvatarType(fields[6] || ''),
      }
    })
    // Allow users even if password is empty (to recognize they exist in system logs)
    // but still require (email || investorId) to be valid
    .filter((a) => a.email || a.investorId)
}

// ─── In-memory cache (5-minute TTL) ──────────────────────────────────────────

let cachedAccounts: RawAccount[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000

async function fetchAccounts(): Promise<RawAccount[]> {
  const now = Date.now()
  if (cachedAccounts && now - cacheTimestamp < CACHE_TTL) {
    return cachedAccounts
  }

  try {
    console.log('Fetching accounts from Google Sheet...')
    const res = await fetch(SHEET_URL, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`)
    const csv = await res.text()
    // console.log('CSV fetched (length):', csv.length)
    cachedAccounts = parseCSV(csv)
    cacheTimestamp = now
    console.log('Parsed accounts count:', cachedAccounts.length)
    return cachedAccounts
  } catch (error) {
    console.error('Failed to fetch accounts from Google Sheet', error)
    // On network error fall back to cached data if available
    if (cachedAccounts) return cachedAccounts
    throw error
  }
}

// ─── Authentication ───────────────────────────────────────────────────────────
// Accepts either an email address OR an investorId as the first credential,
// so both "AMG-2026-0001" and "investor@example.com" work as the username.

export async function authenticateFromSheet(
  identifier: string,
  password: string
): Promise<InvestorAccount | null> {
  const accounts = await fetchAccounts()
  const id = identifier.trim().toLowerCase()

  console.log(`Authenticating user: ${id}`)

  // Find user by email or investorId and verify password
  const match = accounts.find(
    (a) =>
      (a.email.toLowerCase() === id || a.investorId.toLowerCase() === id) &&
      a.password === password
  )

  if (!match) {
    console.log(`Authentication failed for user: ${id}`)
    // Debug: check if user exists but password mismatch
    const userExists = accounts.find(
       (a) => a.email.toLowerCase() === id || a.investorId.toLowerCase() === id
    )
    if (userExists) {
      console.log('User exists but password mismatch.')
      // Be careful not to log the actual password in production logs if possible,
      // but for debugging this issue we might need to verify what's being compared.
      // console.log(`Expected password length: ${userExists.password.length}, Received: ${password.length}`)
    } else {
      console.log('User not found in sheet.')
      // Log available emails/IDs for debugging (safe if logs are private)
      // console.log('Available users:', accounts.map(a => `${a.email} / ${a.investorId}`))
    }
    return null
  }

  console.log(`Authentication successful for user: ${id}`)

  // Return the account including the verified investor type (avatarType)
  return {
    investorId:    match.investorId,
    fullName:      match.fullName,
    companyName:   match.companyName,
    email:         match.email,
    numberOfVillas: match.numberOfVillas,
    avatarType:    match.avatarType,
  }
}

// ─── Cache invalidation (call after admin edits the sheet) ───────────────────
export async function invalidateAuthCache(): Promise<void> {
  cachedAccounts = null
  cacheTimestamp = 0
}
