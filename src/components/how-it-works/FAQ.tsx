import { FC } from 'react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import type { FundingRound } from '@prisma/client'

// TODO: refactor to rely on default funding rounds types in @/types
export type FundingRoundWithPhases = FundingRound & {
	submissionPhase: {
		startDate: Date
		endDate: Date
	}
	considerationPhase: {
		startDate: Date
		endDate: Date
	}
	deliberationPhase: {
		startDate: Date
		endDate: Date
	}
	votingPhase: {
		startDate: Date
		endDate: Date
	}
}

export interface FAQItem {
	question: string
	answer: string | ((fundingRound: FundingRoundWithPhases) => string)
}

export interface FAQSection {
	title: string
	items: FAQItem[]
}

interface FAQProps {
	sections: FAQSection[]
	selectedFundingRound?: FundingRoundWithPhases | null
}

export const FAQ: FC<FAQProps> = ({ sections, selectedFundingRound }) => {
	const getAnswer = (
		answer: string | ((fundingRound: FundingRoundWithPhases) => string),
	): string => {
		if (typeof answer === 'function' && selectedFundingRound) {
			return answer(selectedFundingRound)
		}
		return answer as string
	}

	return (
		<div className="space-y-8">
			{sections.map((section, sectionIndex) => (
				<div key={sectionIndex} className="space-y-4">
					<h2 className="text-2xl font-semibold tracking-tight">
						{section.title}
					</h2>
					<Accordion type="single" collapsible className="w-full">
						{section.items.map((item, itemIndex) => (
							<AccordionItem
								key={itemIndex}
								value={`item-${sectionIndex}-${itemIndex}`}
							>
								<AccordionTrigger className="text-left hover:text-primary">
									{item.question}
								</AccordionTrigger>
								<AccordionContent className="text-muted-foreground">
									{getAnswer(item.answer)}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			))}
		</div>
	)
}
