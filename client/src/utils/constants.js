export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Abuse Case Management System'

export const CASE_STATUS = {
  REPORTED: 'reported',
  ASSIGNED: 'assigned',
  UNDER_INVESTIGATION: 'under_investigation',
  INVESTIGATION: 'investigation',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
}

export const ABUSE_TYPES = {
  SEXUAL_ABUSE: 'sexual_abuse',
  PHYSICAL_ABUSE: 'physical_abuse',
  EMOTIONAL_ABUSE: 'emotional_abuse',
  NEGLECT: 'neglect',
  EXPLOITATION: 'exploitation',
  OTHER: 'other',
}

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export const formatCaseStatus = (status) => {
  const statusMap = {
    [CASE_STATUS.REPORTED]: 'Reported',
    [CASE_STATUS.ASSIGNED]: 'Assigned',
    [CASE_STATUS.UNDER_INVESTIGATION]: 'Under Investigation',
    [CASE_STATUS.INVESTIGATION]: 'Investigation',
    [CASE_STATUS.RESOLVED]: 'Resolved',
    [CASE_STATUS.CLOSED]: 'Closed',
    [CASE_STATUS.REOPENED]: 'Reopened',
  }
  return statusMap[status] || status
}

export const formatAbuseType = (type) => {
  const typeMap = {
    [ABUSE_TYPES.SEXUAL_ABUSE]: 'Sexual Abuse',
    [ABUSE_TYPES.PHYSICAL_ABUSE]: 'Physical Abuse',
    [ABUSE_TYPES.EMOTIONAL_ABUSE]: 'Emotional Abuse',
    [ABUSE_TYPES.NEGLECT]: 'Neglect',
    [ABUSE_TYPES.EXPLOITATION]: 'Exploitation',
    [ABUSE_TYPES.OTHER]: 'Other',
  }
  return typeMap[type] || type
}