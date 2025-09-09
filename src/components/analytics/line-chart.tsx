"use client"

import { useTheme } from 'next-themes'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface LineChartProps {
  data: any[]
  dataKeys: string[]
  colors?: string[]
  height?: number
  title?: string
}

export function LineChartComponent({ 
  data, 
  dataKeys, 
  colors,
  height = 300,
  title 
}: LineChartProps) {
  const { theme } = useTheme()
  
  // Theme-aware color palette using design system colors
  const chartColors = colors || [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))'
  ]

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            className="opacity-30" 
          />
          <XAxis 
            dataKey="name" 
            className="text-xs"
            tick={{ 
              fontSize: 12, 
              fill: 'hsl(var(--muted-foreground))' 
            }}
            stroke="hsl(var(--border))"
          />
          <YAxis 
            className="text-xs"
            tick={{ 
              fontSize: 12, 
              fill: 'hsl(var(--muted-foreground))' 
            }}
            stroke="hsl(var(--border))"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Legend 
            wrapperStyle={{
              color: 'hsl(var(--foreground))',
            }}
          />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={2}
              dot={{ 
                fill: chartColors[index % chartColors.length], 
                strokeWidth: 2, 
                r: 4 
              }}
              activeDot={{ 
                r: 6, 
                strokeWidth: 2,
                fill: chartColors[index % chartColors.length]
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 