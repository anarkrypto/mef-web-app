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
		<Accordion type="single" collapsible className="w-full">
			{sections.map((section, sectionIndex) => (
				<AccordionItem key={sectionIndex} value={`item-${sectionIndex}`}>
					<AccordionTrigger className="text-dark text-left text-xl font-semibold hover:text-primary md:text-2xl">
						{section.title}
					</AccordionTrigger>
					<AccordionContent>
						<ul className="text-dark divide-y divide-muted">
							{section.items.map((item, itemIndex) => (
								<li key={itemIndex} className="list-disc p-4">
									<h4 className="text-lg font-semibold text-muted-foreground md:text-xl">
										{item.question}
									</h4>
									<p>{getAnswer(item.answer)}</p>
								</li>
							))}
						</ul>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	)
}
