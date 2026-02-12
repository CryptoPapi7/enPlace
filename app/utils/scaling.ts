// Utility to parse and scale ingredient amounts

export function parseAmount(amountStr: string): { value: number; unit: string; original: string } {
  // Handle ranges like "2-3" or "to taste"
  if (amountStr.toLowerCase().includes('to taste') || amountStr.toLowerCase().includes('as needed')) {
    return { value: 0, unit: amountStr, original: amountStr };
  }
  
  // Handle fractions like "1/2" or "3 1/2"
  const fractionMatch = amountStr.match(/^(\d+)?\s*(\d\/\d+)?\s*(.+)?$/);
  if (fractionMatch) {
    let value = 0;
    const whole = parseInt(fractionMatch[1]) || 0;
    const fraction = fractionMatch[2];
    const unit = (fractionMatch[3] || '').trim();
    
    if (fraction) {
      const [num, den] = fraction.split('/').map(Number);
      value = whole + (num / den);
    } else {
      value = whole;
    }
    
    return { value, unit, original: amountStr };
  }
  
  // Simple number extraction
  const numMatch = amountStr.match(/([\d.]+)/);
  if (numMatch) {
    const value = parseFloat(numMatch[1]);
    const unit = amountStr.replace(numMatch[1], '').trim();
    return { value, unit, original: amountStr };
  }
  
  return { value: 0, unit: amountStr, original: amountStr };
}

export function scaleAmount(amountStr: string, ratio: number): string {
  const parsed = parseAmount(amountStr);
  
  // Don't scale "to taste" or non-numeric amounts
  if (parsed.value === 0 && parsed.original.toLowerCase().includes('taste')) {
    return parsed.original;
  }
  
  if (parsed.value === 0) {
    return parsed.original;
  }
  
  const scaled = parsed.value * ratio;
  
  // Format nicely
  let formatted: string;
  if (scaled < 0.25) {
    formatted = Math.round(scaled * 16) / 16 + ''; // Nearest 1/16
  } else if (scaled < 1) {
    formatted = Math.round(scaled * 8) / 8 + ''; // Nearest 1/8
  } else if (scaled < 10) {
    formatted = Math.round(scaled * 2) / 2 + ''; // Nearest 0.5
  } else {
    formatted = Math.round(scaled) + ''; // Round to whole
  }
  
  // Clean up .0
  formatted = formatted.replace(/\.0$/, '');
  
  if (parsed.unit) {
    return `${formatted} ${parsed.unit}`;
  }
  return formatted;
}

export function scaleServings(baseServings: number, targetServings: number): number {
  return targetServings / baseServings;
}

// Time doesn't scale linearly - cooking 2x food might take 1.3x time
export function scaleTime(baseMinutes: number, ratio: number): number {
  // Prep time scales partially (more to chop, but some parallel work)
  // Cooking time scales less (pot still heats same, just more mass)
  if (ratio <= 1) return baseMinutes;
  
  // Sub-linear scaling: double food = ~1.4x time
  const scalingFactor = 1 + (ratio - 1) * 0.4;
  return Math.round(baseMinutes * scalingFactor);
}
