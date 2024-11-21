interface PhaseDate {
  from: Date;
  to: Date;
}

interface PhaseDates {
  fundingRound: PhaseDate;
  consideration: PhaseDate;
  deliberation: PhaseDate;
  voting: PhaseDate;
}

export function validatePhaseDates(dates: PhaseDates): {
  valid: boolean;
  error?: string;
} {
  // Convert all dates to UTC
  const fr = {
    from: new Date(dates.fundingRound.from.toISOString()),
    to: new Date(dates.fundingRound.to.toISOString()),
  };
  const cons = {
    from: new Date(dates.consideration.from.toISOString()),
    to: new Date(dates.consideration.to.toISOString()),
  };
  const del = {
    from: new Date(dates.deliberation.from.toISOString()),
    to: new Date(dates.deliberation.to.toISOString()),
  };
  const vote = {
    from: new Date(dates.voting.from.toISOString()),
    to: new Date(dates.voting.to.toISOString()),
  };

  // Check that all phases have valid from/to dates
  if (fr.from >= fr.to) {
    return {
      valid: false,
      error: "Funding round end date must be after start date",
    };
  }
  if (cons.from >= cons.to) {
    return {
      valid: false,
      error: "Consideration phase end date must be after start date",
    };
  }
  if (del.from >= del.to) {
    return {
      valid: false,
      error: "Deliberation phase end date must be after start date",
    };
  }
  if (vote.from >= vote.to) {
    return {
      valid: false,
      error: "Voting phase end date must be after start date",
    };
  }

  // Check phase order and containment within funding round
  if (cons.from < fr.from) {
    return {
      valid: false,
      error: "Consideration phase must start on or after funding round start",
    };
  }
  if (cons.to >= del.from) {
    return {
      valid: false,
      error: "Consideration phase must end before deliberation phase starts",
    };
  }
  if (del.to >= vote.from) {
    return {
      valid: false,
      error: "Deliberation phase must end before voting phase starts",
    };
  }
  if (vote.to > fr.to) {
    return {
      valid: false,
      error: "Voting phase must end before funding round ends",
    };
  }

  return { valid: true };
}
