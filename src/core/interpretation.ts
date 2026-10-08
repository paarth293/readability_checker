export interface HeadlineScore {
  score: number;
  label: string;
  interpretation: string;
}

export function interpretFleschReadingEase(score: number): HeadlineScore {
  let label = '';
  let interpretation = '';

  if (score >= 90) {
    label = 'Very Easy';
    interpretation = 'Easily understood by an average 11-year-old student.';
  } else if (score >= 80) {
    label = 'Easy';
    interpretation = 'Easy to read. Conversational English for consumers.';
  } else if (score >= 70) {
    label = 'Fairly Easy';
    interpretation = 'Fairly easy to read.';
  } else if (score >= 60) {
    label = 'Standard';
    interpretation = 'Easily understood by 13- to 15-year-old students.';
  } else if (score >= 50) {
    label = 'Fairly Difficult';
    interpretation = 'Fairly difficult to read.';
  } else if (score >= 30) {
    label = 'Difficult';
    interpretation = 'Difficult to read. Best understood by college graduates.';
  } else {
    label = 'Very Difficult';
    interpretation = 'Very difficult to read. Best understood by university graduates.';
  }

  return { score, label, interpretation };
}
