'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { ProposalValidation as PV } from '@/constants/validation'
import { useRouter } from 'next/navigation'
import { useFormFeedback } from '@/hooks/use-form-feedback'

// Define the valid field names
type ProposalField = keyof typeof proposalSchema.shape;

const proposalSchema = z.object({
  proposalName: z.string()
    .min(PV.NAME.MIN, PV.NAME.ERROR_MESSAGES.MIN)
    .max(PV.NAME.MAX, PV.NAME.ERROR_MESSAGES.MAX)
    .regex(PV.NAME.PATTERN, PV.NAME.ERROR_MESSAGES.PATTERN),
    
  abstract: z.string()
    .min(PV.ABSTRACT.MIN, PV.ABSTRACT.ERROR_MESSAGES.MIN)
    .max(PV.ABSTRACT.MAX, PV.ABSTRACT.ERROR_MESSAGES.MAX),
    
  motivation: z.string()
    .min(PV.MOTIVATION.MIN, PV.MOTIVATION.ERROR_MESSAGES.MIN)
    .max(PV.MOTIVATION.MAX, PV.MOTIVATION.ERROR_MESSAGES.MAX),
    
  rationale: z.string()
    .min(PV.RATIONALE.MIN, PV.RATIONALE.ERROR_MESSAGES.MIN)
    .max(PV.RATIONALE.MAX, PV.RATIONALE.ERROR_MESSAGES.MAX),
    
  deliveryRequirements: z.string()
    .min(PV.DELIVERY_REQUIREMENTS.MIN, PV.DELIVERY_REQUIREMENTS.ERROR_MESSAGES.MIN)
    .max(PV.DELIVERY_REQUIREMENTS.MAX, PV.DELIVERY_REQUIREMENTS.ERROR_MESSAGES.MAX),
    
  securityAndPerformance: z.string()
    .min(PV.SECURITY_AND_PERFORMANCE.MIN, PV.SECURITY_AND_PERFORMANCE.ERROR_MESSAGES.MIN)
    .max(PV.SECURITY_AND_PERFORMANCE.MAX, PV.SECURITY_AND_PERFORMANCE.ERROR_MESSAGES.MAX),
    
  budgetRequest: z.string()
    .regex(PV.BUDGET_REQUEST.PATTERN, PV.BUDGET_REQUEST.ERROR_MESSAGES.PATTERN)
    .refine(
      (val: string) => parseFloat(val) <= PV.BUDGET_REQUEST.MAX_VALUE, 
      PV.BUDGET_REQUEST.ERROR_MESSAGES.MAX_VALUE
    ),
    
  email: z.string()
    .email(PV.EMAIL.ERROR_MESSAGES.FORMAT)
    .max(PV.EMAIL.MAX, PV.EMAIL.ERROR_MESSAGES.MAX)
})

type ValidationErrors = {
  [key in ProposalField]?: string;
}

interface Props {
  mode?: 'create' | 'edit'
  proposalId?: string
}

