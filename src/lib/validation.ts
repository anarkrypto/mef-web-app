interface PhaseDate {
  from: Date;
  to: Date;
}

interface PhaseDates {
  fundingRound: PhaseDate;
  submission: PhaseDate;
  consideration: PhaseDate;
  deliberation: PhaseDate;
  voting: PhaseDate;
}

export function validatePhaseDates(dates: PhaseDates): {
  valid: boolean;
  error?: string;
} {
  // Check if each phase's end date is after its start date
  const phases = ['fundingRound', 'submission', 'consideration', 'deliberation', 'voting'] as const;
  for (const phase of phases) {
    if (dates[phase].to <= dates[phase].from) {
      return {
        valid: false,
        error: `${phase.charAt(0).toUpperCase() + phase.slice(1)} end date must be after start date`,
      };
    }
  }

  // Check if all phases are within funding round period
  const fundingRoundStart = dates.fundingRound.from;
  const fundingRoundEnd = dates.fundingRound.to;

  for (const phase of phases.slice(1)) { // Skip fundingRound itself
    if (dates[phase].from < fundingRoundStart || dates[phase].to > fundingRoundEnd) {
      return {
        valid: false,
        error: `${phase.charAt(0).toUpperCase() + phase.slice(1)} phase must be within funding round period`,
      };
    }
  }

  // Check if phases are in correct sequence
  if (dates.submission.to > dates.consideration.from) {
    return {
      valid: false,
      error: 'Submission phase must end before consideration phase starts',
    };
  }

  if (dates.consideration.to > dates.deliberation.from) {
    return {
      valid: false,
      error: 'Consideration phase must end before deliberation phase starts',
    };
  }

  if (dates.deliberation.to > dates.voting.from) {
    return {
      valid: false,
      error: 'Deliberation phase must end before voting phase starts',
    };
  }

  return { valid: true };
}
