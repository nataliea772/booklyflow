import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/server/supabase-auth";
import { getAppointmentById } from "@/lib/supabase/appointments";
import {
  getReviewByAppointmentId,
  submitCustomerReview,
} from "@/lib/supabase/reviews";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type SubmitReviewRequest = {
  appointmentId?: string;
  customerName?: string;
  rating?: number;
  comment?: string | null;
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "Reviews are not available." },
      { status: 503 }
    );
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Reviews are not available." },
      { status: 503 }
    );
  }

  let body: SubmitReviewRequest;
  try {
    body = (await request.json()) as SubmitReviewRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const appointmentId = body.appointmentId?.trim();
  const customerName = body.customerName?.trim();
  const rating = body.rating;

  if (!appointmentId || !customerName || typeof rating !== "number") {
    return NextResponse.json(
      { success: false, error: "Missing required fields." },
      { status: 400 }
    );
  }

  const appointment = await getAppointmentById(supabase, appointmentId);
  if (!appointment) {
    return NextResponse.json(
      { success: false, error: "appointment_not_found" },
      { status: 404 }
    );
  }

  if (appointment.status !== "completed") {
    return NextResponse.json(
      { success: false, error: "appointment_not_completed" },
      { status: 400 }
    );
  }

  const existingReview = await getReviewByAppointmentId(appointmentId);
  if (existingReview) {
    return NextResponse.json(
      { success: false, error: "review_already_exists" },
      { status: 409 }
    );
  }

  const result = await submitCustomerReview({
    appointmentId,
    customerName,
    rating,
    comment: body.comment,
  });

  if (result.error === "duplicate") {
    return NextResponse.json(
      { success: false, error: "review_already_exists" },
      { status: 409 }
    );
  }

  if (!result.review) {
    return NextResponse.json(
      { success: false, error: "submit_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, review: result.review });
}
