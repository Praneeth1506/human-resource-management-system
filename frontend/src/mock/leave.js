export const leaveBalance = {
  casual: 8,
  sick: 6,
  used: 4,
}

export const leaveRequests = [
  {
    id: 'lv-1',
    type: 'Sick Leave',
    startDate: '2026-08-10',
    endDate: '2026-08-11',
    days: 2,
    remarks: 'Fever, resting at home.',
    status: 'approved',
  },
  {
    id: 'lv-2',
    type: 'Casual Leave',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    days: 1,
    remarks: 'Personal work.',
    status: 'pending',
  },
  {
    id: 'lv-3',
    type: 'Casual Leave',
    startDate: '2026-07-05',
    endDate: '2026-07-05',
    days: 1,
    remarks: 'Family function.',
    status: 'rejected',
  },
]

export const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Unpaid Leave']
