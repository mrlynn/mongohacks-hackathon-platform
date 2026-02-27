import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackResponseModel } from "@/lib/db/models/FeedbackResponse";
import "@/lib/db/models/FeedbackFormConfig";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    // Get all events with feedback forms assigned
    const events = await EventModel.find({
      $or: [
        { "feedbackForms.participant": { $exists: true, $ne: null } },
        { "feedbackForms.partner": { $exists: true, $ne: null } }
      ]
    })
    .select("name capacity feedbackForms")
    .lean();

    // Calculate total sent (participants registered for events with feedback forms)
    let totalSent = 0;
    const eventIds = events.map(e => e._id);
    
    if (eventIds.length > 0) {
      const participantCount = await ParticipantModel.countDocuments({
        "registeredEvents.eventId": { $in: eventIds }
      });
      totalSent = participantCount;
    }

    // Get all feedback responses
    const responses = await FeedbackResponseModel.find()
      .populate("formId", "name")
      .lean();
    
    const totalCompleted = responses.length;

    // Calculate NPS from rating/linear_scale questions
    // Assuming NPS questions are 0-10 scale
    const npsScores: number[] = [];
    
    responses.forEach(r => {
      if (r.answers) {
        const answers = r.answers as Record<string, unknown>;
        Object.values(answers).forEach(answer => {
          if (typeof answer === 'number' && answer >= 0 && answer <= 10) {
            npsScores.push(answer);
          }
        });
      }
    });

    const promoters = npsScores.filter(s => s >= 9).length;
    const passives = npsScores.filter(s => s >= 7 && s < 9).length;
    const detractors = npsScores.filter(s => s < 7).length;

    const npsScore = npsScores.length > 0
      ? Math.round(((promoters - detractors) / npsScores.length) * 100)
      : 0;

    // Calculate average ratings by question
    const ratingsByQuestion = new Map<string, number[]>();
    
    responses.forEach(r => {
      if (r.answers) {
        const answers = r.answers as Record<string, unknown>;
        Object.entries(answers).forEach(([qId, answer]) => {
          if (typeof answer === 'number') {
            if (!ratingsByQuestion.has(qId)) {
              ratingsByQuestion.set(qId, []);
            }
            ratingsByQuestion.get(qId)!.push(answer);
          }
        });
      }
    });

    const avgRatings = Array.from(ratingsByQuestion.entries())
      .map(([qId, scores]) => ({
        question: qId.length > 50 ? qId.substring(0, 47) + '...' : qId,
        avgScore: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10); // Top 10 questions

    // Response rate by event
    const byEvent = await Promise.all(
      events.map(async (event) => {
        const eventResponses = await FeedbackResponseModel.countDocuments({
          eventId: event._id
        });
        
        // Get registered participants for this event
        const eventParticipants = await ParticipantModel.countDocuments({
          "registeredEvents.eventId": event._id
        });
        
        const sent = eventParticipants || event.capacity || 0;
        
        return {
          eventName: event.name,
          sent,
          completed: eventResponses,
          responseRate: sent > 0 
            ? Math.round((eventResponses / sent) * 100) 
            : 0
        };
      })
    );

    // Calculate average completion time from responses that have it tracked
    const responsesWithTime = responses.filter(r => r.completionTimeMinutes && r.completionTimeMinutes > 0);
    const avgCompletionTime = responsesWithTime.length > 0
      ? Math.round(
          responsesWithTime.reduce((sum, r) => sum + (r.completionTimeMinutes || 0), 0) /
          responsesWithTime.length
        )
      : 5; // Default to 5 minutes if no tracking data

    // Response breakdown by type
    const participantResponses = responses.filter(r => r.respondentType === 'participant').length;
    const partnerResponses = responses.filter(r => r.respondentType === 'partner').length;

    // Responses over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const responsesByMonth = await FeedbackResponseModel.aggregate([
      {
        $match: {
          submittedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byMonth = responsesByMonth.map(r => ({
      month: `${monthNames[r._id.month - 1]} ${r._id.year}`,
      count: r.count
    }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSent,
          totalCompleted,
          responseRate: totalSent > 0 
            ? Math.round((totalCompleted / totalSent) * 100) 
            : 0,
          avgCompletionTime,
          participantResponses,
          partnerResponses
        },
        nps: {
          promoters,
          passives,
          detractors,
          score: npsScore,
          totalScores: npsScores.length
        },
        avgRatings,
        byEvent: byEvent.sort((a, b) => b.completed - a.completed),
        byMonth
      }
    });
  } catch (error) {
    console.error("GET /api/admin/analytics/feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback analytics" },
      { status: 500 }
    );
  }
}
