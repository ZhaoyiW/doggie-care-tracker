import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'
import useStore from '../store'
import { getLast30Days, formatDateShort } from '../utils/dateUtils'
import { computePoopLabel, getPoopEventsForDate } from '../utils/poopLabelEngine'

export default function Trends() {
  const poopLogs = useStore(s => s.poopLogs || [])
  const symptomLogs = useStore(s => s.symptomLogs)

  const last30 = useMemo(() => getLast30Days(), [])

  const trendData = useMemo(() => {
    return last30.map(date => {
      const events = getPoopEventsForDate(poopLogs, date)
      const label = computePoopLabel(events)
      return {
        date,
        shortDate: formatDateShort(date),
        count: events.length,
        label: label.key,
        color: label.color,
        hasLoose: events.some(e => e.status === 'LOOSE'),
        isNormal: label.key === 'NORMAL',
      }
    })
  }, [poopLogs, last30])

  const weightData = useMemo(() => {
    return symptomLogs
      .filter(s => s.weight && last30.includes(s.date))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(s => ({ date: formatDateShort(s.date), weight: s.weight }))
  }, [symptomLogs, last30])

  const stats = useMemo(() => ({
    loose: trendData.filter(d => d.hasLoose).length,
    normal: trendData.filter(d => d.isNormal).length,
    noRecord: trendData.filter(d => d.count === 0).length,
    total: trendData.reduce((sum, d) => sum + d.count, 0),
  }), [trendData])

  // Show every 5th label on x-axis to avoid crowding
  const xTickData = trendData.map((d, i) => ({
    ...d,
    displayDate: i % 5 === 0 ? d.shortDate : '',
  }))

  return (
    <div className="page-content">
      <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700 }}>📊 趋势分析</h1>

      {/* Stats summary */}
      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-item">
          <div className="stat-num" style={{ color: 'var(--red)' }}>{stats.loose}</div>
          <div className="stat-label">拉稀天数</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" style={{ color: 'var(--green)' }}>{stats.normal}</div>
          <div className="stat-label">正常天数</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-label">总排便次数</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" style={{ color: 'var(--gray)' }}>{stats.noRecord}</div>
          <div className="stat-label">无记录天</div>
        </div>
      </div>

      {/* Poop count bar chart */}
      <div className="card">
        <p className="card-title">💩 近30天排便次数</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={xTickData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(val, name) => [val, '次数']}
              labelFormatter={(label) => label}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {xTickData.map((entry, i) => (
                <Cell key={i} fill={entry.color || 'var(--gray)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="legend" style={{ marginTop: 8 }}>
          {[
            { color: '#8FAF8F', label: '正常' },
            { color: '#C9B99A', label: '软便' },
            { color: '#C08080', label: '拉稀' },
            { color: '#C9A87A', label: '便秘倾向' },
            { color: '#B0ABA5', label: '无记录' },
          ].map(({ color, label }) => (
            <div key={label} className="legend-item">
              <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weight trend */}
      {weightData.length >= 2 && (
        <div className="card">
          <p className="card-title">⚖️ 体重趋势（kg）</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightData} margin={{ top: 4, right: 16, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--muted)' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                formatter={(val) => [`${val}kg`, '体重']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--accent)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analysis hint */}
      <div className="card" style={{ background: '#F0F4F8' }}>
        <p className="card-title" style={{ color: 'var(--accent)' }}>💡 分析提示</p>
        {stats.loose > 3 ? (
          <p style={{ margin: 0, fontSize: 14 }}>
            近30天有 <strong>{stats.loose}</strong> 天出现拉稀，建议对照日历查看饮食变化，或咨询医生。
          </p>
        ) : stats.noRecord > 20 ? (
          <p style={{ margin: 0, fontSize: 14 }}>记录天数较少，建议每天记录遛狗排便，以便分析健康趋势。</p>
        ) : (
          <p style={{ margin: 0, fontSize: 14 }}>
            近30天正常 <strong>{stats.normal}</strong> 天，状态良好！继续保持记录习惯。
          </p>
        )}
      </div>
    </div>
  )
}
