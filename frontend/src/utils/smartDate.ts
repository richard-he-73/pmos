/**
 * 智能日期识别核心模块
 *
 * 将自然语言日期描述解析为 Date 对象，支持：
 *   - 相对日期：今天、明天、后天、N天后/前
 *   - 星期表达：下周一、本周五
 *   - 月份表达：下月1号、12月25日、下个月
 *   - 纯数字：625 → 06-25, 1225 → 12-25
 *   - 短横线：6-25、2026-6-25
 *   - 边界：月底、年底、去年年底
 *
 * @example
 *   tryRecognize('后天')        → Date(now + 2d)
 *   tryRecognize('625')         → Date(2026-06-25)
 *   tryRecognize('下周五')      → 下周五对应的日期
 *   fmtDate(new Date())         → '2026-06-25'
 */

// ─── Helpers ───

function offset(n: number): Date {
  const d = new Date(); d.setDate(d.getDate() + n); return d
}

function setYear(d: Date): Date {
  d.setFullYear(new Date().getFullYear())
  return d
}

function parseWeekday(s: string): number | null {
  const map: Record<string, number> = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7, '天': 7,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  }
  return map[s] ?? null
}

function nextWeekday(day: number): Date {
  const d = new Date()
  const cur = d.getDay() || 7
  d.setDate(d.getDate() + ((day - cur + 6) % 7) + 1 + 6) // 下周
  return d
}

function thisWeekday(day: number): Date {
  const d = new Date()
  const cur = d.getDay() || 7
  const diff = day - cur
  d.setDate(d.getDate() + (diff < 0 ? diff + 7 : diff))
  return d
}

// ─── Rules ───

type RuleFn = (input: string) => Date | null

