export class ProposalValidation {
	static readonly NAME = {
		MIN: 10,
		MAX: 100,
		PATTERN: /^[\w\s.,!?()-]+$/,
		ERROR_MESSAGES: {
			MIN: 'Proposal name must be at least 10 characters',
			MAX: 'Proposal name must not exceed 100 characters',
			PATTERN: 'Invalid characters in proposal name',
		},
	}

	static readonly ABSTRACT = {
		MIN: 100,
		MAX: 1000,
		ERROR_MESSAGES: {
			MIN: 'Abstract must be at least 100 characters',
			MAX: 'Abstract must not exceed 1000 characters',
		},
	}

	static readonly MOTIVATION = {
		MIN: 200,
		MAX: 2000,
		ERROR_MESSAGES: {
			MIN: 'Motivation must be at least 200 characters',
			MAX: 'Motivation must not exceed 2000 characters',
		},
	}

	static readonly RATIONALE = {
		MIN: 300,
		MAX: 3000,
		ERROR_MESSAGES: {
			MIN: 'Rationale must be at least 300 characters',
			MAX: 'Rationale must not exceed 3000 characters',
		},
	}

	static readonly DELIVERY_REQUIREMENTS = {
		MIN: 500,
		MAX: 5000,
		ERROR_MESSAGES: {
			MIN: 'Delivery requirements must be at least 500 characters',
			MAX: 'Delivery requirements must not exceed 5000 characters',
		},
	}

	static readonly SECURITY_AND_PERFORMANCE = {
		MIN: 200,
		MAX: 3000,
		ERROR_MESSAGES: {
			MIN: 'Security considerations must be at least 200 characters',
			MAX: 'Security considerations must not exceed 3000 characters',
		},
	}

	static readonly BUDGET_REQUEST = {
		MAX_VALUE: 1000000,
		PATTERN: /^\d+(\.\d{0,2})?$/,
		ERROR_MESSAGES: {
			PATTERN: 'Invalid budget format. Use numbers with up to 2 decimal places',
			MAX_VALUE: 'Budget cannot exceed 1,000,000 MINA',
		},
	}

	static readonly DISCORD = {
		MIN: 2,
		MAX: 32,
		PATTERN: /^[\w\s]{2,32}(#\d{4})?$/,
		ERROR_MESSAGES: {
			MAX: 'Discord handle cannot exceed 32 characters',
			PATTERN: 'Invalid Discord handle format',
		},
	}

	static readonly EMAIL = {
		MAX: 254,
		ERROR_MESSAGES: {
			FORMAT: 'Invalid email address',
			MAX: 'Email cannot exceed 254 characters',
		},
	}
}