export default function CreateProposal({ mode = 'create', proposalId }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    proposalName: '',
    abstract: '',
    motivation: '',
    rationale: '',
    deliveryRequirements: '',
    securityAndPerformance: '',
    budgetRequest: '',
    email: ''
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`)
      if (!response.ok) throw new Error('Failed to fetch proposal')
      const data = await response.json()
      setFormData({
        proposalName: data.proposalName,
        abstract: data.abstract,
        motivation: data.motivation,
        rationale: data.rationale,
        deliveryRequirements: data.deliveryRequirements,
        securityAndPerformance: data.securityAndPerformance,
        budgetRequest: data.budgetRequest.toString(),
        email: data.email
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load proposal",
        variant: "destructive"
      })
      router.push('/proposals')
      }
    }
    if (mode === 'edit' && proposalId) {
      fetchProposal()
    }
  }, [mode, proposalId, router, toast])

  

  const validateField = (name: ProposalField, value: string) => {
    try {
      proposalSchema.shape[name].parse(value)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: error.errors[0].message
        }))
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name as ProposalField, value)
  }

  const { handleSubmit, loading } = useFormFeedback({
    successMessage: mode === 'edit' 
      ? "Proposal updated successfully"
      : "Proposal saved as draft",
    errorMessage: mode === 'edit'
      ? "Failed to update proposal"
      : "Failed to save proposal",
    redirectPath: '/proposals'
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(async () => {
      proposalSchema.parse(formData)

      const url = mode === 'edit' 
        ? `/api/proposals/${proposalId}`
        : '/api/proposals'

      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          throw new Error("Please log in to continue")
        }
        throw new Error(error.message || 'Failed to save proposal')
      }

      return await response.json()
    })
  }

  // Helper function to show remaining characters
  const getRemainingChars = (field: string, maxLength: number) => {
    const length = formData[field as keyof typeof formData].length
    return maxLength - length
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'edit' ? 'Edit Proposal' : 'Create a Proposal'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'edit' 
              ? 'Update your proposal details below'
              : 'To create a proposal, please complete the following fields. All fields are mandatory.'
            }
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="proposalName" className="text-xl font-semibold">
              Proposal Name
            </Label>
            <Input
              id="proposalName"
              name="proposalName"
              value={formData.proposalName}
              onChange={handleInputChange}
              placeholder={`Add the name of the project (${PV.NAME.MIN}-${PV.NAME.MAX} characters)`}
              className={`bg-muted ${errors.proposalName ? 'border-red-500' : ''}`}
              maxLength={PV.NAME.MAX}
            />
            {errors.proposalName && (
              <p className="text-sm text-red-500">{errors.proposalName}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {getRemainingChars('proposalName', PV.NAME.MAX)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="abstract" className="text-xl font-semibold">
              Abstract
            </Label>
            <Textarea
              id="abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleInputChange}
              placeholder={`A multi-sentence summary (${PV.ABSTRACT.MIN}-${PV.ABSTRACT.MAX} characters)`}
              className={`min-h-[100px] bg-muted ${errors.abstract ? 'border-red-500' : ''}`}
              maxLength={PV.ABSTRACT.MAX}
            />
            {errors.abstract && (
              <p className="text-sm text-red-500">{errors.abstract}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {getRemainingChars('abstract', PV.ABSTRACT.MAX)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="motivation" className="text-xl font-semibold">
              Motivation
            </Label>
            <Textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              placeholder={`A multi-sentence explanation (${PV.MOTIVATION.MIN}-${PV.MOTIVATION.MAX} characters)`}
              className={`min-h-[100px] bg-muted ${errors.motivation ? 'border-red-500' : ''}`}
              maxLength={PV.MOTIVATION.MAX}
            />
            {errors.motivation && (
              <p className="text-sm text-red-500">{errors.motivation}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {getRemainingChars('motivation', PV.MOTIVATION.MAX)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="rationale" className="text-xl font-semibold">
              Rationale
            </Label>
            <Textarea
              id="rationale"
              name="rationale"
              value={formData.rationale}
              onChange={handleInputChange}
              placeholder={`Technical approach explanation (${PV.RATIONALE.MIN}-${PV.RATIONALE.MAX} characters)`}
              className={`min-h-[150px] bg-muted ${errors.rationale ? 'border-red-500' : ''}`}
              maxLength={PV.RATIONALE.MAX}
            />
            {errors.rationale && (
              <p className="text-sm text-red-500">{errors.rationale}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {getRemainingChars('rationale', PV.RATIONALE.MAX)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="deliveryRequirements" className="text-xl font-semibold">
              Delivery Requirements
            </Label>
            <Textarea
              id="deliveryRequirements"
              name="deliveryRequirements"
              value={formData.deliveryRequirements}
              onChange={handleInputChange}
              placeholder={`Detailed delivery plan (${PV.DELIVERY_REQUIREMENTS.MIN}-${PV.DELIVERY_REQUIREMENTS.MAX} characters)`}
              className={`min-h-[200px] bg-muted ${errors.deliveryRequirements ? 'border-red-500' : ''}`}
              maxLength={PV.DELIVERY_REQUIREMENTS.MAX}
            />
            {errors.deliveryRequirements && (
              <p className="text-sm text-red-500">{errors.deliveryRequirements}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {getRemainingChars('deliveryRequirements', PV.DELIVERY_REQUIREMENTS.MAX)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="securityAndPerformance" className="text-xl font-semibold">
              Security & Performance Considerations
            </Label>
            <Textarea
              id="securityAndPerformance"
              name="securityAndPerformance"
              value={formData.securityAndPerformance}
              onChange={handleInputChange}
              placeholder={`Security and performance details (${PV.SECURITY_AND_PERFORMANCE.MIN}-${PV.SECURITY_AND_PERFORMANCE.MAX} characters)`}
              className={`min-h-[200px] bg-muted ${errors.securityAndPerformance ? 'border-red-500' : ''}`}
              maxLength={PV.SECURITY_AND_PERFORMANCE.MAX}
            />
            {errors.securityAndPerformance && (
              <p className="text-sm text-red-500">{errors.securityAndPerformance}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {getRemainingChars('securityAndPerformance', PV.SECURITY_AND_PERFORMANCE.MAX)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="budgetRequest" className="text-xl font-semibold">
              Budget Request
            </Label>
            <Input
              id="budgetRequest"
              name="budgetRequest"
              value={formData.budgetRequest}
              onChange={handleInputChange}
              placeholder="Enter amount in MINA (max 1,000,000)"
              className={`bg-muted ${errors.budgetRequest ? 'border-red-500' : ''}`}
            />
            {errors.budgetRequest && (
              <p className="text-sm text-red-500">{errors.budgetRequest}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label htmlFor="email" className="text-xl font-semibold">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your email address"
              className={`bg-muted ${errors.email ? 'border-red-500' : ''}`}
              maxLength={PV.EMAIL.MAX}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="bg-gray-600 text-white hover:bg-gray-700"
              onClick={() => router.push('/proposals')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gray-600 text-white hover:bg-gray-700"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin mr-2">⌛</span>
              ) : null}
              {mode === 'edit' ? 'Update Draft' : 'Save Draft'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Change the export to named export
export { CreateProposal };