const rules: RuleFn[] = [
  // 纯数字短日期: 625 → 06-25, 1225 → 12-25
  (s) => {
    const m = s.match(/^(\d{3,4})$/)
    if (!m) return null
    const v = m[1]
    if (v.length === 3) {
      const mo = parseInt(v[0]), d = parseInt(v.slice(1))
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return setYear(new Date(new Date().getFullYear(), mo - 1, d))
    } else if (v.length === 4) {
      const mo = parseInt(v.slice(0, 2)), d = parseInt(v.slice(2))
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return setYear(new Date(new Date().getFullYear(), mo - 1, d))
    }
    return null
  },
  // M-D / MM-DD: 6-25, 06-25
  (s) => {
    const m = s.match(/^(\d{1,2})[-\/](\d{1,2})$/)
    if (!m) return null
    const mo = parseInt(m[1]), d = parseInt(m[2])
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return setYear(new Date(new Date().getFullYear(), mo - 1, d))
    return null
  },
  // YYYY-M-D / YYYY-MM-DD
  (s) => {
    const m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/)
    if (!m) return null
    const y = parseInt(m[1]), mo = parseInt(m[2]), d = parseInt(m[3])
    if (y >= 1900 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31)
      return new Date(y, mo - 1, d)
    return null
  },
  // 今天 / 今日
  (s) => /^(今天|今日)$/.test(s) ? new Date() : null,
  // 明天 / 明日
  (s) => /^(明天|明日)$/.test(s) ? offset(1) : null,
  // 后天
  (s) => /^后天$/.test(s) ? offset(2) : null,
  // 昨天 / 昨日
  (s) => /^(昨天|昨日)$/.test(s) ? offset(-1) : null,
  // 大后天
  (s) => /^大后天$/.test(s) ? offset(3) : null,
  // N天后
  (s) => { const m = s.match(/^(\d+)天[后後]$/); return m ? offset(parseInt(m[1])) : null },
  // N天前
  (s) => { const m = s.match(/^(\d+)天[前以]/); return m ? offset(-parseInt(m[1])) : null },
  // N周后
  (s) => { const m = s.match(/^(\d+)(周|个星期)[后後]$/); return m ? offset(parseInt(m[1]) * 7) : null },
  // 下周一~日 / 下星期1~7
  (s) => {
    const m = s.match(/^下[周星期]([一二三四五六日天1-7])$/)
    if (!m) return null
    const day = parseWeekday(m[1])
    return day !== null ? nextWeekday(day) : null
  },
  // 这周一~日 / 本周一~日
  (s) => {
    const m = s.match(/^[这本][周星期]([一二三四五六日天1-7])$/)
    if (!m) return null
    const day = parseWeekday(m[1])
    return day !== null ? thisWeekday(day) : null
  },
  // 下 + 单字星期（下五、下一 → 下周五、下周一）
  (s) => {
    const m = s.match(/^下([一二三四五六日])$/)
    if (!m) return null
    const day = parseWeekday(m[1])
    return day !== null ? nextWeekday(day) : null
  },
  // 下周
  (s) => /^下周$/.test(s) ? offset(7) : null,
  // 下月1号 / 下个月1号 / 下月1日
  (s) => /^下(个?月)(1号|1日|1)$/.test(s) ? (() => { const d = new Date(); d.setMonth(d.getMonth() + 1, 1); return d })() : null,
  // 下个月
  (s) => /^下(个?)月$/.test(s) ? (() => { const d = new Date(); d.setMonth(d.getMonth() + 1, 1); return d })() : null,
  // 本月 / 这个月（当月第一天）
  (s) => /^([这本]月|当月)$/.test(s) ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) : null,
  // 月末 / 月底
  (s) => /^(月末|月底)$/.test(s) ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) : null,
  // 去年年底 / 去年末
  (s) => /^去年(年底|末)$/.test(s) ? new Date(new Date().getFullYear() - 1, 11, 31) : null,
  // 年底 / 年末
  (s) => /^[今]?年(底|末)$/.test(s) ? new Date(new Date().getFullYear(), 11, 31) : null,
  // 下个月N号 / 下月N日
  (s) => {
    const m = s.match(/^下(个?月)(\d{1,2})[号日]?$/)
    if (!m) return null
    const d = parseInt(m[2])
    if (d < 1 || d > 31) return null
    const dt = new Date(); dt.setMonth(dt.getMonth() + 1, d)
    // 超出当月天数则回退到月末
    if (dt.getDate() !== d) dt.setDate(0)
    return dt
  },
  // N个月后
  (s) => {
    const m = s.match(/^(\d+)个?月[后後]$/)
    if (!m) return null
    const d = new Date(); d.setMonth(d.getMonth() + parseInt(m[1])); return d
  },
  // N号 / N日（当月）
  (s) => {
    const m = s.match(/^(\d{1,2})[号日]$/)
    if (!m) return null
    const d = parseInt(m[1])
    if (d < 1 || d > 31) return null
    return new Date(new Date().getFullYear(), new Date().getMonth(), d)
  },
  // M月D日 / M月D号
  (s) => {
    const m = s.match(/^(\d{1,2})月(\d{1,2})[号日]?$/)
    if (!m) return null
    const mo = parseInt(m[1]), d = parseInt(m[2])
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return setYear(new Date(new Date().getFullYear(), mo - 1, d))
    return null
  },
  // 今年 / 本年
  (s) => /^(今年|本年)$/.test(s) ? new Date() : null,
]

// ─── Public API ───

/**
 * 解析自然语言日期字符串，返回 Date 对象。
 * 无法识别时返回 null。
 */
export function tryRecognize(input: string): Date | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  for (const rule of rules) {
    const result = rule(trimmed)
    if (result && !isNaN(result.getTime())) return result
  }
  return null
}

/**
 * 将 Date 格式化为 YYYY-MM-DD
 */
export function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 判断字符串是否为有效日期描述（可被 tryRecognize 识别）
 */
export function isDateString(s: string): boolean {
  return tryRecognize(s) !== null
}
