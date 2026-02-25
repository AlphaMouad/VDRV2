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
      // Don't trim here, preserve raw field content (including potential spaces in passwords)
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  // Push the last field
  fields.push(current)
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
  // Normalize line endings to \n and split
  // Filter out empty lines (whitespace only)
  const lines = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((line) => line.trim().length > 0)

  if (lines.length < 2) return []

  return lines
    .slice(1) // skip header row
    .map((line) => {
      const fields = parseCSVRow(line)
      // Trim spaces from non-password fields for safety
      // For password, we trim it too because typically users don't want leading/trailing spaces
      // unless they are part of a very specific password policy (unlikely for sheet entry).
      // However, to fix "complex password issues", maybe the sheet has hidden chars?
      // We'll stick to trim() but log lengths for debugging if needed.
      const rawPassword = fields[4] || ''
      const trimmedPassword = rawPassword.trim()

      return {
        investorId:    (fields[0] || '').trim(),
        fullName:      (fields[1] || '').trim(),
        companyName:   (fields[2] || '').trim(),
        email:         (fields[3] || '').trim(),
        password:      trimmedPassword,
        numberOfVillas: parseInt((fields[5] || '').trim(), 10) || 20,
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

  // Find user by email or investorId
  const match = accounts.find(
    (a) =>
      (a.email.toLowerCase() === id || a.investorId.toLowerCase() === id)
  )

  if (!match) {
    console.log(`Authentication failed: User not found: ${id}`)
    return null
  }

  // Verify password
  if (match.password !== password) {
    console.log(`Authentication failed: Password mismatch for user ${id}`)
    // Log helpful debug info (without revealing full password if possible)
    console.log(`Stored password length: ${match.password.length}, Received length: ${password.length}`)
    if (match.password.length > 0 && password.length > 0) {
        console.log(`Stored start/end: "${match.password[0]}...${match.password[match.password.length-1]}"`)
        console.log(`Received start/end: "${password[0]}...${password[password.length-1]}"`)
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
