'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQ() {
  const faqs = [
    {
      question: "What is a proposal?",
      answer: "A proposal is a formal plan or suggestion put forward for consideration by others."
    },
    {
      question: "How do I submit a proposal?",
      answer: "To submit a proposal, navigate to the 'Create a proposal' section and follow the guided process to input your project details, funding requirements, and expected outcomes."
    },
    {
      question: "What criteria are used to evaluate proposals?",
      answer: "Proposals are evaluated based on their potential impact, feasibility, alignment with community goals, and the proposer's ability to execute. Specific criteria may vary depending on the funding round."
    },
    {
      question: "When will I receive feedback?",
      answer: "Feedback is typically provided within 2-4 weeks after the proposal submission deadline. You'll receive notifications through the platform and via email."
    },
    {
      question: "Can I make changes to a submitted proposal?",
      answer: "Yes, you can make minor changes to a submitted proposal up until the submission deadline. After that, significant changes may require starting a new proposal."
    },
  ]

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
      <p className="text-muted-foreground mb-4">Quick answers to common questions about the proposal process.</p>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}