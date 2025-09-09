"use client"

import { useTheme } from 'next-themes'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AreaChartProps {
  data: any[]
  dataKeys: string[]
  colors?: string[]
  height?: number
  title?: string
}

export function AreaChartComponent({ 
  data, 
  dataKeys, 
  colors,
  height = 300,
  title 
}: AreaChartProps) {
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
        <AreaChart data={data}>
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
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={chartColors[index % chartColors.length]}
              fill={chartColors[index % chartColors.length]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
} 