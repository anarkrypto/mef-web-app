'use client'

import { type FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
	TooltipProps,
} from 'recharts'
import { InfoIcon } from 'lucide-react'
import { ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { NameType } from 'recharts/types/component/DefaultTooltipContent'

interface BudgetDistributionChartProps {
	budgetBreakdown: {
		small: number
		medium: number
		large: number
	}
}

// Professional and vibrant color palette
const COLORS = ['#06b6d4', '#8b5cf6', '#3b82f6']

const CustomTooltip = ({
	active,
	payload,
}: TooltipProps<ValueType, NameType>) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload
		return (
			<div className="rounded-lg border bg-white/95 p-3 shadow-lg backdrop-blur-sm">
				<p className="text-sm font-medium text-gray-900">{data.name}</p>
				<p className="text-xs text-gray-600">
					Count: <span className="font-medium">{data.value}</span> (
					{((data.value / data.total) * 100).toFixed(1)}%)
				</p>
			</div>
		)
	}
	return null
}
interface CustomLegendProps {
	payload?: Array<{
		color: string
		value: string
	}>
}

const CustomLegend = ({ payload = [] }: CustomLegendProps) => {
	return (
		<div className="flex justify-center gap-6">
			{payload.map((entry, index) => (
				<div key={`legend-${index}`} className="flex items-center gap-2">
					<div
						className="h-3 w-3 rounded-full"
						style={{ backgroundColor: entry.color }}
					/>
					<span className="text-sm text-gray-600">{entry.value}</span>
				</div>
			))}
		</div>
	)
}

export const BudgetDistributionChart: FC<BudgetDistributionChartProps> = ({
	budgetBreakdown,
}) => {
	const totalProposals = Object.values(budgetBreakdown).reduce(
		(a, b) => a + b,
		0,
	)

	const pieData = [
		{
			name: '100-500 MINA',
			value: budgetBreakdown.small,
			total: totalProposals,
		},
		{
			name: '500-1000 MINA',
			value: budgetBreakdown.medium,
			total: totalProposals,
		},
		{ name: '1000+ MINA', value: budgetBreakdown.large, total: totalProposals },
	]

	return (
		<Card className="h-[420px]">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="space-y-1">
					<CardTitle className="text-base font-medium">
						Budget Distribution
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Distribution of proposals by funding amount
					</p>
				</div>
				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground">
						Total:{' '}
						<span className="font-medium text-foreground">
							{totalProposals}
						</span>
					</p>
					<InfoIcon className="h-4 w-4 text-muted-foreground" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-[320px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={pieData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={false}
								innerRadius={85}
								outerRadius={120}
								paddingAngle={6}
								dataKey="value"
								strokeWidth={2}
								stroke="white"
							>
								{pieData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
										className="transition-all duration-200 hover:opacity-80"
									/>
								))}
							</Pie>
							<Tooltip content={<CustomTooltip />} />
							<Legend
								content={<CustomLegend />}
								verticalAlign="bottom"
								height={36}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
}
