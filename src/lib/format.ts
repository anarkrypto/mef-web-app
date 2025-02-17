/**
 * Formats a number as MINA currency with 2 decimal places
 */
export const formatMINA = (amount: number): string => {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount)
}
