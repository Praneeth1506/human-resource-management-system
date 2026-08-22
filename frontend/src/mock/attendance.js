export const attendanceSummary = {
  present: 22,
  absent: 2,
  leave: 2,
  attendancePercentage: 84.6,
}

export const attendanceHistory = [
  { date: '2026-08-21', checkIn: '09:01 AM', checkOut: '05:05 PM', workingHours: '8h 04m', status: 'present' },
  { date: '2026-08-20', checkIn: '09:18 AM', checkOut: '05:02 PM', workingHours: '7h 44m', status: 'late' },
  { date: '2026-08-19', checkIn: '09:03 AM', checkOut: '05:10 PM', workingHours: '8h 07m', status: 'present' },
  { date: '2026-08-18', checkIn: null, checkOut: null, workingHours: null, status: 'leave' },
  { date: '2026-08-17', checkIn: '09:30 AM', checkOut: '01:00 PM', workingHours: '3h 30m', status: 'half_day' },
  { date: '2026-08-14', checkIn: '08:57 AM', checkOut: '05:12 PM', workingHours: '8h 15m', status: 'present' },
  { date: '2026-08-13', checkIn: '09:05 AM', checkOut: '05:08 PM', workingHours: '8h 03m', status: 'present' },
  { date: '2026-08-12', checkIn: null, checkOut: null, workingHours: null, status: 'absent' },
  { date: '2026-08-11', checkIn: '09:00 AM', checkOut: '05:06 PM', workingHours: '8h 06m', status: 'present' },
  { date: '2026-08-10', checkIn: null, checkOut: null, workingHours: null, status: 'leave' },
  { date: '2026-08-07', checkIn: '08:55 AM', checkOut: '05:01 PM', workingHours: '8h 06m', status: 'present' },
  { date: '2026-08-06', checkIn: '09:22 AM', checkOut: '05:04 PM', workingHours: '7h 42m', status: 'late' },
  { date: '2026-08-05', checkIn: '09:02 AM', checkOut: '05:09 PM', workingHours: '8h 07m', status: 'present' },
  { date: '2026-08-04', checkIn: '08:59 AM', checkOut: '05:00 PM', workingHours: '8h 01m', status: 'present' },
  { date: '2026-08-03', checkIn: null, checkOut: null, workingHours: null, status: 'absent' },
]

export const weeklyHours = [
  { day: 'Mon', hours: 8.1 },
  { day: 'Tue', hours: 7.7 },
  { day: 'Wed', hours: 8.2 },
  { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
]

export const WORK_START_TIME = '09:15 AM'
