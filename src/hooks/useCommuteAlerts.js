import { useEffect, useRef } from 'react'
import { subtractMinutes, formatTime } from '../utils/dateHelpers'
import { FACILITY_INFO } from '../utils/commuteCalc'

function minutesUntil(timeStr) {
  const now = new Date()
  const [h, m] = timeStr.split(':').map(Number)
  const target = new Date()
  target.setHours(h, m, 0, 0)
  return Math.round((target - now) / 60_000)
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fire(key, title, body, firedSet) {
  if (firedSet.has(key)) return
  firedSet.add(key)
  try {
    new Notification(title, {
      body,
      icon: `${import.meta.env.BASE_URL}icons/icon-192.svg`,
      badge: `${import.meta.env.BASE_URL}icons/icon-192.svg`,
      tag: key, // prevents duplicate system notifications
    })
  } catch (_) { /* permission denied or not supported */ }
}

export function useCommuteAlerts(todayShifts, getCategoryByKey) {
  const fired = useRef(new Set())

  // Request permission as soon as the hook mounts (commute tab opened)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!todayShifts.length) return

    const check = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const today = todayISO()

      todayShifts
        .filter((s) => s.date === today)
        .forEach((shift) => {
          const facility  = FACILITY_INFO[shift.employer] ?? FACILITY_INFO.other
          const leaveTime = subtractMinutes(shift.startTime, facility.driveMinutes)
          const mins      = minutesUntil(leaveTime)
          const cat       = getCategoryByKey(shift.employer)
          const label     = cat?.name ?? 'work'
          const startFmt  = formatTime(shift.startTime)
          const leaveFmt  = formatTime(leaveTime)
          const prefix    = `${shift.date}-${shift.employer}`

          // 30-minute warning
          if (mins <= 30 && mins > 27)
            fire(`${prefix}-30`, `Leave in 30 min — ${label}`, `Shift at ${startFmt}. Head out by ${leaveFmt}.`, fired.current)

          // 10-minute warning
          if (mins <= 10 && mins > 7)
            fire(`${prefix}-10`, `Leave in 10 min — ${label}!`, `Your ${startFmt} shift is coming up fast.`, fired.current)

          // Leave now
          if (mins <= 0 && mins > -3)
            fire(`${prefix}-0`, `Leave NOW — ${label}!`, `You should be heading to your ${startFmt} shift.`, fired.current)
        })
    }

    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [todayShifts, getCategoryByKey])
}
