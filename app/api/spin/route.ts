import { NextRequest, NextResponse } from 'next/server'
import { spinQuestions, getArcSlots, type Occasion } from '@/lib/questions'

const VALID_OCCASIONS: Occasion[] = ['all', 'date_night', 'team', 'family', 'party']

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lockedParam = searchParams.get('locked')
  const occasionParam = searchParams.get('occasion') as Occasion | null

  // Parse locked questions: "1:abc123,3:def456"
  const locked: Record<string, string> = {}

  if (lockedParam) {
    const pairs = lockedParam.split(',')
    for (const pair of pairs) {
      const [arcPosition, id] = pair.split(':')
      if (arcPosition && id) {
        locked[arcPosition] = id
      }
    }
  }

  const occasion: Occasion =
    occasionParam && VALID_OCCASIONS.includes(occasionParam)
      ? occasionParam
      : 'all'

  const questions = spinQuestions(locked, occasion)
  const arcSlots = getArcSlots()

  return NextResponse.json({
    questions,
    arcSlots,
  })
}
